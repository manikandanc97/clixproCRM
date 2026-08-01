import prisma from "@/lib/prisma";
import { Lead, Task,  Prisma, CustomerStatus, LeadStatus, TaskPriority, TaskStatus, QuotationStatus } from "@prisma/client";
import {
  calculateTrend,
  formatCurrency,
  countInRange,
  getMonthRanges,
  getStatusLabel,
  formatRelativeDate,
  toNumber,
  formatDate,
  formatPercentage,
  PIPELINE_STAGE_LABELS,
  LEAD_STATUS_LABELS
} from "@/lib/crm-formatters";

export class CrmService {
  static async getCustomers(tenantId: string, page = 1, limit = 10, search = "") {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.CustomerWhereInput = { tenantId, deletedAt: null };
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);
    return {
      customers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async createCustomer(tenantId: string, data: { name: string; company: string; email?: string; revenue?: number | string; status?: CustomerStatus }, userId: string) {
    return prisma.customer.create({
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        tenantId,
        revenue: data.revenue || 0,
        status: data.status || "ACTIVE",
        assignedToId: userId,
      } as Prisma.CustomerUncheckedCreateInput,
    });
  }

  static async updateCustomer(tenantId: string, id: string, data: Partial<Prisma.CustomerUpdateInput>) {
    return prisma.customer.update({
      where: { id, tenantId },
      data,
    });
  }

  static async deleteCustomer(tenantId: string, id: string) {
    return prisma.customer.update({
      where: { id, tenantId },
      data: { deletedAt: new Date(), status: "INACTIVE" as const }
    });
  }

  static async getLeads(tenantId: string, currency = "USD", page = 1, limit = 10, search = "", status?: string) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.LeadWhereInput = { tenantId, deletedAt: null };
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (status) where.status = status as LeadStatus;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    const emails = leads.map(l => l.email).filter(Boolean);
    const customers = await prisma.customer.findMany({
      where: { tenantId, email: { in: emails }, deletedAt: null },
      select: { id: true, email: true }
    });
    const customerMap = new Map(customers.map(c => [c.email, c.id]));

    return {
      summary: { total: leads.length },
      leads: leads.map((lead: Lead) => {
        const customerId = lead.email ? customerMap.get(lead.email) : undefined;
        return {
          id: lead.id,
          name: lead.name,
          company: lead.company,
          email: lead.email,
          status: getStatusLabel(LEAD_STATUS_LABELS, lead.status),
          value: formatCurrency(lead.value, currency),
          valueAmount: toNumber(lead.value),
          followUp: formatRelativeDate(lead.followUpAt, { fallback: "Not scheduled" }),
          followUpAt: lead.followUpAt,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          priority: lead.priority,
          probability: lead.probability,
          phone: lead.phone,
          source: lead.source,
          customerId,
          isConverted: !!customerId || lead.status === "WON",
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async createLead(tenantId: string, data: { name: string; company: string; email: string; phone?: string; valueAmount?: number; value?: number | string; status?: LeadStatus; followUpAt?: string | Date | null; priority?: string; probability?: number }) {
    const lead = await prisma.lead.create({
      data: {
        tenantId,
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        value: data.valueAmount || data.value || 0,
        status: data.status || "NEW",
        followUpAt: data.followUpAt ? new Date(data.followUpAt) : null,
        priority: data.priority || "Medium",
        probability: data.probability || 10,
      }
    });
    return lead;
  }

  static async updateLead(tenantId: string, userId: string, id: string, data: Partial<{ name: string; company: string; email: string; phone: string; value: number | string; valueAmount: number; status: LeadStatus; followUpAt: string | Date | null; priority: string; probability: number; wonReason: string; lostReason: string; competitor: string; actualRevenue: number; wonDate: string; notes: string }>) {
    // Determine if status is changing to something new for audit logs
    const existingLead = await prisma.lead.findUnique({
      where: { id, tenantId },
      select: { status: true, name: true }
    });

    const isWon = data.status === "WON";

    const lead = await prisma.lead.update({
      where: { id, tenantId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.company && { company: data.company }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.valueAmount !== undefined && data.value === undefined && { value: data.valueAmount }),
        ...(data.actualRevenue !== undefined && { value: data.actualRevenue }),
        ...(data.status && { status: data.status }),
        ...(data.followUpAt && { followUpAt: new Date(data.followUpAt) }),
        ...(data.priority && { priority: data.priority }),
        ...(data.probability !== undefined && { probability: data.probability }),
        ...(isWon && { probability: 100 }),
        ...(data.wonReason !== undefined && { wonReason: data.wonReason }),
        ...(data.lostReason !== undefined && { lostReason: data.lostReason }),
        ...(data.competitor !== undefined && { competitor: data.competitor }),
      }
    });

    if (existingLead && data.status && existingLead.status !== data.status) {
      // Create Audit Log for status change
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "DEAL_MOVED",
          module: "PIPELINE",
          details: { leadId: id, from: existingLead.status, to: data.status },
        }
      });

      if (isWon) {
        // Convert Lead to Customer if not exists
        let customer = null;
        if (lead.email) {
          customer = await prisma.customer.findFirst({
            where: { tenantId, email: lead.email, deletedAt: null }
          });
        }

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              tenantId,
              name: lead.name,
              company: lead.company,
              email: lead.email,
              assignedToId: lead.assignedToId,
              revenue: lead.value,
              status: "ACTIVE"
            }
          });
          
          await prisma.auditLog.create({
            data: {
              tenantId,
              userId,
              action: "LEAD_CONVERTED",
              module: "PIPELINE",
              details: { leadId: id, customerId: customer.id },
            }
          });
        }
      } else if (existingLead.status === "WON" && !isWon) {
        // Find and soft-delete the associated customer
        if (lead.email) {
          const customer = await prisma.customer.findFirst({
            where: { tenantId, email: lead.email, deletedAt: null }
          });
          
          if (customer) {
            await prisma.customer.update({
              where: { id: customer.id },
              data: { deletedAt: new Date() }
            });
            
            await prisma.auditLog.create({
              data: {
                tenantId,
                userId,
                action: "CUSTOMER_UNCONVERTED",
                module: "PIPELINE",
                details: { leadId: id, customerId: customer.id },
              }
            });
          }
        }
      }
    }

    return lead;
  }

  static async deleteLead(tenantId: string, id: string) {
    const lead = await prisma.lead.delete({
      where: { id, tenantId }
    });
    return lead;
  }

  static async getPipeline(tenantId: string, currency = "USD") {
    const leads = await prisma.lead.findMany({
      where: { tenantId },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });

    const openDeals = leads.filter((lead: Lead) => !["WON", "LOST"].includes(lead.status));
    const closedDeals = leads.filter((lead: Lead) => ["WON", "LOST"].includes(lead.status));
    const wonDeals = leads.filter((lead: Lead) => lead.status === "WON");
    const totalValue = openDeals.reduce((total: number, lead: Lead) => total + toNumber(lead.value), 0);
    const winRate = closedDeals.length ? (wonDeals.length / closedDeals.length) * 100 : 0;

    const items = leads.map((lead: Lead) => {
      const stageLabel = getStatusLabel(PIPELINE_STAGE_LABELS, lead.status);
      const probability = lead.probability;
      
      const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      let temperature = "Warm";
      if (daysSinceUpdate < 3) temperature = "Hot";
      if (daysSinceUpdate > 7) temperature = "Cold";
      
      const isStuck = daysSinceUpdate > 10 && !["Won", "Lost"].includes(stageLabel);
      const priority = lead.priority;
      const expectedCloseDate = new Date(lead.createdAt);
      expectedCloseDate.setDate(expectedCloseDate.getDate() + 30);

      return {
        id: lead.id,
        name: lead.name,
        company: lead.company,
        value: formatCurrency(lead.value, currency),
        valueAmount: toNumber(lead.value),
        followUp: formatRelativeDate(lead.followUpAt, { fallback: "Not scheduled" }),
        followUpAt: lead.followUpAt,
        stage: stageLabel,
        priority,
        probability,
        temperature,
        expectedCloseDate: formatDate(expectedCloseDate),
        activityCount: [lead.createdAt, lead.updatedAt, lead.followUpAt].filter(Boolean).length,
        isStuck,
        aiSummary: `Deal with ${lead.company} is progressing well. ${temperature === "Hot" ? "High engagement detected." : "Follow-up recommended."}`,
        createdAt: lead.createdAt.toISOString(),
      };
    });

    return {
      stats: [
        { title: "Total Value", value: formatCurrency(totalValue, currency), valueAmount: totalValue },
        { title: "Active Deals", value: `${openDeals.length} Deals`, valueAmount: openDeals.length },
        { title: "Win Rate", value: formatPercentage(winRate), valueAmount: winRate },
      ],
      items,
    };
  }

  static async getTasks(tenantId: string, page = 1, limit = 10, search = "") {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.TaskWhereInput = { tenantId, deletedAt: null };
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    const { currentMonthStart, nextMonthStart, previousMonthStart } = getMonthRanges();
    const now = new Date();
    const completedTasks = tasks.filter((task: Task) => task.status === "COMPLETED");
    const openTasks = tasks.filter((task: Task) => task.status !== "COMPLETED");
    const overdueTasks = tasks.filter(
      (task: Task) => task.dueDate && task.dueDate < now && task.status !== "COMPLETED",
    );

    const taskStats = [
      {
        title: "Completed Tasks",
        value: completedTasks.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(completedTasks, (task: Task) => task.updatedAt, currentMonthStart, nextMonthStart),
          countInRange(completedTasks, (task: Task) => task.updatedAt, previousMonthStart, currentMonthStart)
        ),
      },
      {
        title: "Pending Tasks",
        value: openTasks.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(openTasks, (task: Task) => task.createdAt, currentMonthStart, nextMonthStart),
          countInRange(openTasks, (task: Task) => task.createdAt, previousMonthStart, currentMonthStart)
        ),
      },
      {
        title: "Overdue Tasks",
        value: overdueTasks.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(overdueTasks, (task: Task) => task.dueDate!, currentMonthStart, nextMonthStart),
          countInRange(overdueTasks, (task: Task) => task.dueDate!, previousMonthStart, currentMonthStart)
        ),
      },
    ];

    return {
      stats: taskStats,
      tasks: tasks.map((task: Task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        dueDate: formatRelativeDate(task.dueDate, { fallback: "No due date" }),
        dueDateValue: task.dueDate,
        priority: task.priority,
        status: task.status,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async createTask(tenantId: string, data: { title: string; description?: string; dueDate?: string | Date | null; priority?: TaskPriority; status?: TaskStatus }) {
    const task = await prisma.task.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority || "MEDIUM",
        status: data.status || "PENDING",
      }
    });
    return task;
  }

  static async updateTask(tenantId: string, id: string, data: Partial<{ title: string; description: string; dueDate: string | Date | null; priority: TaskPriority; status: TaskStatus }>) {
    const task = await prisma.task.update({
      where: { id, tenantId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
      }
    });
    return task;
  }

  static async deleteTask(tenantId: string, id: string) {
    const task = await prisma.task.update({
      where: { id, tenantId },
      data: { deletedAt: new Date() }
    });
    return task;
  }

  static async createQuotation(tenantId: string, data: { quoteNumber?: string; client: string; amount?: number | string; status?: QuotationStatus; validTill?: string | Date | null }) {
    const quotation = await prisma.quotation.create({
      data: {
        tenantId,
        quoteNumber: data.quoteNumber || `QT-${Date.now().toString().slice(-4)}`,
        client: data.client,
        amount: data.amount || 0,
        status: data.status || "PENDING",
        validTill: data.validTill ? new Date(data.validTill) : null,
      }
    });
    return quotation;
  }

  static async updateQuotation(tenantId: string, id: string, data: Partial<{ client: string; amount: number | string; status: QuotationStatus; validTill: string | Date | null; quoteNumber: string }>) {
    const quotation = await prisma.quotation.update({
      where: { id, tenantId },
      data: {
        ...(data.client && { client: data.client }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status && { status: data.status }),
        ...(data.validTill !== undefined && { validTill: data.validTill ? new Date(data.validTill) : null }),
        ...(data.quoteNumber && { quoteNumber: data.quoteNumber }),
      }
    });
    return quotation;
  }

  static async deleteQuotation(tenantId: string, id: string) {
    const quotation = await prisma.quotation.update({
      where: { id, tenantId },
      data: { deletedAt: new Date() }
    });
    return quotation;
  }

  static async getDashboardData(tenantId: string, currency = "USD") {
    const { currentMonthStart, nextMonthStart, previousMonthStart } = getMonthRanges();

    const [
      totalLeads,
      currentMonthLeads,
      previousMonthLeads,
      currentMonthCustomers,
      previousMonthCustomers,
      currentRevenueAgg,
      previousRevenueAgg,
      totalPendingTasks,
      currentMonthPendingTasks,
      previousMonthPendingTasks,
      recentLeads,
      recentQuotations,
      recentCompletedTasks,
      monthlySalesData,
    ] = await Promise.all([
      prisma.lead.count({ where: { tenantId } }),
      prisma.lead.count({ where: { tenantId, createdAt: { gte: currentMonthStart, lt: nextMonthStart } } }),
      prisma.lead.count({ where: { tenantId, createdAt: { gte: previousMonthStart, lt: currentMonthStart } } }),
      prisma.customer.count({ where: { tenantId, createdAt: { gte: currentMonthStart, lt: nextMonthStart } } }),
      prisma.customer.count({ where: { tenantId, createdAt: { gte: previousMonthStart, lt: currentMonthStart } } }),
      prisma.lead.aggregate({ _sum: { value: true }, where: { tenantId, status: "WON", updatedAt: { gte: currentMonthStart, lt: nextMonthStart } } }),
      prisma.lead.aggregate({ _sum: { value: true }, where: { tenantId, status: "WON", updatedAt: { gte: previousMonthStart, lt: currentMonthStart } } }),
      prisma.task.count({ where: { tenantId, status: { not: "COMPLETED" } } }),
      prisma.task.count({ where: { tenantId, status: { not: "COMPLETED" }, createdAt: { gte: currentMonthStart, lt: nextMonthStart } } }),
      prisma.task.count({ where: { tenantId, status: { not: "COMPLETED" }, createdAt: { gte: previousMonthStart, lt: currentMonthStart } } }),
      prisma.lead.findMany({ where: { tenantId }, select: { id: true, name: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.quotation.findMany({ where: { tenantId }, select: { id: true, client: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.task.findMany({ where: { tenantId, status: "COMPLETED" }, select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.lead.findMany({ where: { tenantId, status: "WON" }, select: { value: true, updatedAt: true, createdAt: true }, orderBy: { updatedAt: "desc" } }),
    ]);

    const currentRevenue = toNumber(currentRevenueAgg._sum.value || 0);
    const previousRevenue = toNumber(previousRevenueAgg._sum.value || 0);

    const dashboardStats = [
      { title: "Total Leads", value: totalLeads.toLocaleString("en-US"), valueAmount: totalLeads, ...calculateTrend(currentMonthLeads, previousMonthLeads) },
      { title: "New Customers", value: currentMonthCustomers.toLocaleString("en-US"), valueAmount: currentMonthCustomers, ...calculateTrend(currentMonthCustomers, previousMonthCustomers) },
      { title: "Revenue", value: formatCurrency(currentRevenue, currency), valueAmount: currentRevenue, ...calculateTrend(currentRevenue, previousRevenue) },
      { title: "Pending Tasks", value: totalPendingTasks.toLocaleString("en-US"), valueAmount: totalPendingTasks, ...calculateTrend(currentMonthPendingTasks, previousMonthPendingTasks) },
    ];

    const recentActivities = [
      ...recentLeads.map(l => ({ id: `lead-${l.id}`, title: `New lead: ${l.name}`, time: l.createdAt })),
      ...recentQuotations.map(q => ({ id: `quote-${q.id}`, title: `Quotation: ${q.client}`, time: q.createdAt })),
      ...recentCompletedTasks.map(t => ({ id: `task-${t.id}`, title: `Completed: ${t.title}`, time: t.updatedAt })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5).map(a => ({
      ...a, time: formatRelativeDate(a.time, { fallback: "Just now" })
    }));

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const salesChartData = months.map(month => ({ name: month, total: 0 }));

    monthlySalesData.forEach(lead => {
      const date = new Date(lead.updatedAt);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        salesChartData[monthIndex].total += toNumber(lead.value);
      }
    });

    return {
      stats: dashboardStats,
      recentActivities,
      salesChartData,
    };
  }

  static async getQuotations(tenantId: string, page = 1, limit = 10, search = "") {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.QuotationWhereInput = { tenantId, deletedAt: null };
    if (search) where.quoteNumber = { contains: search, mode: "insensitive" };

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.quotation.count({ where }),
    ]);
    const approved = quotations.filter((q) => q.status === "APPROVED");
    const pending = quotations.filter((q) => q.status === "PENDING");
    return {
      stats: [
        { title: "Total Quotations", value: quotations.length.toString() },
        { title: "Approved", value: approved.length.toString() },
        { title: "Pending", value: pending.length.toString() },
      ],
      quotations: quotations.map((q) => ({
        id: q.id, 
        quoteId: q.quoteNumber, 
        client: q.client,
        amount: formatCurrency(toNumber(q.amount), "USD"),
        amountValue: toNumber(q.amount),
        status: q.status, 
        validTill: formatDate(q.validTill || new Date()),
        validTillValue: q.validTill ? new Date(q.validTill).toISOString() : null,
        probability: 50,
        viewCount: 0,
        downloadCount: 0,
        lastActivity: formatDate(q.updatedAt || q.createdAt)
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getReports(tenantId: string) {
    const baseWhere: Prisma.LeadWhereInput = { tenantId, deletedAt: null };
    const [totalLeads, wonDeals, lostDeals] = await Promise.all([
      prisma.lead.count({ where: baseWhere }),
      prisma.lead.count({ where: { ...baseWhere, status: "WON" } }),
      prisma.lead.count({ where: { ...baseWhere, status: "LOST" } }),
    ]);
    const openDeals = totalLeads - wonDeals - lostDeals;
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    const wonLeadsThisYear = await prisma.lead.findMany({
      where: { ...baseWhere, status: "WON", updatedAt: { gte: startOfYear } },
      select: { value: true, updatedAt: true }
    });
    
    const revenueChart = months.map(month => ({ name: month, total: 0 }));
    wonLeadsThisYear.forEach(lead => {
      const date = new Date(lead.updatedAt);
      revenueChart[date.getMonth()].total += toNumber(lead.value);
    });

    const [newCount, contactedCount, proposalCount] = await Promise.all([
      prisma.lead.count({ where: { ...baseWhere, status: "NEW" } }),
      prisma.lead.count({ where: { ...baseWhere, status: "CONTACTED" } }),
      prisma.lead.count({ where: { ...baseWhere, status: "PROPOSAL_SENT" } }),
    ]);

    const funnel = [
      { name: "New", value: newCount },
      { name: "Contacted", value: contactedCount },
      { name: "Proposal Sent", value: proposalCount },
      { name: "Won", value: wonDeals }
    ];

    return {
      stats: [
        { title: "Total Leads Generated", value: totalLeads.toString() },
        { title: "Won Deals", value: wonDeals.toString() },
        { title: "Open Deals", value: openDeals.toString() },
      ],
      revenueChart,
      conversionChart: [{ name: "Won", value: wonDeals }, { name: "Lost", value: lostDeals }],
      performance: [
        {
          id: "perf-1",
          name: "Sales Team",
          dealsClosed: wonDeals,
          revenue: `$${wonDeals * 1000}`,
          revenueValue: wonDeals * 1000,
          conversionRate: "45%",
          trend: "+5%",
          trendPositive: true,
        },
        {
          id: "perf-2",
          name: "Marketing Team",
          dealsClosed: lostDeals,
          revenue: `$${lostDeals * 500}`,
          revenueValue: lostDeals * 500,
          conversionRate: "20%",
          trend: "-2%",
          trendPositive: false,
        }
      ],
      funnel,
      activityHeatmap: [],
      insights: [
        { id: "insight-1", type: "revenue", title: "Revenue Trend", description: `You have ${wonDeals} won deals.` }
      ],
      revenueTarget: 100000
    };
  }

  static async getAnalytics(tenantId: string) {
    const leadsWhere: Prisma.LeadWhereInput = { tenantId, deletedAt: null };
    const tasksWhere: Prisma.TaskWhereInput = { tenantId, deletedAt: null };
    const customersWhere: Prisma.CustomerWhereInput = { tenantId, deletedAt: null };
    const [leadsCount, tasksCount, customersCount] = await Promise.all([
      prisma.lead.count({ where: leadsWhere }),
      prisma.task.count({ where: tasksWhere }),
      prisma.customer.count({ where: customersWhere }),
    ]);

    const [newCount, contactedCount, proposalCount, wonCount] = await Promise.all([
      prisma.lead.count({ where: { ...leadsWhere, status: "NEW" } }),
      prisma.lead.count({ where: { ...leadsWhere, status: "CONTACTED" } }),
      prisma.lead.count({ where: { ...leadsWhere, status: "PROPOSAL_SENT" } }),
      prisma.lead.count({ where: { ...leadsWhere, status: "WON" } })
    ]);

    const pipelineStages = [
      { stage: "New Lead", count: newCount, value: 0 },
      { stage: "Contacted", count: contactedCount, value: 0 },
      { stage: "Proposal Sent", count: proposalCount, value: 0 },
      { stage: "Won", count: wonCount, value: 0 }
    ];

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const leadsThisYear = await prisma.lead.findMany({
      where: { ...leadsWhere, createdAt: { gte: startOfYear } },
      select: { status: true, createdAt: true, updatedAt: true, value: true }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const leadsGrowth = months.map(month => ({ name: month, direct: 0, social: 0, referral: 0 }));
    const revenueOverview = months.map(month => ({ name: month, target: 5000, revenue: 0 }));

    leadsThisYear.forEach(lead => {
      const date = new Date(lead.createdAt);
      leadsGrowth[date.getMonth()].direct++;
      if (lead.status === "WON") {
        const wonDate = new Date(lead.updatedAt);
        if (wonDate.getFullYear() === currentYear) {
          revenueOverview[wonDate.getMonth()].revenue += toNumber(lead.value);
        }
      }
    });

    return {
      topStats: [
        { title: "Total Tasks", value: tasksCount.toString(), change: "+5%", positive: true, sparklineData: [{value: 10}, {value: 20}] },
        { title: "Total Leads", value: leadsCount.toString(), change: "+12%", positive: true, sparklineData: [{value: 5}, {value: 15}] },
        { title: "Total Customers", value: customersCount.toString(), change: "-2%", positive: false, sparklineData: [{value: 20}, {value: 18}] }
      ],
      revenueOverview,
      leadsGrowth,
      pipelineStages,
      topAgents: [],
      customerGrowth: [],
      recentActivity: [],
      conversionStats: {
        averageRate: "25",
        qualified: "50",
        won: "12",
        target: "30"
      }
    };
  }

  static async getAiInsights(tenantId: string) {
    const leads = await prisma.lead.findMany({ where: { tenantId, status: "NEW" }, take: 3, orderBy: { createdAt: 'desc' } });
    const tasks = await prisma.task.findMany({ where: { tenantId, status: "PENDING", dueDate: { lt: new Date() } }, take: 2 });
    
    const recommendations = [
      ...leads.map(l => ({
        id: `lead-${l.id}`, type: "opportunity", title: `Reach out to ${l.company}`, description: `New lead created recently. Engage early for higher conversion.`
      })),
      ...tasks.map(t => ({
        id: `task-${t.id}`, type: "risk", title: `Overdue Task: ${t.title}`, description: `This task is overdue. Please complete it ASAP.`
      }))
    ];

    return { 
      stats: [
        { title: "New Opportunities", value: leads.length.toString(), change: "+2%", trend: "up", color: "#10b981", sparklineData: [{value: 0}] },
        { title: "Risks Detected", value: tasks.length.toString(), change: "-1%", trend: "down", color: "#ef4444", sparklineData: [{value: 0}] }
      ], 
      recommendations, 
      alerts: tasks.map(t => ({ id: t.id, message: `Task "${t.title}" is overdue`, severity: "high", time: "Now" })), 
      trends: [], forecastData: [], timeline: [] 
    };
  }

  static async getEmployees(tenantId: string, page = 1, limit = 10) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { memberships: { some: { tenantId } } },
        include: {
          memberships: {
            where: { tenantId },
            select: { role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { memberships: { some: { tenantId } } } }),
    ]);

    return {
      employees: users.map(u => ({ 
        id: u.id, 
        name: u.name || "Unknown User", 
        email: u.email, 
        role: u.memberships[0]?.role?.name || "EMPLOYEE", 
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      })),
      stats: [
        { title: "Total Employees", value: users.length.toString(), change: "+1", positive: true },
        { title: "Active Staff", value: users.length.toString(), change: "+1", positive: true },
        { title: "On Leave", value: "0", change: "0", positive: true }
      ],
      activities: [],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getRoles(_tenantId: string) {
    return {
      roles: [
        { id: "r1", name: "Administrator", key: "ADMIN", membersCount: 2, permissionsCount: 45, description: "Full system access", status: "ACTIVE", createdDate: "2026-01-01T00:00:00.000Z" },
        { id: "r2", name: "Manager", key: "MANAGER", membersCount: 5, permissionsCount: 30, description: "Department management", status: "ACTIVE", createdDate: "2026-01-15T00:00:00.000Z" }
      ],
      stats: [
        { title: "Total Roles", value: "2", change: "0", positive: true }
      ],
      securityLogs: [],
      permissionModules: []
    };
  }


  static async getWorkspace(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    return { name: tenant?.name || "ClixProCRM Workspace" };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getSecuritySettings(_tenantId: string) {
    return {
      activeSessions: [
        { id: "s1", device: "Chrome on Windows", location: "New York, USA", ip: "192.168.1.1", current: true },
        { id: "s2", device: "Safari on iPhone", location: "New York, USA", ip: "192.168.1.2", current: false }
      ],
      loginHistory: [
        { id: "l1", event: "Login successful", date: new Date().toISOString(), status: "SUCCESS" },
        { id: "l2", event: "Failed login attempt", date: new Date(Date.now() - 86400000).toISOString(), status: "FAILED" }
      ],
      twoFactorEnabled: false
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getBillingSettings(_tenantId: string) {
    return {
      plan: "Pro Plan",
      status: "Active",
      modules: [
        { id: "m1", label: "Advanced Analytics", enabled: true },
        { id: "m2", label: "Custom Workflows", enabled: true },
        { id: "m3", label: "API Access", enabled: false }
      ],
      licenseDetails: [
        { id: "l1", label: "License Key", value: "CLIX-PRO-1234-5678" },
        { id: "l2", label: "Valid Until", value: "2026-12-31" },
        { id: "l3", label: "Seats Used", value: "5 / 10" }
      ]
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getIntegrationSettings(_tenantId: string) {
    return {
      integrations: [
        { id: "i1", name: "Google Workspace", description: "Sync contacts and calendar", category: "Productivity", connected: true },
        { id: "i2", name: "Slack", description: "Receive notifications in channels", category: "Communication", connected: false },
        { id: "i3", name: "Mailchimp", description: "Sync leads to mailing lists", category: "Marketing", connected: true }
      ]
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getAiSettings(_tenantId: string) {
    return {
      features: [
        { id: "f1", label: "Smart Reply", description: "AI generated email responses", enabled: true },
        { id: "f2", label: "Lead Scoring", description: "Predict likelihood to close", enabled: true }
      ],
      modules: [
        { id: "m1", label: "GPT-4 Processing", description: "Advanced text generation", enabled: true },
        { id: "m2", label: "Custom Data Training", description: "Train on your data", enabled: false }
      ],
      controls: [
        { id: "c1", label: "Creativity Level", value: 70, badge: "Balanced" },
        { id: "c2", label: "Max Tokens", value: 2000, badge: "Standard" }
      ]
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getNotificationSettings(_tenantId: string) {
    return {
      channels: [
        { id: "ch1", name: "Email Notifications", enabled: true },
        { id: "ch2", name: "Push Notifications", enabled: true },
        { id: "ch3", name: "In-App Alerts", enabled: true }
      ],
      categories: [
        {
          id: "cat1", title: "Leads & Sales",
          notifications: [
            { id: "n1", title: "New Lead Assigned", description: "When a lead is assigned to you", critical: true, enabled: true },
            { id: "n2", title: "Deal Won", description: "When a deal is marked as won", critical: false, enabled: true }
          ]
        },
        {
          id: "cat2", title: "Tasks & Meetings",
          notifications: [
            { id: "n3", title: "Task Due Soon", description: "24 hours before a task is due", critical: true, enabled: true },
            { id: "n4", title: "Meeting Reminder", description: "15 minutes before a meeting", critical: true, enabled: true }
          ]
        }
      ],
      realtimePulseEnabled: true
    };
  }
  
  static async getHotLeads(tenantId: string) {
    const leads = await prisma.lead.findMany({ where: { tenantId, status: "NEW" }, take: 5, orderBy: { createdAt: 'desc' } });
    return leads.map(l => ({ id: l.id, name: l.name, company: l.company, score: 90, value: formatCurrency(toNumber(l.value), "USD") }));
  }

  static async getMeetings(tenantId: string) {
    const meetings = await prisma.meeting.findMany({ where: { tenantId }, take: 5, orderBy: { startTime: 'asc' } });
    return meetings.map((m) => ({ 
      id: m.id, 
      title: m.title, 
      date: formatDate(m.startTime), 
      time: "TBD", 
      location: m.location || "Virtual",
      isOnline: m.isOnline,
      status: "scheduled",
      isToday: false,
      attendees: [],
      color: "#2563eb"
    }));
  }

  static async getNotifications(tenantId: string) {
    const notifications = await prisma.notification.findMany({ where: { tenantId }, take: 5, orderBy: { createdAt: 'desc' } });
    return { notifications: notifications.map((n) => ({ id: n.id, title: n.title, description: n.message, read: n.isRead, time: formatDate(n.createdAt), type: n.type })) };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async bulkImportLeads(
    tenantId: string, 
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leadsData: any[], 
    duplicateStrategy: "skip" | "update" | "create"
  ) {
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const failedRows = [];

    const defaults = {
      status: "NEW" as LeadStatus,
      priority: "Medium",
      probability: 10,
    };

    for (let i = 0; i < leadsData.length; i++) {
      const row = leadsData[i];
      try {
        if (!row.name || !row.email) {
          failed++;
          failedRows.push({ ...row, ErrorReason: "Missing required fields (Name or Email)" });
          continue;
        }

        const existing = await prisma.lead.findFirst({
          where: { tenantId, email: row.email, deletedAt: null }
        });

        if (existing) {
          if (duplicateStrategy === "skip") {
            skipped++;
            continue;
          } else if (duplicateStrategy === "update") {
            await prisma.lead.update({
              where: { id: existing.id },
              data: {
                name: row.name,
                company: row.company || existing.company,
                phone: row.phone || existing.phone,
                value: row.valueAmount !== undefined ? row.valueAmount : (row.value !== undefined ? row.value : existing.value),
                status: row.status || existing.status,
                priority: row.priority || existing.priority,
                probability: row.probability !== undefined ? row.probability : existing.probability,
                assignedToId: row.assignedToId || existing.assignedToId,
              }
            });
            imported++;
          } else if (duplicateStrategy === "create") {
            await prisma.lead.create({
              data: {
                tenantId,
                name: row.name,
                company: row.company || "Unknown Company",
                email: row.email,
                phone: row.phone,
                value: row.valueAmount !== undefined ? row.valueAmount : (row.value || 0),
                status: row.status || defaults.status,
                priority: row.priority || defaults.priority,
                probability: row.probability !== undefined ? row.probability : defaults.probability,
                assignedToId: row.assignedToId || null,
              }
            });
            imported++;
          }
        } else {
          await prisma.lead.create({
            data: {
              tenantId,
              name: row.name,
              company: row.company || "Unknown Company",
              email: row.email,
              phone: row.phone,
              value: row.valueAmount !== undefined ? row.valueAmount : (row.value || 0),
              status: row.status || defaults.status,
              priority: row.priority || defaults.priority,
              probability: row.probability !== undefined ? row.probability : defaults.probability,
              assignedToId: row.assignedToId || null,
            }
          });
          imported++;
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        failed++;
        failedRows.push({ ...row, ErrorReason: err.message || "Database error" });
      }
    }

    if (imported > 0) {
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "BULK_IMPORT_LEADS",
          module: "PIPELINE",
          details: { imported, skipped, failed }
        }
      });
    }

    return { imported, skipped, failed, failedRows };
  }
}
