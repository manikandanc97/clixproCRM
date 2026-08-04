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


export class AnalyticsService {
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
}


