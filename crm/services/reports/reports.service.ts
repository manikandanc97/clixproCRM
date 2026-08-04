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


export class ReportsService {
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
}


