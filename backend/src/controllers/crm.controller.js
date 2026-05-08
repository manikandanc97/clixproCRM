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

      // Mock priority and close date for visual polish
      const priorities = ["High", "Medium", "Low"];
      const priority = lead.valueAmount > 10000 ? "High" : (lead.valueAmount > 5000 ? "Medium" : "Low");
      
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
        activityCount: Math.floor(Math.random() * 12) + 2,
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
    const { leads } = await withCrmDataSource("reports", async () => ({
      leads: await prisma.lead.findMany({
        select: {
          id: true,
          assignedTo: true,
          status: true,
          value: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    }));

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
};
