import prisma from "@/lib/prisma";
import { Prisma, Lead, Customer, Quotation, Invoice, Task, PrismaClient, LeadStage, LeadPriority, CustomerStatus, TaskPriority, TaskStatus, QuotationStatus } from "@prisma/client";
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
  static async ensureDatabaseColumns() {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "isConverted" BOOLEAN DEFAULT false;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "customerId" TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "leadId" TEXT;`);
    } catch (_e) {
      // Ignore if columns already exist
    }
  }

  static async cleanupCustomerAnomalies(tenantId: string) {
    try {
      await this.ensureDatabaseColumns();

      return await prisma.$transaction(async (tx) => {
      // 1. Fetch all non-deleted WON leads
      const wonLeads = await tx.lead.findMany({
        where: { tenantId, stage: "WON", deletedAt: null }
      });

      // 2. Fetch all non-deleted customers
      const allCustomers = await tx.customer.findMany({
        where: { tenantId, deletedAt: null }
      });

      // Find duplicate customers (e.g. identical email or identical name+company)
      const seenKeys = new Map<string, string>();
      const duplicateIds: string[] = [];

      for (const cust of allCustomers) {
        const key = (cust.email && cust.email.trim() !== "") 
          ? `email:${cust.email.trim().toLowerCase()}`
          : `name:${cust.name.trim().toLowerCase()}|company:${cust.company.trim().toLowerCase()}`;

        if (seenKeys.has(key)) {
          duplicateIds.push(cust.id);
        } else {
          seenKeys.set(key, cust.id);
        }
      }

      if (duplicateIds.length > 0) {
        await tx.customer.updateMany({
          where: { id: { in: duplicateIds } },
          data: { deletedAt: new Date(), status: "INACTIVE" }
        });
      }

      // 3. For each WON lead, ensure exactly ONE customer exists
      for (const lead of wonLeads) {
        let customer = null;
        if (lead.customerId) {
          customer = await tx.customer.findFirst({
            where: { id: lead.customerId, tenantId, deletedAt: null }
          });
        }
        if (!customer && lead.email && lead.email.trim() !== "") {
          customer = await tx.customer.findFirst({
            where: { tenantId, email: lead.email.trim(), deletedAt: null }
          });
        }
        if (!customer) {
          customer = await tx.customer.findFirst({
            where: { tenantId, name: lead.name.trim(), company: lead.company.trim(), deletedAt: null }
          });
        }

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              tenantId,
              name: lead.name,
              company: lead.company,
              email: lead.email || null,
              revenue: lead.value,
              status: "ACTIVE",
              assignedToId: lead.assignedToId,
              leadId: lead.id
            }
          });
        } else {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              name: lead.name,
              company: lead.company,
              email: lead.email || customer.email,
              revenue: lead.value,
              status: "ACTIVE",
              assignedToId: lead.assignedToId || customer.assignedToId,
              leadId: lead.id,
              deletedAt: null
            }
          });
        }

        // Update lead conversion state
        await tx.lead.update({
          where: { id: lead.id },
          data: {
            isConverted: true,
            convertedAt: lead.convertedAt || new Date(),
            customerId: customer.id
          }
        });
      }

      // 4. Clean up any customers that do NOT have an active WON lead
      const currentWonLeads = await tx.lead.findMany({
        where: { tenantId, stage: "WON", deletedAt: null },
        select: { id: true, customerId: true }
      });
      const validCustomerIds = new Set(currentWonLeads.map(l => l.customerId).filter(Boolean));

      // Reset non-WON leads
      const nonWonLeads = await tx.lead.findMany({
        where: { tenantId, stage: { not: "WON" }, deletedAt: null }
      });

      for (const nonWonLead of nonWonLeads) {
        if (nonWonLead.isConverted || nonWonLead.customerId) {
          if (nonWonLead.customerId && !validCustomerIds.has(nonWonLead.customerId)) {
            await tx.customer.updateMany({
              where: { id: nonWonLead.customerId, deletedAt: null },
              data: { deletedAt: new Date(), status: "INACTIVE" }
            });
          }
          await tx.lead.update({
            where: { id: nonWonLead.id },
            data: {
              isConverted: false,
              convertedAt: null,
              customerId: null
            }
          });
        }
      }
    }, { timeout: 20000, maxWait: 10000 });
    } catch (error) {
      console.error("Cleanup anomalies non-fatal error:", error);
    }
  }

  static async syncWonLeadsToCustomers(tenantId: string) {
    return await this.cleanupCustomerAnomalies(tenantId);
  }

  static async getCustomers(tenantId: string, page = 1, limit = 10, search = "") {
    await this.cleanupCustomerAnomalies(tenantId);

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

  static async logTimeline(tenantId: string, leadId: string, action: string, description: string | null = null, userId?: string) {
    return prisma.timelineEvent.create({
      data: {
        tenantId,
        leadId,
        action,
        description,
        userId
      }
    });
  }

  static async getLeads(tenantId: string, currency = "USD", page = 1, limit = 10, search = "", stage?: string) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.LeadWhereInput = { tenantId, deletedAt: null };
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (stage) where.stage = stage as any;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true, name: true, company: true, email: true, phone: true, source: true,
          stage: true, priority: true, assignedToId: true, value: true, expectedCloseDate: true,
          tags: true, isConverted: true, convertedAt: true, customerId: true, lastActivityAt: true, createdAt: true, updatedAt: true,
          _count: { select: { notes: true, meetings: true } },
          meetings: {
            where: { startTime: { gte: new Date() } },
            orderBy: { startTime: "asc" },
            take: 1,
            select: { startTime: true, title: true }
          }
        }
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
      summary: { total },
      leads: leads.map((lead: any) => {
        const customerId = lead.email ? customerMap.get(lead.email) : undefined;
        return {
          id: lead.id,
          name: lead.name,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          stage: lead.stage,
          status: getStatusLabel(LEAD_STATUS_LABELS, lead.stage),
          priority: lead.priority,
          value: formatCurrency(lead.value, currency),
          valueAmount: toNumber(lead.value),
          expectedCloseDate: lead.expectedCloseDate,
          tags: lead.tags,
          lastActivityAt: lead.lastActivityAt,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          customerId,
          isConverted: !!customerId || lead.stage === "WON",
          notesCount: lead._count?.notes || 0,
          meetingsCount: lead._count?.meetings || 0,
          upcomingMeeting: lead.meetings && lead.meetings.length > 0 ? lead.meetings[0] : null,
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async createLead(tenantId: string, userId: string, data: any) {
    return await prisma.$transaction(async (tx) => {
      const isWon = data.stage === "WON";

      const lead = await tx.lead.create({
        data: {
          tenantId,
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          source: data.source || "Direct",
          stage: data.stage || "NEW",
          priority: data.priority || "MEDIUM",
          value: data.valueAmount || data.value || 0,
          expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
          tags: data.tags || [],
          assignedToId: data.assignedToId || userId,
          createdById: userId,
          isConverted: isWon,
          convertedAt: isWon ? new Date() : null,
        }
      });
      
      await tx.timelineEvent.create({
        data: {
          tenantId,
          leadId: lead.id,
          action: "Lead Created",
          description: `Created lead for ${data.company}`,
          userId
        }
      });

      if (isWon) {
        const customer = await tx.customer.create({
          data: {
            tenantId,
            name: lead.name,
            company: lead.company,
            email: lead.email || null,
            revenue: lead.value,
            status: "ACTIVE",
            assignedToId: lead.assignedToId,
            leadId: lead.id
          }
        });

        const updatedLead = await tx.lead.update({
          where: { id: lead.id },
          data: {
            isConverted: true,
            convertedAt: new Date(),
            customerId: customer.id
          }
        });

        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: lead.id,
            action: "Lead Converted to Customer",
            description: `Lead converted to customer (${customer.name})`,
            userId
          }
        });

        return updatedLead;
      }

      return lead;
    });
  }

  static async updateLead(tenantId: string, userId: string, id: string, data: any) {
    return await prisma.$transaction(async (tx) => {
      const existingLead = await tx.lead.findUnique({
        where: { id, tenantId },
        select: { id: true, stage: true, name: true, company: true, email: true, phone: true, assignedToId: true, customerId: true, isConverted: true }
      });
      if (!existingLead) throw new Error("Lead not found");

      const targetStage = data.stage || existingLead.stage;
      const isWon = targetStage === "WON";
      const wasWon = existingLead.stage === "WON";
      const stageChanged = data.stage && existingLead.stage !== data.stage;

      const lead = await tx.lead.update({
        where: { id, tenantId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.company && { company: data.company }),
          ...(data.email && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.source && { source: data.source }),
          ...(data.value !== undefined && { value: data.value }),
          ...(data.valueAmount !== undefined && data.value === undefined && { value: data.valueAmount }),
          ...(data.stage && { stage: data.stage }),
          ...(data.priority && { priority: data.priority }),
          ...(data.expectedCloseDate !== undefined && { expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null }),
          ...(data.tags && { tags: data.tags }),
          ...(data.assignedToId && { assignedToId: data.assignedToId }),
          updatedById: userId,
          lastActivityAt: new Date()
        }
      });

      if (stageChanged) {
        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: id,
            action: "Stage Changed",
            description: `Moved from ${existingLead.stage} to ${data.stage}`,
            userId
          }
        });
      }

      // Transition to WON
      if (isWon) {
        let customer = null;
        const cid = lead.customerId || existingLead.customerId;
        if (cid) {
          customer = await tx.customer.findFirst({ where: { id: cid, tenantId, deletedAt: null } });
        }
        if (!customer && lead.email && lead.email.trim() !== "") {
          customer = await tx.customer.findFirst({
            where: { tenantId, email: lead.email.trim(), deletedAt: null }
          });
        }
        if (!customer) {
          customer = await tx.customer.findFirst({
            where: { tenantId, name: lead.name.trim(), company: lead.company.trim(), deletedAt: null }
          });
        }

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              tenantId,
              name: lead.name,
              company: lead.company,
              email: lead.email || null,
              revenue: lead.value,
              status: "ACTIVE",
              assignedToId: lead.assignedToId,
              leadId: lead.id
            }
          });
        } else {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              name: lead.name,
              company: lead.company,
              email: lead.email || customer.email,
              revenue: lead.value,
              status: "ACTIVE",
              assignedToId: lead.assignedToId || customer.assignedToId,
              leadId: lead.id,
              deletedAt: null
            }
          });
        }

        const updatedLead = await tx.lead.update({
          where: { id: lead.id },
          data: {
            isConverted: true,
            convertedAt: lead.convertedAt || new Date(),
            customerId: customer.id
          }
        });

        if (stageChanged) {
          await tx.timelineEvent.create({
            data: {
              tenantId,
              leadId: id,
              action: "Lead Converted to Customer",
              description: `Lead converted to customer (${customer.name})`,
              userId
            }
          });

          if (userId) {
            await tx.notification.create({
              data: {
                tenantId,
                userId,
                type: "DEAL_WON",
                title: "Deal Won & Customer Created!",
                message: `Lead ${lead.name} (${lead.company}) was marked as Won and converted to a Customer.`,
                isRead: false
              }
            }).catch(() => {});
          }
        }

        return updatedLead;

      // Transition FROM WON to non-WON (New Lead, Contacted, Proposal Sent, Lost)
      } else if (wasWon && !isWon) {
        const cid = existingLead.customerId || lead.customerId;
        let customer = cid ? await tx.customer.findFirst({ where: { id: cid, tenantId, deletedAt: null } }) : null;
        if (!customer && existingLead.email) {
          customer = await tx.customer.findFirst({
            where: { tenantId, email: existingLead.email, deletedAt: null }
          });
        }
        if (!customer) {
          customer = await tx.customer.findFirst({
            where: { tenantId, name: existingLead.name, company: existingLead.company, deletedAt: null }
          });
        }

        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: { deletedAt: new Date(), status: "INACTIVE" }
          });
        }

        const updatedLead = await tx.lead.update({
          where: { id: lead.id },
          data: {
            isConverted: false,
            convertedAt: null,
            customerId: null
          }
        });

        if (stageChanged) {
          await tx.timelineEvent.create({
            data: {
              tenantId,
              leadId: id,
              action: "Lead Demoted from Won",
              description: `Moved from Won to ${data.stage}. Customer record removed.`,
              userId
            }
          });
        }

        return updatedLead;
      }

      return lead;
    });
  }

  static async deleteLead(tenantId: string, userId: string, id: string) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.lead.findUnique({
        where: { id, tenantId },
        select: { id: true, stage: true, customerId: true, email: true, name: true, company: true }
      });
      if (!existing) throw new Error("Lead not found");

      const lead = await tx.lead.update({
        where: { id, tenantId },
        data: {
          deletedAt: new Date(),
          isConverted: false,
          convertedAt: null,
          customerId: null,
          updatedById: userId,
          lastActivityAt: new Date()
        }
      });

      await tx.timelineEvent.create({
        data: {
          tenantId,
          leadId: id,
          action: "Lead Deleted",
          description: `Lead was softly deleted`,
          userId
        }
      });

      if (existing.stage === "WON" || existing.customerId) {
        const custId = existing.customerId;
        let customer = custId ? await tx.customer.findFirst({ where: { id: custId, tenantId, deletedAt: null } }) : null;
        if (!customer && existing.email) {
          customer = await tx.customer.findFirst({
            where: { tenantId, email: existing.email, deletedAt: null }
          });
        }
        if (!customer) {
          customer = await tx.customer.findFirst({
            where: { tenantId, name: existing.name, company: existing.company, deletedAt: null }
          });
        }

        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: { deletedAt: new Date(), status: "INACTIVE" }
          });
        }
      }

      return lead;
    });
  }

  static async getPipeline(tenantId: string, currency = "USD") {
    const leads = await prisma.lead.findMany({
      where: { tenantId },
      orderBy: [{ stage: "asc" }, { updatedAt: "desc" }],
    });

    const openDeals = leads.filter((lead: Lead) => !["WON", "LOST"].includes(lead.stage));
    const closedDeals = leads.filter((lead: Lead) => ["WON", "LOST"].includes(lead.stage));
    const wonDeals = leads.filter((lead: Lead) => lead.stage === "WON");
    const totalValue = openDeals.reduce((total: number, lead: Lead) => total + toNumber(lead.value), 0);
    const winRate = leads.length ? (wonDeals.length / leads.length) * 100 : 0;

    // Calculate 7-day sparkline and trend data for Active Deals and Win Rate
    const sparklineActiveDeals = [];
    const sparklineWinRate = [];
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const dStart = new Date(todayStart);
      dStart.setDate(dStart.getDate() - i);
      const dEnd = new Date(dStart);
      dEnd.setDate(dEnd.getDate() + 1);

      // Approximation for Active Deals at the end of the day
      const activeDealsOnDay = leads.filter(l => l.createdAt < dEnd && (!["WON", "LOST"].includes(l.stage) || l.updatedAt >= dEnd)).length;
      
      // Cumulative Conversion Rate up to the end of the day
      const leadsUpToDay = leads.filter(l => l.createdAt < dEnd);
      const wonDealsOnDay = leadsUpToDay.filter(l => l.stage === "WON");
      const winRateOnDay = leadsUpToDay.length ? (wonDealsOnDay.length / leadsUpToDay.length) * 100 : 0;

      sparklineActiveDeals.push({ value: activeDealsOnDay });
      sparklineWinRate.push({ value: Math.round(winRateOnDay) });
    }

    // Previous week baseline for trends
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const previousOpenDeals = leads.filter(l => l.createdAt < sevenDaysAgo && (!["WON", "LOST"].includes(l.stage) || l.updatedAt >= sevenDaysAgo)).length;
    const previousClosedDeals = leads.filter(l => ["WON", "LOST"].includes(l.stage) && l.updatedAt < sevenDaysAgo);
    const previousWonDeals = previousClosedDeals.filter(l => l.stage === "WON");
    const previousLeads = leads.filter(l => l.createdAt < sevenDaysAgo);
    const previousWinRate = previousLeads.length ? (previousWonDeals.length / previousLeads.length) * 100 : 0;

    const items = leads.map((lead: Lead) => {
      const stageLabel = getStatusLabel(PIPELINE_STAGE_LABELS, lead.stage);
      const probability = 10;
      
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
        followUp: formatRelativeDate(lead.expectedCloseDate, { fallback: "Not scheduled" }),
        followUpAt: lead.expectedCloseDate,
        stage: stageLabel,
        priority,
        probability,
        temperature,
        expectedCloseDate: formatDate(expectedCloseDate),
        activityCount: [lead.createdAt, lead.updatedAt, lead.expectedCloseDate].filter(Boolean).length,
        isStuck,
        aiSummary: `Deal with ${lead.company} is progressing well. ${temperature === "Hot" ? "High engagement detected." : "Follow-up recommended."}`,
        createdAt: lead.createdAt.toISOString(),
      };
    });

    return {
      stats: [
        { title: "Total Value", value: formatCurrency(totalValue, currency), valueAmount: totalValue },
        { title: "Active Deals", value: `${openDeals.length} Deals`, valueAmount: openDeals.length, sparklineData: sparklineActiveDeals, ...calculateTrend(openDeals.length, previousOpenDeals) },
        { title: "Win Rate", value: formatPercentage(winRate), valueAmount: winRate, sparklineData: sparklineWinRate, ...calculateTrend(winRate, previousWinRate) },
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

  static async getDashboardData(tenantId: string, currency = "USD", timeframe = "month") {
    try {
      this.cleanupCustomerAnomalies(tenantId).catch(() => {});
    } catch (_e) {}

    const now = new Date();
    let currentStart = new Date(now);
    let nextStart = new Date(now);
    let previousStart = new Date(now);
    
    if (timeframe === "today") {
      currentStart.setHours(0, 0, 0, 0);
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 1);
      nextStart = new Date(currentStart);
      nextStart.setDate(nextStart.getDate() + 1);
    } else if (timeframe === "week") {
      currentStart.setDate(currentStart.getDate() - currentStart.getDay());
      currentStart.setHours(0, 0, 0, 0);
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
      nextStart = new Date(currentStart);
      nextStart.setDate(nextStart.getDate() + 7);
    } else if (timeframe === "year") {
      currentStart = new Date(now.getFullYear(), 0, 1);
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      nextStart = new Date(now.getFullYear() + 1, 0, 1);
    } else {
      const ranges = getMonthRanges();
      currentStart = ranges.currentMonthStart;
      previousStart = ranges.previousMonthStart;
      nextStart = ranges.nextMonthStart;
    }
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - now.getDay());
    startOfCurrentWeek.setHours(0, 0, 0, 0);
    
    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

    // Fetch entity datasets in 5 clean queries instead of 21 concurrent roundtrips
    const [allLeads, allCustomers, allTasks, recentQuotations, sessions] = await Promise.all([
      prisma.lead.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, name: true, stage: true, value: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.customer.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, createdAt: true }
      }),
      prisma.task.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, title: true, status: true, createdAt: true, updatedAt: true }
      }),
      prisma.quotation.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, client: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.session.findMany({
        select: { updatedAt: true }
      })
    ]);

    const totalLeads = allLeads.length;
    const currentMonthLeads = allLeads.filter(l => l.createdAt >= currentStart && l.createdAt < nextStart).length;
    const previousMonthLeads = allLeads.filter(l => l.createdAt >= previousStart && l.createdAt < currentStart).length;

    const currentMonthCustomers = allCustomers.filter(c => c.createdAt >= currentStart && c.createdAt < nextStart).length;
    const previousMonthCustomers = allCustomers.filter(c => c.createdAt >= previousStart && c.createdAt < currentStart).length;

    const wonLeads = allLeads.filter(l => l.stage === "WON");
    const currentRevenue = wonLeads.filter(l => l.updatedAt >= currentStart && l.updatedAt < nextStart).reduce((sum, l) => sum + toNumber(l.value), 0);
    const previousRevenue = wonLeads.filter(l => l.updatedAt >= previousStart && l.updatedAt < currentStart).reduce((sum, l) => sum + toNumber(l.value), 0);

    const pendingTasks = allTasks.filter(t => t.status !== "COMPLETED");
    const totalPendingTasks = pendingTasks.length;
    const currentMonthPendingTasks = pendingTasks.filter(t => t.createdAt >= currentStart && t.createdAt < nextStart).length;
    const previousMonthPendingTasks = pendingTasks.filter(t => t.createdAt >= previousStart && t.createdAt < currentStart).length;

    const recentLeads = allLeads.slice(0, 5);
    const recentCompletedTasks = allTasks.filter(t => t.status === "COMPLETED").sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5);
    const currentWeekLeadsData = allLeads.filter(l => l.createdAt >= sevenDaysAgo);

    // Calculate Sparkline Data
    const sparklineRevenue = [];
    const sparklineLeads = [];
    for (let i = 6; i >= 0; i--) {
      const dStart = new Date(todayStart);
      dStart.setDate(dStart.getDate() - i);
      const dEnd = new Date(dStart);
      dEnd.setDate(dEnd.getDate() + 1);
      
      const dayLeads = currentWeekLeadsData.filter(l => l.createdAt >= dStart && l.createdAt < dEnd).length;
      const dayRevenue = wonLeads.filter(l => l.updatedAt >= dStart && l.updatedAt < dEnd).reduce((sum, l) => sum + toNumber(l.value), 0);
      
      sparklineLeads.push({ value: dayLeads });
      sparklineRevenue.push({ value: dayRevenue });
    }

    const dashboardStats = [
      { title: "Total Leads", value: totalLeads.toLocaleString("en-US"), valueAmount: totalLeads, sparklineData: sparklineLeads, ...calculateTrend(currentMonthLeads, previousMonthLeads) },
      { title: "New Customers", value: currentMonthCustomers.toLocaleString("en-US"), valueAmount: currentMonthCustomers, ...calculateTrend(currentMonthCustomers, previousMonthCustomers) },
      { title: "Revenue", value: formatCurrency(currentRevenue, currency), valueAmount: currentRevenue, sparklineData: sparklineRevenue, ...calculateTrend(currentRevenue, previousRevenue) },
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

    wonLeads.forEach(lead => {
      const date = new Date(lead.updatedAt);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        salesChartData[monthIndex].total += toNumber(lead.value);
      }
    });

    const currentWeekLeads = allLeads.filter(l => l.createdAt >= startOfCurrentWeek).length;
    const previousWeekLeads = allLeads.filter(l => l.createdAt >= startOfPreviousWeek && l.createdAt < startOfCurrentWeek).length;

    const liveTrafficToday = sessions.filter(s => s.updatedAt >= todayStart).length;
    const liveTrafficYesterday = sessions.filter(s => s.updatedAt >= yesterdayStart && s.updatedAt < todayStart).length;
    const activeUsersCurrent = sessions.filter(s => s.updatedAt >= fifteenMinutesAgo).length;
    const activeUsersPrevious = sessions.filter(s => s.updatedAt >= thirtyMinutesAgo && s.updatedAt < fifteenMinutesAgo).length;

    const weeklyGrowth = previousWeekLeads > 0 
      ? ((currentWeekLeads - previousWeekLeads) / previousWeekLeads) * 100 
      : (currentWeekLeads > 0 ? 100 : 0);
      
    const liveTrafficGrowth = liveTrafficYesterday > 0
      ? ((liveTrafficToday - liveTrafficYesterday) / liveTrafficYesterday) * 100
      : (liveTrafficToday > 0 ? 100 : 0);
      
    const activeUsersGrowth = activeUsersPrevious > 0
      ? ((activeUsersCurrent - activeUsersPrevious) / activeUsersPrevious) * 100
      : (activeUsersCurrent > 0 ? 100 : 0);

    return {
      stats: dashboardStats,
      recentActivities,
      salesChartData,
      activeUsers: activeUsersCurrent,
      liveTraffic: liveTrafficToday,
      weeklyGrowth: Math.round(weeklyGrowth * 10) / 10,
      liveTrafficGrowth: Math.round(liveTrafficGrowth * 10) / 10,
      activeUsersGrowth: Math.round(activeUsersGrowth * 10) / 10,
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
      prisma.lead.count({ where: { ...baseWhere, stage: "WON" } }),
      prisma.lead.count({ where: { ...baseWhere, stage: "LOST" } }),
    ]);
    const openDeals = totalLeads - wonDeals - lostDeals;
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    const wonLeadsThisYear = await prisma.lead.findMany({
      where: { ...baseWhere, stage: "WON", updatedAt: { gte: startOfYear } },
      select: { value: true, updatedAt: true }
    });
    
    const revenueChart = months.map(month => ({ name: month, total: 0 }));
    wonLeadsThisYear.forEach(lead => {
      const date = new Date(lead.updatedAt);
      revenueChart[date.getMonth()].total += toNumber(lead.value);
    });

    const [newCount, contactedCount, proposalCount] = await Promise.all([
      prisma.lead.count({ where: { ...baseWhere, stage: "NEW" } }),
      prisma.lead.count({ where: { ...baseWhere, stage: "CONTACTED" } }),
      prisma.lead.count({ where: { ...baseWhere, stage: "PROPOSAL_SENT" } }),
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

  static async getAnalytics(tenantId: string, filter?: string) {
    const leadsWhere: Prisma.LeadWhereInput = { tenantId, deletedAt: null };
    const tasksWhere: Prisma.TaskWhereInput = { tenantId, deletedAt: null };
    const customersWhere: Prisma.CustomerWhereInput = { tenantId, deletedAt: null };

    if (filter) {
      const now = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      switch (filter) {
        case "Today":
          break;
        case "Last 7 Days":
          startDate.setDate(now.getDate() - 7);
          break;
        case "This Month":
          startDate.setDate(1);
          break;
      }

      leadsWhere.createdAt = { gte: startDate };
      tasksWhere.createdAt = { gte: startDate };
      customersWhere.createdAt = { gte: startDate };
    }

    const [leadsCount, tasksCount, customersCount] = await Promise.all([
      prisma.lead.count({ where: leadsWhere }),
      prisma.task.count({ where: tasksWhere }),
      prisma.customer.count({ where: customersWhere }),
    ]);

    const [newCount, contactedCount, proposalCount, wonCount] = await Promise.all([
      prisma.lead.count({ where: { ...leadsWhere, stage: "NEW" } }),
      prisma.lead.count({ where: { ...leadsWhere, stage: "CONTACTED" } }),
      prisma.lead.count({ where: { ...leadsWhere, stage: "PROPOSAL_SENT" } }),
      prisma.lead.count({ where: { ...leadsWhere, stage: "WON" } })
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
      select: { stage: true, createdAt: true, updatedAt: true, value: true }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const leadsGrowth = months.map(month => ({ name: month, direct: 0, social: 0, referral: 0 }));
    const revenueOverview = months.map(month => ({ name: month, target: 5000, revenue: 0 }));

    leadsThisYear.forEach(lead => {
      const date = new Date(lead.createdAt);
      leadsGrowth[date.getMonth()].direct++;
      if (lead.stage === "WON") {
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
        lost: "25"
      },
      campaignPerformance: []
    };
  }

  static async getRevenueGrowthData(tenantId: string, filter: string = "Year") {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    let previousStartDate = new Date();
    let previousEndDate = new Date();
    let groupBy: "day" | "month" = "month";

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    switch (filter) {
      case "Today":
        previousStartDate.setDate(now.getDate() - 1);
        previousEndDate = new Date(previousStartDate);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate.setHours(23, 59, 59, 999);
        groupBy = "day";
        break;
      case "Last 7 Days":
        startDate.setDate(now.getDate() - 6);
        previousEndDate = new Date(startDate);
        previousEndDate.setMilliseconds(-1);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 6);
        previousStartDate.setHours(0, 0, 0, 0);
        groupBy = "day";
        break;
      case "Last 30 Days":
        startDate.setDate(now.getDate() - 29);
        previousEndDate = new Date(startDate);
        previousEndDate.setMilliseconds(-1);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 29);
        previousStartDate.setHours(0, 0, 0, 0);
        groupBy = "day";
        break;
      case "This Month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        groupBy = "day";
        break;
      case "Last Month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
        groupBy = "day";
        break;
      case "Quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        previousStartDate = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        previousEndDate = new Date(now.getFullYear(), currentQuarter * 3, 0, 23, 59, 59, 999);
        groupBy = "month";
        break;
      case "Year":
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        groupBy = "month";
        break;
    }

    const [
      currentWonLeads,
      previousWonLeads,
      currentTotalLeads,
      previousTotalLeads
    ] = await Promise.all([
      prisma.lead.findMany({
        where: { tenantId, stage: "WON", updatedAt: { gte: startDate, lte: endDate } },
        select: { value: true, updatedAt: true }
      }),
      prisma.lead.findMany({
        where: { tenantId, stage: "WON", updatedAt: { gte: previousStartDate, lte: previousEndDate } },
        select: { value: true }
      }),
      prisma.lead.count({
        where: { tenantId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.lead.count({
        where: { tenantId, createdAt: { gte: previousStartDate, lte: previousEndDate } }
      })
    ]);

    const currentRevenue = currentWonLeads.reduce((sum, lead) => sum + toNumber(lead.value), 0);
    const previousRevenue = previousWonLeads.reduce((sum, lead) => sum + toNumber(lead.value), 0);
    const currentDeals = currentWonLeads.length;
    const previousDeals = previousWonLeads.length;

    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : (currentRevenue > 0 ? 100 : 0);
    const dealsGrowth = previousDeals > 0 ? ((currentDeals - previousDeals) / previousDeals) * 100 : (currentDeals > 0 ? 100 : 0);

    const averageDealSize = currentDeals > 0 ? currentRevenue / currentDeals : 0;
    const previousAvgDealSize = previousDeals > 0 ? previousRevenue / previousDeals : 0;
    const avgDealSizeGrowth = previousAvgDealSize > 0 ? ((averageDealSize - previousAvgDealSize) / previousAvgDealSize) * 100 : (averageDealSize > 0 ? 100 : 0);

    const conversionRate = currentTotalLeads > 0 ? (currentDeals / currentTotalLeads) * 100 : 0;
    const previousConversionRate = previousTotalLeads > 0 ? (previousDeals / previousTotalLeads) * 100 : 0;
    const conversionRateGrowth = previousConversionRate > 0 ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 : (conversionRate > 0 ? 100 : 0);

    // Chart Data
    let chartData: { name: string; value: number; deals: number }[] = [];

    if (groupBy === "month") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      chartData = months.map(month => ({ name: month, value: 0, deals: 0 }));
      
      currentWonLeads.forEach(lead => {
        const monthIndex = new Date(lead.updatedAt).getMonth();
        chartData[monthIndex].value += toNumber(lead.value);
        chartData[monthIndex].deals += 1;
      });
      
      // If Quarter, only return relevant 3 months
      if (filter === "Quarter") {
        const currentQuarter = Math.floor(startDate.getMonth() / 3);
        chartData = chartData.slice(currentQuarter * 3, currentQuarter * 3 + 3);
      }
    } else {
      // Group by day
      const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const dayMap = new Map();
      
      for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const name = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dayMap.set(d.toDateString(), { name, value: 0, deals: 0 });
      }

      currentWonLeads.forEach(lead => {
        const d = new Date(lead.updatedAt).toDateString();
        if (dayMap.has(d)) {
          const entry = dayMap.get(d);
          entry.value += toNumber(lead.value);
          entry.deals += 1;
        }
      });

      chartData = Array.from(dayMap.values());
    }

    // Calculate chart-specific statistics
    let highestRevenue = 0;
    let bestPerformingMonth = "N/A";
    let totalChartRevenue = 0;
    
    chartData.forEach(dataPoint => {
      totalChartRevenue += dataPoint.value;
      if (dataPoint.value > highestRevenue) {
        highestRevenue = dataPoint.value;
        bestPerformingMonth = dataPoint.name;
      }
    });

    const averageMonthlyRevenue = chartData.length > 0 ? totalChartRevenue / chartData.length : 0;

    return {
      monthlyRevenue: chartData,
      currentRevenue,
      previousRevenue,
      growth: Math.round(revenueGrowth * 10) / 10,
      monthlyDeals: chartData.map(d => ({ name: d.name, deals: d.deals })),
      dealsGrowth: Math.round(dealsGrowth * 10) / 10,
      currentDeals,
      previousDeals,
      averageDealSize,
      avgDealSizeGrowth: Math.round(avgDealSizeGrowth * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
      conversionRateGrowth: Math.round(conversionRateGrowth * 10) / 10,
      
      highestRevenue,
      averageMonthlyRevenue,
      bestPerformingMonth,
    };
  }

  static async getAiInsights(tenantId: string) {
    const leads = await prisma.lead.findMany({ where: { tenantId, stage: "NEW" }, take: 3, orderBy: { createdAt: 'desc' } });
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
    const leads = await prisma.lead.findMany({ where: { tenantId, stage: "NEW" }, take: 5, orderBy: { createdAt: 'desc' } });
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
    return { notifications: notifications.map((n) => ({ id: n.id, title: n.title, description: n.message, read: n.isRead, time: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(), type: n.type })) };
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
      stage: "NEW" as LeadStage,
      priority: "MEDIUM" as LeadPriority,
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
                stage: row.stage || existing.stage,
                priority: row.priority || existing.priority,
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
                stage: row.stage || defaults.stage,
                priority: row.priority || defaults.priority,
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
              stage: row.stage || defaults.stage,
              priority: row.priority || defaults.priority,
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

  // --- Revenue Targets ---
  static async getRevenueTargets(tenantId: string) {
    return prisma.revenueTarget.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createRevenueTarget(tenantId: string, data: any) {
    const isActive = data.isActive !== undefined ? data.isActive : true;
    if (isActive) {
      await prisma.revenueTarget.updateMany({
        where: { tenantId, isActive: true },
        data: { isActive: false },
      });
    }

    return prisma.revenueTarget.create({
      data: {
        tenantId,
        periodType: data.periodType || "MONTHLY",
        value: data.value || 0,
        currency: data.currency || "USD",
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: isActive,
      },
    });
  }

  static async updateRevenueTarget(tenantId: string, id: string, data: any) {
    if (data.isActive) {
      await prisma.revenueTarget.updateMany({
        where: { tenantId, isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    return prisma.revenueTarget.update({
      where: { id, tenantId },
      data: {
        ...(data.periodType && { periodType: data.periodType }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.currency && { currency: data.currency }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  static async deleteRevenueTarget(tenantId: string, id: string) {
    return prisma.revenueTarget.delete({
      where: { id, tenantId },
    });
  }

  static async getRevenueTargetAnalytics(tenantId: string, filters: any = {}) {
    // Determine the active target based on filters or default
    const targets = await prisma.revenueTarget.findMany({
      where: { tenantId, isActive: true },
    });

    let activeTarget = targets.length > 0 ? targets[0] : null;

    if (!activeTarget) {
      return { hasTarget: false, currentRevenue: 0, targetValue: 0, achievementPercentage: 0, trend: null };
    }

    const now = new Date();
    // Default to target dates if no timeframe provided, otherwise we'd parse timeframe
    // For simplicity, we'll use the target's configured dates for "current period"
    // Or if a specific filter like "this-month" is applied, we override the period.
    let start = new Date(activeTarget.startDate);
    let end = new Date(activeTarget.endDate);
    let prevStart = new Date(start);
    let prevEnd = new Date(end);
    
    // Simple previous period calculation (e.g. subtract month if monthly)
    if (activeTarget.periodType === "MONTHLY") {
      prevStart.setMonth(prevStart.getMonth() - 1);
      prevEnd.setMonth(prevEnd.getMonth() - 1);
    } else if (activeTarget.periodType === "QUARTERLY") {
      prevStart.setMonth(prevStart.getMonth() - 3);
      prevEnd.setMonth(prevEnd.getMonth() - 3);
    } else if (activeTarget.periodType === "YEARLY") {
      prevStart.setFullYear(prevStart.getFullYear() - 1);
      prevEnd.setFullYear(prevEnd.getFullYear() - 1);
    }

    const leadWhere: Prisma.LeadWhereInput = {
      tenantId,
      stage: "WON",
      deletedAt: null,
    };

    if (filters.employee && filters.employee !== "all" && filters.employee !== "me") {
      leadWhere.assignedToId = filters.employee;
    }

    const currentRevenueAgg = await prisma.lead.aggregate({
      _sum: { value: true },
      where: {
        ...leadWhere,
        updatedAt: { gte: start, lte: end },
      },
    });

    const previousRevenueAgg = await prisma.lead.aggregate({
      _sum: { value: true },
      where: {
        ...leadWhere,
        updatedAt: { gte: prevStart, lte: prevEnd },
      },
    });

    const currentRevenue = toNumber(currentRevenueAgg._sum.value || 0);
    const previousRevenue = toNumber(previousRevenueAgg._sum.value || 0);
    const targetValue = toNumber(activeTarget.value);

    let achievementPercentage = 0;
    if (targetValue > 0) {
      achievementPercentage = Math.round((currentRevenue / targetValue) * 100);
    }

    let trend = 0;
    let trendDirection = "neutral";
    if (previousRevenue > 0) {
      trend = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100 * 10) / 10;
      if (trend > 0) trendDirection = "up";
      if (trend < 0) trendDirection = "down";
    } else if (currentRevenue > 0) {
      trend = 100;
      trendDirection = "up";
    }

    return {
      hasTarget: true,
      target: activeTarget,
      currentRevenue,
      previousRevenue,
      targetValue,
      achievementPercentage,
      trend: {
        value: Math.abs(trend),
        direction: trendDirection,
        label: `${Math.abs(trend)}% vs last period`,
      },
    };
  }

  // ─── LEAD NOTES ────────────────────────────────────────────────────────────
  static async getLeadNotes(tenantId: string, leadId: string) {
    return prisma.note.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createLeadNote(tenantId: string, leadId: string, userId: string, data: { message: string, isPinned?: boolean, mentions?: any }) {
    return prisma.note.create({
      data: {
        tenantId,
        leadId,
        userId,
        message: data.message,
        isPinned: data.isPinned || false,
        mentions: data.mentions || null
      },
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }

  static async updateLeadNote(tenantId: string, noteId: string, data: { message?: string, isPinned?: boolean }) {
    return prisma.note.update({
      where: { id: noteId, tenantId },
      data,
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }

  static async deleteLeadNote(tenantId: string, noteId: string) {
    return prisma.note.delete({
      where: { id: noteId, tenantId }
    });
  }

  // ─── LEAD TIMELINE ──────────────────────────────────────────────────────────
  static async getLeadTimeline(tenantId: string, leadId: string) {
    return prisma.timelineEvent.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createTimelineEvent(tenantId: string, leadId: string, action: string, description?: string, userId?: string) {
    return prisma.timelineEvent.create({
      data: {
        tenantId,
        leadId,
        userId,
        action,
        description
      },
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }

  // ─── LEAD ATTACHMENTS ───────────────────────────────────────────────────────
  static async getLeadAttachments(tenantId: string, leadId: string) {
    return prisma.attachment.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createLeadAttachment(tenantId: string, leadId: string, userId: string, data: { fileName: string, fileUrl: string, fileSize: number, fileType: string }) {
    return prisma.attachment.create({
      data: {
        tenantId,
        leadId,
        userId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType
      },
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }

  static async deleteLeadAttachment(tenantId: string, attachmentId: string) {
    return prisma.attachment.delete({
      where: { id: attachmentId, tenantId }
    });
  }

  // ─── LEAD MEETINGS ──────────────────────────────────────────────────────────
  static async getLeadMeetings(tenantId: string, leadId: string) {
    return prisma.meeting.findMany({
      where: { tenantId, leadId },
      include: {
        assignedTo: { select: { name: true, email: true, id: true } }
      },
      orderBy: { startTime: "desc" }
    });
  }
}
