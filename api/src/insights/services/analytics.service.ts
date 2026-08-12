import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { toNumber } from '../../common/utils/crm-formatters.util';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(tenantId: string, filter?: string) {
    const now = new Date();
    let currentStart = new Date(now);
    currentStart.setHours(0, 0, 0, 0);
    let previousStart = new Date(currentStart);
    let periodDays = 7;

    if (filter) {
      switch (filter) {
        case 'Today':
          periodDays = 1;
          break;
        case 'Last 7 Days':
          currentStart = new Date(now);
          currentStart.setDate(now.getDate() - 6);
          currentStart.setHours(0, 0, 0, 0);
          periodDays = 7;
          break;
        case 'This Month':
          currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
          periodDays = now.getDate();
          break;
        default:
          periodDays = 7;
      }
    }

    previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - periodDays);

    const leadsBaseWhere: Prisma.LeadWhereInput = { tenantId, deletedAt: null };
    const tasksBaseWhere: Prisma.TaskWhereInput = { tenantId, deletedAt: null };
    const customersBaseWhere: Prisma.CustomerWhereInput = {
      tenantId,
      deletedAt: null,
    };

    const currentLeadsWhere: Prisma.LeadWhereInput = {
      ...leadsBaseWhere,
      createdAt: { gte: currentStart, lte: now },
    };
    const previousLeadsWhere: Prisma.LeadWhereInput = {
      ...leadsBaseWhere,
      createdAt: { gte: previousStart, lt: currentStart },
    };
    const currentTasksWhere: Prisma.TaskWhereInput = {
      ...tasksBaseWhere,
      createdAt: { gte: currentStart, lte: now },
    };
    const previousTasksWhere: Prisma.TaskWhereInput = {
      ...tasksBaseWhere,
      createdAt: { gte: previousStart, lt: currentStart },
    };
    const currentCustomersWhere: Prisma.CustomerWhereInput = {
      ...customersBaseWhere,
      createdAt: { gte: currentStart, lte: now },
    };
    const previousCustomersWhere: Prisma.CustomerWhereInput = {
      ...customersBaseWhere,
      createdAt: { gte: previousStart, lt: currentStart },
    };

    const [
      leadsCount,
      previousLeadsCount,
      tasksCount,
      previousTasksCount,
      customersCount,
      previousCustomersCount,
      stageCounts,
      revenueTargetRecord,
    ] = await Promise.all([
      this.prisma.lead.count({ where: currentLeadsWhere }),
      this.prisma.lead.count({ where: previousLeadsWhere }),
      this.prisma.task.count({ where: currentTasksWhere }),
      this.prisma.task.count({ where: previousTasksWhere }),
      this.prisma.customer.count({ where: currentCustomersWhere }),
      this.prisma.customer.count({ where: previousCustomersWhere }),
      this.prisma.lead.groupBy({
        by: ['stage'],
        where: leadsBaseWhere,
        _count: { id: true },
      }),
      this.prisma.revenueTarget.findFirst({
        where: { tenantId, isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const stageMap = new Map(stageCounts.map((s) => [s.stage, s._count.id]));
    const newCount = stageMap.get('NEW') ?? 0;
    const contactedCount = stageMap.get('CONTACTED') ?? 0;
    const proposalCount = stageMap.get('PROPOSAL_SENT') ?? 0;
    const wonCount = stageMap.get('WON') ?? 0;
    const lostCount = stageMap.get('LOST') ?? 0;

    function calcChange(
      current: number,
      previous: number,
    ): { change: string; positive: boolean } {
      if (previous === 0)
        return { change: current > 0 ? '+100%' : '0%', positive: current >= 0 };
      const pct = ((current - previous) / previous) * 100;
      const sign = pct >= 0 ? '+' : '';
      return { change: `${sign}${pct.toFixed(1)}%`, positive: pct >= 0 };
    }

    const buildSparkline = async (
      model: 'lead' | 'task' | 'customer',
      baseWhere:
        | Prisma.LeadWhereInput
        | Prisma.TaskWhereInput
        | Prisma.CustomerWhereInput,
    ): Promise<{ value: number }[]> => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const dayStart = new Date(now);
        dayStart.setDate(now.getDate() - (6 - i));
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        return { dayStart, dayEnd };
      });

      const counts = await Promise.all(
        days.map(({ dayStart, dayEnd }) => {
          const where = {
            ...baseWhere,
            createdAt: { gte: dayStart, lte: dayEnd },
          };
          if (model === 'lead')
            return this.prisma.lead.count({
              where: where as Prisma.LeadWhereInput,
            });
          if (model === 'task')
            return this.prisma.task.count({
              where: where as Prisma.TaskWhereInput,
            });
          return this.prisma.customer.count({
            where: where as Prisma.CustomerWhereInput,
          });
        }),
      );

      return counts.map((value) => ({ value }));
    };

    const [tasksSparkline, leadsSparkline, customersSparkline] =
      await Promise.all([
        buildSparkline('task', tasksBaseWhere),
        buildSparkline('lead', leadsBaseWhere),
        buildSparkline('customer', customersBaseWhere),
      ]);

    const pipelineStages = [
      { stage: 'New Lead', count: newCount, value: 0 },
      { stage: 'Contacted', count: contactedCount, value: 0 },
      { stage: 'Proposal Sent', count: proposalCount, value: 0 },
      { stage: 'Won', count: wonCount, value: 0 },
    ];

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const leadsThisYear = await this.prisma.lead.findMany({
      where: { ...leadsBaseWhere, createdAt: { gte: startOfYear } },
      select: { stage: true, createdAt: true, updatedAt: true, value: true },
    });

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const leadsGrowth = months.map((month) => ({
      name: month,
      direct: 0,
      social: 0,
      referral: 0,
    }));

    const annualTarget = revenueTargetRecord
      ? toNumber(revenueTargetRecord.value)
      : 0;
    const monthlyTarget = annualTarget > 0 ? Math.round(annualTarget / 12) : 0;
    const revenueOverview = months.map((month) => ({
      name: month,
      target: monthlyTarget,
      revenue: 0,
    }));

    leadsThisYear.forEach((lead) => {
      const date = new Date(lead.createdAt);
      leadsGrowth[date.getMonth()].direct++;
      if (lead.stage === 'WON') {
        const wonDate = new Date(lead.updatedAt);
        if (wonDate.getFullYear() === currentYear) {
          revenueOverview[wonDate.getMonth()].revenue += toNumber(lead.value);
        }
      }
    });

    const totalQualified = wonCount + lostCount;
    const winRate =
      totalQualified > 0 ? Math.round((wonCount / totalQualified) * 100) : 0;

    return {
      topStats: [
        {
          title: 'Total Tasks',
          value: tasksCount.toString(),
          ...calcChange(tasksCount, previousTasksCount),
          sparklineData: tasksSparkline,
        },
        {
          title: 'Total Leads',
          value: leadsCount.toString(),
          ...calcChange(leadsCount, previousLeadsCount),
          sparklineData: leadsSparkline,
        },
        {
          title: 'Total Customers',
          value: customersCount.toString(),
          ...calcChange(customersCount, previousCustomersCount),
          sparklineData: customersSparkline,
        },
      ],
      revenueOverview,
      leadsGrowth,
      pipelineStages,
      topAgents: [],
      customerGrowth: [],
      recentActivity: [],
      conversionStats: {
        averageRate: winRate.toString(),
        qualified: totalQualified.toString(),
        won: wonCount.toString(),
        lost: lostCount.toString(),
      },
      campaignPerformance: [],
    };
  }

  async getRevenueGrowthData(tenantId: string, filter = 'Year') {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    let previousStartDate = new Date();
    let previousEndDate = new Date();
    let groupBy: 'day' | 'month' = 'month';

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    switch (filter) {
      case 'Today':
        previousStartDate.setDate(now.getDate() - 1);
        previousEndDate = new Date(previousStartDate);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate.setHours(23, 59, 59, 999);
        groupBy = 'day';
        break;
      case 'Last 7 Days':
        startDate.setDate(now.getDate() - 6);
        previousEndDate = new Date(startDate);
        previousEndDate.setMilliseconds(-1);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 6);
        previousStartDate.setHours(0, 0, 0, 0);
        groupBy = 'day';
        break;
      case 'Last 30 Days':
        startDate.setDate(now.getDate() - 29);
        previousEndDate = new Date(startDate);
        previousEndDate.setMilliseconds(-1);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 29);
        previousStartDate.setHours(0, 0, 0, 0);
        groupBy = 'day';
        break;
      case 'This Month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );
        groupBy = 'day';
        break;
      case 'Last Month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        previousEndDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          0,
          23,
          59,
          59,
          999,
        );
        groupBy = 'day';
        break;
      case 'Quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        previousStartDate = new Date(
          now.getFullYear(),
          (currentQuarter - 1) * 3,
          1,
        );
        previousEndDate = new Date(
          now.getFullYear(),
          currentQuarter * 3,
          0,
          23,
          59,
          59,
          999,
        );
        groupBy = 'month';
        break;
      case 'Year':
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousEndDate = new Date(
          now.getFullYear() - 1,
          11,
          31,
          23,
          59,
          59,
          999,
        );
        groupBy = 'month';
        break;
    }

    const [
      currentWonLeads,
      previousWonLeads,
      currentTotalLeads,
      previousTotalLeads,
    ] = await Promise.all([
      this.prisma.lead.findMany({
        where: {
          tenantId,
          stage: 'WON',
          updatedAt: { gte: startDate, lte: endDate },
        },
        select: { value: true, updatedAt: true },
      }),
      this.prisma.lead.findMany({
        where: {
          tenantId,
          stage: 'WON',
          updatedAt: { gte: previousStartDate, lte: previousEndDate },
        },
        select: { value: true },
      }),
      this.prisma.lead.count({
        where: { tenantId, createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.lead.count({
        where: {
          tenantId,
          createdAt: { gte: previousStartDate, lte: previousEndDate },
        },
      }),
    ]);

    const currentRevenue = currentWonLeads.reduce(
      (sum, lead) => sum + toNumber(lead.value),
      0,
    );
    const previousRevenue = previousWonLeads.reduce(
      (sum, lead) => sum + toNumber(lead.value),
      0,
    );
    const currentDeals = currentWonLeads.length;
    const previousDeals = previousWonLeads.length;

    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;
    const dealsGrowth =
      previousDeals > 0
        ? ((currentDeals - previousDeals) / previousDeals) * 100
        : currentDeals > 0
          ? 100
          : 0;

    const averageDealSize =
      currentDeals > 0 ? currentRevenue / currentDeals : 0;
    const previousAvgDealSize =
      previousDeals > 0 ? previousRevenue / previousDeals : 0;
    const avgDealSizeGrowth =
      previousAvgDealSize > 0
        ? ((averageDealSize - previousAvgDealSize) / previousAvgDealSize) * 100
        : averageDealSize > 0
          ? 100
          : 0;

    const conversionRate =
      currentTotalLeads > 0 ? (currentDeals / currentTotalLeads) * 100 : 0;
    const previousConversionRate =
      previousTotalLeads > 0 ? (previousDeals / previousTotalLeads) * 100 : 0;
    const conversionRateGrowth =
      previousConversionRate > 0
        ? ((conversionRate - previousConversionRate) / previousConversionRate) *
          100
        : conversionRate > 0
          ? 100
          : 0;

    let chartData: { name: string; value: number; deals: number }[] = [];

    if (groupBy === 'month') {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      chartData = months.map((month) => ({ name: month, value: 0, deals: 0 }));

      currentWonLeads.forEach((lead) => {
        const monthIndex = new Date(lead.updatedAt).getMonth();
        chartData[monthIndex].value += toNumber(lead.value);
        chartData[monthIndex].deals += 1;
      });

      if (filter === 'Quarter') {
        const currentQuarter = Math.floor(startDate.getMonth() / 3);
        chartData = chartData.slice(currentQuarter * 3, currentQuarter * 3 + 3);
      }
    } else {
      const days = Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const dayMap = new Map();

      for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const name = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        dayMap.set(d.toDateString(), { name, value: 0, deals: 0 });
      }

      currentWonLeads.forEach((lead) => {
        const d = new Date(lead.updatedAt).toDateString();
        if (dayMap.has(d)) {
          const entry = dayMap.get(d);
          entry.value += toNumber(lead.value);
          entry.deals += 1;
        }
      });

      chartData = Array.from(dayMap.values());
    }

    let highestRevenue = 0;
    let bestPerformingMonth = 'N/A';
    let totalChartRevenue = 0;

    chartData.forEach((dataPoint) => {
      totalChartRevenue += dataPoint.value;
      if (dataPoint.value > highestRevenue) {
        highestRevenue = dataPoint.value;
        bestPerformingMonth = dataPoint.name;
      }
    });

    const averageMonthlyRevenue =
      chartData.length > 0 ? totalChartRevenue / chartData.length : 0;

    return {
      monthlyRevenue: chartData,
      currentRevenue,
      previousRevenue,
      growth: Math.round(revenueGrowth * 10) / 10,
      monthlyDeals: chartData.map((d) => ({ name: d.name, deals: d.deals })),
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

  async getAiInsights(tenantId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { tenantId, stage: 'NEW', deletedAt: null },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
    const tasks = await this.prisma.task.findMany({
      where: { tenantId, status: 'PENDING', dueDate: { lt: new Date() } },
      take: 2,
    });

    const recommendations = [
      ...leads.map((l) => ({
        id: `lead-${l.id}`,
        type: 'opportunity',
        title: `Reach out to ${l.company}`,
        description: `New lead created recently. Engage early for higher conversion.`,
      })),
      ...tasks.map((t) => ({
        id: `task-${t.id}`,
        type: 'risk',
        title: `Overdue Task: ${t.title}`,
        description: `This task is overdue. Please complete it ASAP.`,
      })),
    ];

    return {
      stats: [
        {
          title: 'New Opportunities',
          value: leads.length.toString(),
          change: '+2%',
          trend: 'up',
          color: '#10b981',
          sparklineData: [{ value: 0 }],
        },
        {
          title: 'Risks Detected',
          value: tasks.length.toString(),
          change: '-1%',
          trend: 'down',
          color: '#ef4444',
          sparklineData: [{ value: 0 }],
        },
      ],
      recommendations,
      alerts: tasks.map((t) => ({
        id: t.id,
        message: `Task "${t.title}" is overdue`,
        severity: 'high',
        time: 'Now',
      })),
      trends: [],
      forecastData: [],
      timeline: [],
    };
  }
}
