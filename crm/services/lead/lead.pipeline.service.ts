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


export class LeadPipelineService {
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
        stage: lead.stage,
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
}


