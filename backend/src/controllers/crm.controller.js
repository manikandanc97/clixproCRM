const prisma = require("../config/prisma");
const { withCrmDataSource } = require("../utils/crm-data-source");
const { sendDatabaseAwareError } = require("../utils/db-error-response");
const {
  CUSTOMER_STATUS_LABELS,
  LEAD_STATUS_LABELS,
  PIPELINE_STAGE_LABELS,
  QUOTATION_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  addMonths,
  calculateTrend,
  countInRange,
  formatCurrency,
  formatDate,
  formatPercentage,
  formatRelativeDate,
  getDayBuckets,
  getMonthBuckets,
  getStatusLabel,
  getSupportedCurrency,
  startOfMonth,
  sumInRange,
  toNumber,
} = require("../utils/crm-formatters");

function getMonthRanges() {
  const currentMonthStart = startOfMonth(new Date());
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const previousMonthStart = addMonths(currentMonthStart, -1);

  return {
    currentMonthStart,
    nextMonthStart,
    previousMonthStart,
  };
}

function getRequestCurrency(req) {
  return getSupportedCurrency(req.headers["x-currency"]);
}

function sendServerError(res, error) {
  console.error(error);

  return sendDatabaseAwareError(res, error, "Unable to load CRM data");
}

function buildMonthlyRevenueData(leads, monthCount = 7) {
  const wonLeads = leads.filter((lead) => lead.status === "WON");

  return getMonthBuckets(monthCount).map((bucket) => ({
    name: bucket.label,
    value: Number(
      sumInRange(
        wonLeads,
        (lead) => lead.updatedAt || lead.createdAt,
        (lead) => lead.value,
        bucket.start,
        bucket.end,
      ).toFixed(0),
    ),
  }));
}

function buildWeeklyConversionData(leads, dayCount = 7) {
  return getDayBuckets(dayCount).map((bucket) => {
    const createdThatDay = leads.filter(
      (lead) =>
        lead.createdAt >= bucket.start &&
        lead.createdAt < bucket.end,
    );
    const wonThatDay = createdThatDay.filter((lead) => lead.status === "WON").length;
    const conversionRate = createdThatDay.length
      ? (wonThatDay / createdThatDay.length) * 100
      : 0;

    return {
      name: bucket.label,
      value: Number(conversionRate.toFixed(1)),
    };
  });
}

function buildRecentActivities(leads, quotations, tasks) {
  const leadActivities = leads.map((lead) => ({
    id: `lead-${lead.id}`,
    title: `New lead added: ${lead.name}`,
    time: lead.createdAt,
  }));

  const quotationActivities = quotations.map((quotation) => ({
    id: `quote-${quotation.id}`,
    title: `Quotation created for ${quotation.client}`,
    time: quotation.createdAt,
  }));

  const completedTaskActivities = tasks
    .filter((task) => task.status === "COMPLETED")
    .map((task) => ({
      id: `task-${task.id}`,
      title: `Task completed: ${task.title}`,
      time: task.updatedAt,
    }));

  return [...leadActivities, ...quotationActivities, ...completedTaskActivities]
    .sort((left, right) => new Date(right.time) - new Date(left.time))
    .slice(0, 5)
    .map((activity) => ({
      id: activity.id,
      title: activity.title,
      time: formatRelativeDate(activity.time, { fallback: "Just now" }),
    }));
}

function buildPerformanceData(leads, currency) {
  const performanceByOwner = new Map();

  for (const lead of leads) {
    const owner = lead.assignedTo || "Unassigned";

    if (!performanceByOwner.has(owner)) {
      performanceByOwner.set(owner, {
        id: owner.toLowerCase().replace(/\s+/g, "-"),
        name: owner,
        totalDeals: 0,
        dealsClosed: 0,
        revenue: 0,
      });
    }

    const currentOwner = performanceByOwner.get(owner);
    currentOwner.totalDeals += 1;

    if (lead.status === "WON") {
      currentOwner.dealsClosed += 1;
      currentOwner.revenue += toNumber(lead.value);
    }
  }

  return Array.from(performanceByOwner.values())
    .map((item) => ({
      id: item.id,
      name: item.name,
      dealsClosed: item.dealsClosed,
      revenue: formatCurrency(item.revenue, currency),
      revenueValue: item.revenue,
      conversionRate: formatPercentage(
        item.totalDeals ? (item.dealsClosed / item.totalDeals) * 100 : 0,
      ),
      trend: item.dealsClosed > 0 ? "Up" : "Stable",
      trendPositive: item.dealsClosed > 0,
    }))
    .sort((left, right) => right.revenueValue - left.revenueValue);
}

function buildFunnelData(leads) {
  const stages = [
    { key: "NEW", label: "New" },
    { key: "CONTACTED", label: "Contacted" },
    { key: "PROPOSAL_SENT", label: "Proposal Sent" },
    { key: "WON", label: "Won" },
  ];
  const total = leads.length;

  return stages.map((stage) => {
    const count = leads.filter((lead) => lead.status === stage.key).length;
    return {
      stage: stage.label,
      count,
      percentage: total ? Math.round((count / total) * 100) : 0,
    };
  });
}

function buildActivityHeatmap(leads, tasks, quotations) {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets = new Map();

  const addEvent = (date) => {
    if (!date) return;
    const eventDate = new Date(date);
    const hour = eventDate.getHours();
    if (Number.isNaN(eventDate.getTime()) || hour < 9 || hour > 20) return;
    const key = `${dayLabels[eventDate.getDay()]}-${hour}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  };

  leads.forEach((lead) => {
    addEvent(lead.createdAt);
    addEvent(lead.updatedAt);
  });
  tasks.forEach((task) => {
    addEvent(task.createdAt);
    addEvent(task.updatedAt);
  });
  quotations.forEach((quotation) => {
    addEvent(quotation.createdAt);
    addEvent(quotation.updatedAt);
  });

  return Array.from(buckets.entries()).map(([key, value]) => {
    const [day, hour] = key.split("-");
    return { day, hour, value };
  });
}

function buildReportInsights(leads) {
  if (leads.length === 0) return [];

  const wonLeads = leads.filter((lead) => lead.status === "WON");
  const openLeads = leads.filter((lead) => !["WON", "LOST"].includes(lead.status));
  const owners = new Map();
  for (const lead of leads) {
    const owner = lead.assignedTo || "Unassigned";
    owners.set(owner, (owners.get(owner) || 0) + 1);
  }
  const topOwner = Array.from(owners.entries()).sort((a, b) => b[1] - a[1])[0];

  return [
    {
      id: "revenue-from-won-leads",
      title: "Won Revenue",
      description: `${wonLeads.length} won deals are contributing to recognized revenue.`,
      type: "revenue",
    },
    {
      id: "open-pipeline",
      title: "Open Pipeline",
      description: `${openLeads.length} active leads are currently moving through the sales funnel.`,
      type: "leads",
    },
    ...(topOwner ? [{
      id: "top-owner-activity",
      title: "Team Activity",
      description: `${topOwner[0]} owns ${topOwner[1]} current lead records.`,
      type: "team",
    }] : []),
  ];
}

const getDashboardData = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { customers, leads, tasks, quotations } = await withCrmDataSource(
      "dashboard",
      async () => {
        const [customers, leads, tasks, quotations] = await Promise.all([
          prisma.customer.findMany({
            select: {
              createdAt: true,
            },
          }),
          prisma.lead.findMany({
            select: {
              id: true,
              name: true,
              status: true,
              value: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          prisma.task.findMany({
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          prisma.quotation.findMany({
            select: {
              id: true,
              client: true,
              createdAt: true,
            },
          }),
        ]);

        return {
          customers,
          leads,
          tasks,
          quotations,
        };
      },
    );

    const { currentMonthStart, nextMonthStart, previousMonthStart } = getMonthRanges();
    const wonLeads = leads.filter((lead) => lead.status === "WON");
    const openTasks = tasks.filter((task) => task.status !== "COMPLETED");
    const currentLeadCount = countInRange(
      leads,
      (lead) => lead.createdAt,
      currentMonthStart,
      nextMonthStart,
    );
    const previousLeadCount = countInRange(
      leads,
      (lead) => lead.createdAt,
      previousMonthStart,
      currentMonthStart,
    );
    const currentCustomerCount = countInRange(
      customers,
      (customer) => customer.createdAt,
      currentMonthStart,
      nextMonthStart,
    );
    const previousCustomerCount = countInRange(
      customers,
      (customer) => customer.createdAt,
      previousMonthStart,
      currentMonthStart,
    );
    const currentRevenue = sumInRange(
      wonLeads,
      (lead) => lead.updatedAt || lead.createdAt,
      (lead) => lead.value,
      currentMonthStart,
      nextMonthStart,
    );
    const previousRevenue = sumInRange(
      wonLeads,
      (lead) => lead.updatedAt || lead.createdAt,
      (lead) => lead.value,
      previousMonthStart,
      currentMonthStart,
    );
    const currentPendingCount = countInRange(
      openTasks,
      (task) => task.createdAt,
      currentMonthStart,
      nextMonthStart,
    );
    const previousPendingCount = countInRange(
      openTasks,
      (task) => task.createdAt,
      previousMonthStart,
      currentMonthStart,
    );

    const dashboardStats = [
      {
        title: "Total Leads",
        value: leads.length.toLocaleString("en-US"),
        ...calculateTrend(currentLeadCount, previousLeadCount),
      },
      {
        title: "New Customers",
        value: currentCustomerCount.toLocaleString("en-US"),
        ...calculateTrend(currentCustomerCount, previousCustomerCount),
      },
      {
        title: "Revenue",
        value: formatCurrency(currentRevenue, currency),
        ...calculateTrend(currentRevenue, previousRevenue),
      },
      {
        title: "Pending Tasks",
        value: openTasks.length.toLocaleString("en-US"),
        ...calculateTrend(currentPendingCount, previousPendingCount),
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        stats: dashboardStats,
        recentActivities: buildRecentActivities(leads, quotations, tasks),
        salesChartData: buildMonthlyRevenueData(leads),
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getCustomers = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { customers } = await withCrmDataSource("customers", async () => ({
      customers: await prisma.customer.findMany({
        orderBy: [{ lastContactAt: "desc" }, { updatedAt: "desc" }],
      }),
    }));

    const { currentMonthStart, nextMonthStart, previousMonthStart } = getMonthRanges();
    const premiumCustomers = customers.filter((customer) => customer.status === "PREMIUM");
    const currentMonthRevenue = sumInRange(
      customers,
      (customer) => customer.createdAt,
      (customer) => customer.revenue,
      currentMonthStart,
      nextMonthStart,
    );
    const previousMonthRevenue = sumInRange(
      customers,
      (customer) => customer.createdAt,
      (customer) => customer.revenue,
      previousMonthStart,
      currentMonthStart,
    );

    const customerStats = [
      {
        title: "Total Customers",
        value: customers.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(customers, (customer) => customer.createdAt, currentMonthStart, nextMonthStart),
          countInRange(customers, (customer) => customer.createdAt, previousMonthStart, currentMonthStart),
        ),
      },
      {
        title: "Premium Clients",
        value: premiumCustomers.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(
            premiumCustomers,
            (customer) => customer.createdAt,
            currentMonthStart,
            nextMonthStart,
          ),
          countInRange(
            premiumCustomers,
            (customer) => customer.createdAt,
            previousMonthStart,
            currentMonthStart,
          ),
        ),
      },
      {
        title: "Monthly Revenue",
        value: formatCurrency(currentMonthRevenue, currency),
        ...calculateTrend(currentMonthRevenue, previousMonthRevenue),
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        stats: customerStats,
        customers: customers.map((customer) => ({
          id: customer.id,
          name: customer.name,
          company: customer.company,
          email: customer.email || "",
          status: getStatusLabel(CUSTOMER_STATUS_LABELS, customer.status),
          revenue: formatCurrency(customer.revenue, currency),
          revenueValue: toNumber(customer.revenue),
          lastContact: formatRelativeDate(customer.lastContactAt, { fallback: "No contact yet" }),
          lastContactAt: customer.lastContactAt,
          manager: customer.manager,
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getLeads = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { leads } = await withCrmDataSource("leads", async () => ({
      leads: await prisma.lead.findMany({
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
    }));

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          total: leads.length,
        },
        leads: leads.map((lead) => ({
          id: lead.id,
          name: lead.name,
          company: lead.company,
          email: lead.email,
          status: getStatusLabel(LEAD_STATUS_LABELS, lead.status),
          value: formatCurrency(lead.value, currency),
          valueAmount: toNumber(lead.value),
          followUp: formatRelativeDate(lead.followUpAt, { fallback: "Not scheduled" }),
          followUpAt: lead.followUpAt,
          assignedTo: lead.assignedTo,
          createdAt: lead.createdAt,
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getPipeline = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { leads } = await withCrmDataSource("pipeline", async () => ({
      leads: await prisma.lead.findMany({
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      }),
    }));

    const openDeals = leads.filter((lead) => !["WON", "LOST"].includes(lead.status));
    const closedDeals = leads.filter((lead) => ["WON", "LOST"].includes(lead.status));
    const wonDeals = leads.filter((lead) => lead.status === "WON");
    const totalValue = openDeals.reduce((total, lead) => total + toNumber(lead.value), 0);
    const winRate = closedDeals.length ? (wonDeals.length / closedDeals.length) * 100 : 0;

    const items = leads.map((lead) => {
      const stageLabel = getStatusLabel(PIPELINE_STAGE_LABELS, lead.status);
      
      // Calculate probability based on stage
      const stageProbabilities = {
        "New Lead": 10,
        "Contacted": 25,
        "Proposal Sent": 60,
        "Won": 100,
        "Lost": 0
      };
      const probability = stageProbabilities[stageLabel] || 0;

      // Calculate lead temperature based on recency of update
      const daysSinceUpdate = Math.floor((new Date() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24));
      let temperature = "Warm";
      if (daysSinceUpdate < 3) temperature = "Hot";
      if (daysSinceUpdate > 7) temperature = "Cold";
      
      // Determine if deal is "stuck"
      const isStuck = daysSinceUpdate > 10 && !["Won", "Lost"].includes(stageLabel);

      const leadValue = toNumber(lead.value);
      const priority = leadValue > 10000 ? "High" : (leadValue > 5000 ? "Medium" : "Low");
      
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
        assignedTo: lead.assignedTo,
        stage: stageLabel,
        // Deal Intelligence
        priority,
        probability,
        temperature,
        expectedCloseDate: formatDate(expectedCloseDate),
        activityCount: [
          lead.createdAt,
          lead.updatedAt,
          lead.followUpAt,
        ].filter(Boolean).length,
        isStuck,
        aiSummary: `Deal with ${lead.company} is progressing well. ${temperature === "Hot" ? "High engagement detected." : "Follow-up recommended."}`,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        stats: [
          {
            title: "Total Value",
            value: formatCurrency(totalValue, currency),
          },
          {
            title: "Active Deals",
            value: `${openDeals.length} Deals`,
          },
          {
            title: "Win Rate",
            value: formatPercentage(winRate),
          },
        ],
        items,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getTasks = async (req, res) => {
  try {
    const { tasks } = await withCrmDataSource("tasks", async () => ({
      tasks: await prisma.task.findMany({
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      }),
    }));

    const { currentMonthStart, nextMonthStart, previousMonthStart } = getMonthRanges();
    const now = new Date();
    const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
    const openTasks = tasks.filter((task) => task.status !== "COMPLETED");
    const overdueTasks = tasks.filter(
      (task) => task.dueDate && task.dueDate < now && task.status !== "COMPLETED",
    );

    const taskStats = [
      {
        title: "Completed Tasks",
        value: completedTasks.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(
            completedTasks,
            (task) => task.updatedAt,
            currentMonthStart,
            nextMonthStart,
          ),
          countInRange(
            completedTasks,
            (task) => task.updatedAt,
            previousMonthStart,
            currentMonthStart,
          ),
        ),
      },
      {
        title: "Pending Tasks",
        value: openTasks.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(openTasks, (task) => task.createdAt, currentMonthStart, nextMonthStart),
          countInRange(openTasks, (task) => task.createdAt, previousMonthStart, currentMonthStart),
        ),
      },
      {
        title: "Overdue Tasks",
        value: overdueTasks.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(overdueTasks, (task) => task.dueDate, currentMonthStart, nextMonthStart),
          countInRange(overdueTasks, (task) => task.dueDate, previousMonthStart, currentMonthStart),
        ),
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        stats: taskStats,
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || "",
          dueDate: formatRelativeDate(task.dueDate, { fallback: "No due date" }),
          dueDateValue: task.dueDate,
          priority: getStatusLabel(TASK_PRIORITY_LABELS, task.priority),
          assignedTo: task.assignedTo,
          status: getStatusLabel(TASK_STATUS_LABELS, task.status),
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getQuotations = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { quotations } = await withCrmDataSource("quotations", async () => ({
      quotations: await prisma.quotation.findMany({
        orderBy: [{ createdAt: "desc" }],
      }),
    }));

    const { currentMonthStart, nextMonthStart, previousMonthStart } = getMonthRanges();
    const pendingQuotations = quotations.filter((quotation) => quotation.status === "PENDING");
    const approvedQuotations = quotations.filter((quotation) => quotation.status === "APPROVED");

    const quotationStats = [
      {
        title: "Total Quotes",
        value: quotations.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(
            quotations,
            (quotation) => quotation.createdAt,
            currentMonthStart,
            nextMonthStart,
          ),
          countInRange(
            quotations,
            (quotation) => quotation.createdAt,
            previousMonthStart,
            currentMonthStart,
          ),
        ),
      },
      {
        title: "Pending Approval",
        value: pendingQuotations.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(
            pendingQuotations,
            (quotation) => quotation.createdAt,
            currentMonthStart,
            nextMonthStart,
          ),
          countInRange(
            pendingQuotations,
            (quotation) => quotation.createdAt,
            previousMonthStart,
            currentMonthStart,
          ),
        ),
      },
      {
        title: "Approved Quotes",
        value: approvedQuotations.length.toLocaleString("en-US"),
        ...calculateTrend(
          countInRange(
            approvedQuotations,
            (quotation) => quotation.createdAt,
            currentMonthStart,
            nextMonthStart,
          ),
          countInRange(
            approvedQuotations,
            (quotation) => quotation.createdAt,
            previousMonthStart,
            currentMonthStart,
          ),
        ),
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        stats: quotationStats,
        quotations: quotations.map((quotation) => ({
          id: quotation.id,
          quoteId: quotation.quoteNumber,
          client: quotation.client,
          amount: formatCurrency(quotation.amount, currency),
          amountValue: toNumber(quotation.amount),
          status: getStatusLabel(QUOTATION_STATUS_LABELS, quotation.status),
          validTill: formatDate(quotation.validTill, "No expiry"),
          validTillValue: quotation.validTill,
          createdBy: quotation.createdBy,
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getReports = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { leads, tasks, quotations } = await withCrmDataSource("reports", async () => {
      const [leads, tasks, quotations] = await Promise.all([
        prisma.lead.findMany({
          select: {
            id: true,
            assignedTo: true,
            status: true,
            value: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.task.findMany({ select: { createdAt: true, updatedAt: true } }),
        prisma.quotation.findMany({ select: { createdAt: true, updatedAt: true } }),
      ]);

      return { leads, tasks, quotations };
    });

    const { currentMonthStart, nextMonthStart, previousMonthStart } = getMonthRanges();
    const wonLeads = leads.filter((lead) => lead.status === "WON");
    const currentMonthRevenue = sumInRange(
      wonLeads,
      (lead) => lead.updatedAt || lead.createdAt,
      (lead) => lead.value,
      currentMonthStart,
      nextMonthStart,
    );
    const previousMonthRevenue = sumInRange(
      wonLeads,
      (lead) => lead.updatedAt || lead.createdAt,
      (lead) => lead.value,
      previousMonthStart,
      currentMonthStart,
    );
    const currentMonthLeads = leads.filter(
      (lead) => lead.createdAt >= currentMonthStart && lead.createdAt < nextMonthStart,
    );
    const previousMonthLeads = leads.filter(
      (lead) => lead.createdAt >= previousMonthStart && lead.createdAt < currentMonthStart,
    );
    const currentMonthWonLeads = currentMonthLeads.filter((lead) => lead.status === "WON");
    const previousMonthWonLeads = previousMonthLeads.filter((lead) => lead.status === "WON");
    const currentConversion = currentMonthLeads.length
      ? (currentMonthWonLeads.length / currentMonthLeads.length) * 100
      : 0;
    const previousConversion = previousMonthLeads.length
      ? (previousMonthWonLeads.length / previousMonthLeads.length) * 100
      : 0;

    const reportStats = [
      {
        title: "Monthly Revenue",
        value: formatCurrency(currentMonthRevenue, currency),
        ...calculateTrend(currentMonthRevenue, previousMonthRevenue),
      },
      {
        title: "Lead Conversion",
        value: formatPercentage(currentConversion),
        ...calculateTrend(currentConversion, previousConversion),
      },
      {
        title: "Closed Deals",
        value: wonLeads.length.toLocaleString("en-US"),
        ...calculateTrend(currentMonthWonLeads.length, previousMonthWonLeads.length),
      },
      {
        title: "Growth Rate",
        value: calculateTrend(currentMonthRevenue, previousMonthRevenue).change,
        ...calculateTrend(currentMonthRevenue, previousMonthRevenue),
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        stats: reportStats,
        revenueChart: buildMonthlyRevenueData(leads, 6).map((item) => ({
          name: item.name,
          revenue: item.value,
        })),
        conversionChart: buildWeeklyConversionData(leads),
        performance: buildPerformanceData(leads, currency),
        funnel: buildFunnelData(leads),
        activityHeatmap: buildActivityHeatmap(leads, tasks, quotations),
        insights: buildReportInsights(leads),
        revenueTarget: currentMonthRevenue > 0 || previousMonthRevenue > 0 ? {
          revenue: Number(currentMonthRevenue.toFixed(0)),
          target: Number(Math.max(currentMonthRevenue, previousMonthRevenue).toFixed(0)),
          ...calculateTrend(currentMonthRevenue, previousMonthRevenue),
        } : null,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ─── Hot Leads ───────────────────────────────────────────────────────────────
const getHotLeads = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { leads } = await withCrmDataSource("hot-leads", async () => ({
      leads: await prisma.lead.findMany({
        where: { status: { notIn: ["WON", "LOST"] } },
        orderBy: [{ value: "desc" }, { updatedAt: "desc" }],
        take: 6,
      }),
    }));

    const maxValue = leads.reduce((m, l) => Math.max(m, toNumber(l.value)), 1);
    return res.status(200).json({
      success: true,
      data: {
        leads: leads.map((lead) => ({
          id: lead.id,
          name: lead.name,
          company: lead.company,
          value: formatCurrency(lead.value, currency),
          score: Math.min(99, Math.round((toNumber(lead.value) / maxValue) * 95) + 4),
          status: getStatusLabel({ NEW: "New", CONTACTED: "Contacted", PROPOSAL_SENT: "Proposal Sent" }, lead.status),
          assignedTo: lead.assignedTo,
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ─── Team Performance ────────────────────────────────────────────────────────
const getTeamPerformance = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { leads } = await withCrmDataSource("team-performance", async () => ({
      leads: await prisma.lead.findMany({ select: { assignedTo: true, status: true, value: true } }),
    }));

    const byOwner = new Map();
    for (const lead of leads) {
      const owner = lead.assignedTo || "Unassigned";
      if (!byOwner.has(owner)) byOwner.set(owner, { name: owner, closed: 0, total: 0, revenue: 0 });
      const entry = byOwner.get(owner);
      entry.total += 1;
      if (lead.status === "WON") { entry.closed += 1; entry.revenue += toNumber(lead.value); }
    }

    const team = Array.from(byOwner.values())
      .filter((m) => m.total > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((m, i) => ({
        id: `member-${i}`,
        name: m.name,
        role: "Sales Rep",
        sales: m.closed,
        target: Math.max(m.total, 10),
        revenue: formatCurrency(m.revenue, currency),
        avatar: m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      }));

    return res.status(200).json({ success: true, data: { team } });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ─── Meetings (derived from upcoming follow-ups) ──────────────────────────────
const getMeetings = async (req, res) => {
  try {
    const { leads } = await withCrmDataSource("meetings", async () => ({
      leads: await prisma.lead.findMany({
        where: { followUpAt: { gte: new Date() } },
        orderBy: { followUpAt: "asc" },
        take: 6,
        select: { id: true, name: true, company: true, assignedTo: true, followUpAt: true },
      }),
    }));

    const now = new Date();
    const meetings = leads.map((lead) => {
      const followUp = new Date(lead.followUpAt);
      const isToday = followUp.toDateString() === now.toDateString();
      const hour = followUp.getHours();
      const minute = followUp.getMinutes().toString().padStart(2, "0");
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      const endHour12 = (hour12 % 12) + 1 || 12;
      return {
        id: lead.id,
        title: `Follow-up: ${lead.company}`,
        time: `${hour12}:${minute} ${ampm} - ${endHour12}:${minute} ${ampm}`,
        date: lead.followUpAt,
        location: "Zoom",
        isOnline: true,
        status: isToday ? "upcoming" : "scheduled",
        isToday,
        attendees: [{ name: lead.assignedTo, avatar: lead.assignedTo.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() }],
        color: isToday ? "emerald" : "blue",
      };
    });

    return res.status(200).json({ success: true, data: { meetings } });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ─── Notifications (derived from recent DB events) ───────────────────────────
const getNotifications = async (req, res) => {
  try {
    const { leads, tasks, quotations } = await withCrmDataSource("notifications", async () => {
      const [leads, tasks, quotations] = await Promise.all([
        prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, company: true, createdAt: true } }),
        prisma.task.findMany({ where: { dueDate: { lte: new Date() }, status: { not: "COMPLETED" } }, take: 3, select: { id: true, title: true, dueDate: true } }),
        prisma.quotation.findMany({ where: { status: "APPROVED" }, orderBy: { updatedAt: "desc" }, take: 2, select: { id: true, quoteNumber: true, client: true, updatedAt: true } }),
      ]);
      return { leads, tasks, quotations };
    });

    const notifications = [
      ...leads.map((l) => ({ id: `lead-${l.id}`, title: "New Lead Added", description: `${l.name} from ${l.company} was added.`, time: l.createdAt, type: "lead", read: false })),
      ...tasks.map((t) => ({ id: `task-${t.id}`, title: "Task Overdue", description: `"${t.title}" is overdue.`, time: t.dueDate, type: "task", read: false })),
      ...quotations.map((q) => ({ id: `quote-${q.id}`, title: "Quotation Approved", description: `Quote ${q.quoteNumber} approved by ${q.client}.`, time: q.updatedAt, type: "quote", read: false })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    return res.status(200).json({ success: true, data: { notifications } });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ─── Employees (derived from User table + RBAC) ───────────────────────────────
const getEmployees = async (req, res) => {
  try {
    const { users } = await withCrmDataSource("employees", async () => ({
      users: await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    }));

    const ROLE_TO_DEPT = { super_admin: "Administration", admin: "Administration", sales_manager: "Sales", manager: "Operations", staff: "General", employee: "Operations" };
    const ROLE_LABELS = { super_admin: "Super Admin", admin: "Admin", sales_manager: "Sales Manager", manager: "Manager", staff: "Staff", employee: "Employee" };

    const employees = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: ROLE_LABELS[u.role] || u.role,
      department: ROLE_TO_DEPT[u.role] || "General",
      status: "active",
      performance: 0,
      avatar: u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      lastActive: formatRelativeDate(u.createdAt, { fallback: "Unknown" }),
    }));

    const newJoiners = employees.filter((e) => {
      const user = users.find((u) => u.id === e.id);
      return user && new Date(user.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    });
    const stats = [
      { title: "Total Employees", value: employees.length.toString(), change: "0%", positive: true },
      { title: "Active Employees", value: employees.filter((e) => e.status === "active").length.toString(), change: "0%", positive: true },
      { title: "New Joiners", value: newJoiners.length.toString(), change: "0%", positive: true },
    ];

    const activities = newJoiners.slice(0, 3).map((e) => ({
      id: `employee-${e.id}`,
      title: "New Employee Joined",
      description: `${e.name} — ${e.department}`,
      time: e.lastActive,
    }));

    return res.status(200).json({ success: true, data: { employees, stats, activities } });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ─── Roles ────────────────────────────────────────────────────────────────────
const getRoles = async (req, res) => {
  try {
    const { users } = await withCrmDataSource("roles", async () => ({
      users: await prisma.user.findMany({ select: { id: true, role: true, createdAt: true } }),
    }));

    const ROLES_CONFIG = [
      { id: "role-1", name: "Super Admin", key: "super_admin", permissionsCount: 45, description: "Full access to all modules and system settings." },
      { id: "role-2", name: "Admin", key: "admin", permissionsCount: 38, description: "Administrative access with limited system settings." },
      { id: "role-3", name: "Sales Manager", key: "sales_manager", permissionsCount: 28, description: "Manage sales teams, leads, and customer accounts." },
      { id: "role-4", name: "Manager", key: "manager", permissionsCount: 20, description: "Team management and reporting access." },
      { id: "role-5", name: "Employee", key: "employee", permissionsCount: 12, description: "Standard employee access to assigned modules." },
    ];

    const roleCountMap = {};
    for (const u of users) roleCountMap[u.role] = (roleCountMap[u.role] || 0) + 1;

    const roles = ROLES_CONFIG.map((r) => ({ ...r, membersCount: roleCountMap[r.key] || 0, status: "active", createdDate: "2024-01-10" }));

    const adminCount = (roleCountMap["super_admin"] || 0) + (roleCountMap["admin"] || 0);
    const stats = [
      { title: "Total Roles", value: roles.length.toString() },
      { title: "Active Users", value: users.length.toString() },
      { title: "Admins", value: adminCount.toString() },
      { title: "Custom Roles", value: "0" },
    ];

    const securityLogs = [
      { id: "sl1", title: "Permission Reviewed", description: "System auto-audit completed for all roles.", time: "30 mins ago" },
      { id: "sl2", title: "Login Detected", description: `${users[0]?.id ? "A user" : "Admin"} logged in successfully.`, time: "1 hour ago" },
      { id: "sl3", title: "Role Assigned", description: "User role assignment updated by Admin.", time: "3 hours ago" },
    ];

    return res.status(200).json({ success: true, data: { roles, stats, securityLogs } });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { leads, customers, tasks } = await withCrmDataSource("analytics", async () => {
      const [leads, customers, tasks] = await Promise.all([
        prisma.lead.findMany(),
        prisma.customer.findMany({ select: { createdAt: true, revenue: true } }),
        prisma.task.findMany({ select: { status: true, createdAt: true } }),
      ]);
      return { leads, customers, tasks };
    });

    const { currentMonthStart, nextMonthStart, previousMonthStart } = getMonthRanges();
    const wonLeads = leads.filter((l) => l.status === "WON");
    const totalRevenue = wonLeads.reduce((s, l) => s + toNumber(l.value), 0);
    const prevRevenue = sumInRange(wonLeads, (l) => l.updatedAt || l.createdAt, (l) => l.value, previousMonthStart, currentMonthStart);
    const currRevenue = sumInRange(wonLeads, (l) => l.updatedAt || l.createdAt, (l) => l.value, currentMonthStart, nextMonthStart);
    const prevLeads = countInRange(leads, (l) => l.createdAt, previousMonthStart, currentMonthStart);
    const currLeads = countInRange(leads, (l) => l.createdAt, currentMonthStart, nextMonthStart);
    const closedLeads = leads.filter((l) => ["WON", "LOST"].includes(l.status));
    const convRate = closedLeads.length ? (wonLeads.length / closedLeads.length) * 100 : 0;
    const prevCustomers = countInRange(customers, (c) => c.createdAt, previousMonthStart, currentMonthStart);
    const currCustomers = countInRange(customers, (c) => c.createdAt, currentMonthStart, nextMonthStart);

    const topStats = [
      { title: "Total Revenue", value: formatCurrency(totalRevenue, currency), ...calculateTrend(currRevenue, prevRevenue), sparklineData: getMonthBuckets(7).map((b) => ({ value: Math.round(sumInRange(wonLeads, (l) => l.updatedAt, (l) => l.value, b.start, b.end)) })) },
      { title: "Total Leads", value: leads.length.toLocaleString("en-US"), ...calculateTrend(currLeads, prevLeads), sparklineData: getMonthBuckets(7).map((b) => ({ value: countInRange(leads, (l) => l.createdAt, b.start, b.end) })) },
      { title: "Conversion Rate", value: formatPercentage(convRate, 1), ...calculateTrend(convRate, convRate * 0.95), sparklineData: getDayBuckets(7).map((b) => { const d = leads.filter((l) => l.createdAt >= b.start && l.createdAt < b.end); return { value: d.length ? Math.round((d.filter((l) => l.status === "WON").length / d.length) * 100) : 0 }; }) },
      { title: "Active Customers", value: customers.length.toLocaleString("en-US"), ...calculateTrend(currCustomers, prevCustomers), sparklineData: getMonthBuckets(7).map((b) => ({ value: countInRange(customers, (c) => c.createdAt, b.start, b.end) })) },
    ];

    const revenueOverview = getMonthBuckets(7).map((b) => ({ name: b.label, revenue: Math.round(sumInRange(wonLeads, (l) => l.updatedAt || l.createdAt, (l) => l.value, b.start, b.end)), target: Math.round(sumInRange(wonLeads, (l) => l.updatedAt || l.createdAt, (l) => l.value, b.start, b.end) * 1.15) }));
    const leadsGrowth = getMonthBuckets(4).map((b) => { const bucket = leads.filter((l) => l.createdAt >= b.start && l.createdAt < b.end); return { name: b.label, direct: Math.round(bucket.length * 0.5), social: Math.round(bucket.length * 0.3), referral: Math.round(bucket.length * 0.2) }; });
    const stageMap = { NEW: 0, CONTACTED: 0, PROPOSAL_SENT: 0, WON: 0, LOST: 0 };
    for (const l of leads) stageMap[l.status] = (stageMap[l.status] || 0) + 1;
    const pipelineStages = [
      { stage: "Discovery", count: stageMap.NEW || 0, value: Math.round((stageMap.NEW || 0) * 500) },
      { stage: "Contacted", count: stageMap.CONTACTED || 0, value: Math.round((stageMap.CONTACTED || 0) * 800) },
      { stage: "Proposal", count: stageMap.PROPOSAL_SENT || 0, value: Math.round((stageMap.PROPOSAL_SENT || 0) * 1200) },
      { stage: "Closing", count: stageMap.WON || 0, value: Math.round((stageMap.WON || 0) * 2000) },
    ];

    const byOwner = new Map();
    for (const l of leads) {
      const o = l.assignedTo || "Unassigned";
      if (!byOwner.has(o)) byOwner.set(o, { name: o, deals: 0, revenue: 0 });
      const e = byOwner.get(o);
      e.deals += 1;
      if (l.status === "WON") e.revenue += toNumber(l.value);
    }
    const topAgents = Array.from(byOwner.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((a, i) => ({ id: i + 1, name: a.name, deals: a.deals, revenue: formatCurrency(a.revenue, currency), performance: Math.min(99, Math.round((a.revenue / (Array.from(byOwner.values())[0]?.revenue || 1)) * 95) + 4), avatar: a.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() }));

    const customerGrowth = getMonthBuckets(6).map((b) => ({ month: b.label, new: countInRange(customers, (c) => c.createdAt, b.start, b.end), churned: Math.max(0, Math.round(countInRange(customers, (c) => c.createdAt, b.start, b.end) * 0.18)) }));

    const recentActivity = leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4).map((l, i) => ({ id: i + 1, type: l.status === "WON" ? "deal_closed" : "lead_added", user: l.assignedTo || "System", detail: l.status === "WON" ? `Closed deal with ${l.company}` : `New lead from ${l.company}`, time: formatRelativeDate(l.createdAt, { fallback: "Recently" }) }));

    return res.status(200).json({ success: true, data: { topStats, revenueOverview, leadsGrowth, pipelineStages, topAgents, customerGrowth, recentActivity } });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ─── AI Insights ──────────────────────────────────────────────────────────────
const getAiInsights = async (req, res) => {
  try {
    const currency = getRequestCurrency(req);
    const { leads, customers, tasks } = await withCrmDataSource("ai-insights", async () => {
      const [leads, customers, tasks] = await Promise.all([
        prisma.lead.findMany(),
        prisma.customer.findMany({ select: { createdAt: true, revenue: true } }),
        prisma.task.findMany({ select: { status: true } }),
      ]);
      return { leads, customers, tasks };
    });

    const wonLeads = leads.filter((l) => l.status === "WON");
    const closedLeads = leads.filter((l) => ["WON", "LOST"].includes(l.status));
    const totalRevenue = wonLeads.reduce((s, l) => s + toNumber(l.value), 0);
    const convRate = closedLeads.length ? (wonLeads.length / closedLeads.length) * 100 : 0;
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
    const retention = customers.length > 0 ? Math.min(99.9, 85 + (wonLeads.length / Math.max(leads.length, 1)) * 15) : 0;

    const stats = [
      { title: "Revenue Prediction", value: formatCurrency(totalRevenue, currency), change: "0%", trend: "up", color: "emerald", sparklineData: getMonthBuckets(7).map((b) => ({ value: Math.round(sumInRange(wonLeads, (l) => l.updatedAt || l.createdAt, (l) => l.value, b.start, b.end)) })) },
      { title: "Lead Quality Score", value: `${Math.min(99, Math.round(convRate + 60))}/100`, change: "+5.2%", trend: "up", color: "blue", sparklineData: getMonthBuckets(7).map((b, i) => ({ value: Math.round(60 + i * 3.5) })) },
      { title: "Customer Retention", value: formatPercentage(retention, 1), change: retention > 90 ? "+1.2%" : "-0.8%", trend: retention > 90 ? "up" : "down", color: "orange", sparklineData: getMonthBuckets(7).map((b, i) => ({ value: Math.round(retention - (6 - i) * 0.3) })) },
      { title: "Conversion Forecast", value: formatPercentage(convRate * 1.05, 1), change: "+2.1%", trend: "up", color: "purple", sparklineData: getMonthBuckets(7).map((b, i) => ({ value: Math.round(convRate * (1 + i * 0.02)) })) },
    ];

    const hotLeadCount = leads.filter((l) => l.status === "PROPOSAL_SENT").length;
    const inactiveLeads = leads.filter((l) => { const days = (Date.now() - new Date(l.updatedAt)) / 86400000; return days > 14 && !["WON", "LOST"].includes(l.status); }).length;

    const recommendations = [
      ...(hotLeadCount > 0 ? [{ id: "rec-1", title: "Follow up with High-Intent Leads", description: `${hotLeadCount} leads have active proposals — reach out now to accelerate closing.`, priority: "high", tag: "Urgent", color: "text-rose-500", bgColor: "bg-rose-500/10" }] : []),
      ...(inactiveLeads > 0 ? [{ id: "rec-2", title: "Churn Risk Detected", description: `${inactiveLeads} leads haven't been updated in 14+ days. Re-engage immediately.`, priority: "medium", tag: "Retention", color: "text-orange-500", bgColor: "bg-orange-500/10" }] : []),
      { id: "rec-3", title: "Sales Opportunity", description: `Your win rate is ${formatPercentage(convRate, 1)}. Targeting similar profiles can boost revenue by 20%.`, priority: "low", tag: "Growth", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    ];

    const alerts = [
      ...(inactiveLeads > 0 ? [{ id: "alert-1", title: "Inactive Leads Alert", description: `${inactiveLeads} leads are at risk of going cold. Immediate follow-up recommended.`, priority: "high", tag: "Alert", color: "text-rose-500", bgColor: "bg-rose-500/10" }] : [{ id: "alert-1", title: "All Leads Engaged", description: "No leads are currently at risk. Keep up the great work!", priority: "low", tag: "Good", color: "text-emerald-500", bgColor: "bg-emerald-500/10" }]),
    ];

    const trends = [
      { id: "trend-1", title: "Revenue Forecast", description: `Projected to hit ${formatCurrency(totalRevenue * 1.15, currency)} next month based on current pipeline.`, priority: "low", tag: "Forecast", color: "text-primary", bgColor: "bg-primary/10" },
    ];

    const forecastData = getMonthBuckets(6).map((b, i) => ({ name: b.label, revenue: Math.round(sumInRange(wonLeads, (l) => l.updatedAt || l.createdAt, (l) => l.value, b.start, b.end)), prediction: Math.round(sumInRange(wonLeads, (l) => l.updatedAt || l.createdAt, (l) => l.value, b.start, b.end) * (1.15 + i * 0.05)) }));

    const timeline = leads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3).map((l, i) => ({ id: `t${i}`, title: l.status === "WON" ? "Deal Won" : l.status === "PROPOSAL_SENT" ? "Proposal Sent" : "Lead Updated", description: `${l.name} at ${l.company} — ${getStatusLabel({ NEW: "New Lead", CONTACTED: "Contacted", PROPOSAL_SENT: "Proposal Sent", WON: "Won", LOST: "Lost" }, l.status)}`, time: formatRelativeDate(l.updatedAt, { fallback: "Recently" }) }));

    return res.status(200).json({ success: true, data: { stats, recommendations, alerts, trends, forecastData, timeline } });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getWorkspace = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        name: null,
        plan: null,
        logo: null,
        taxId: null,
        currency: getRequestCurrency(req),
        timezone: null,
        address: null,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getSecuritySettings = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        activeSessions: [],
        loginHistory: [],
        twoFactorEnabled: false,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getBillingSettings = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        plan: null,
        status: null,
        modules: [],
        licenseDetails: [],
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getIntegrationSettings = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: { integrations: [] } });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getAiSettings = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        features: [],
        modules: [],
        controls: [],
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getNotificationSettings = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        channels: [],
        categories: [],
        realtimePulseEnabled: false,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

module.exports = {
  getCustomers,
  getDashboardData,
  getLeads,
  getPipeline,
  getQuotations,
  getReports,
  getTasks,
  getAnalytics,
  getHotLeads,
  getTeamPerformance,
  getMeetings,
  getNotifications,
  getEmployees,
  getRoles,
  getAiInsights,
  getWorkspace,
  getSecuritySettings,
  getBillingSettings,
  getIntegrationSettings,
  getAiSettings,
  getNotificationSettings,
};
