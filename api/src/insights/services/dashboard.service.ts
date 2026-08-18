import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  calculateTrend,
  formatCurrency,
  getMonthRanges,
  formatRelativeDate,
  toNumber,
  formatPercentage,
} from '../../common/utils/crm-formatters.util';
import { getCachedTenantCurrency } from '../../common/utils/tenant-cache.util';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private async getTenantCurrency(tenantId: string): Promise<string> {
    return getCachedTenantCurrency(this.prisma, tenantId);
  }

  async getDashboardData(tenantId: string, timeframe = 'month') {
    const tStart = performance.now();
    const currency = await this.getTenantCurrency(tenantId);
    const tCurr = performance.now();

    const now = new Date();
    let currentStart = new Date(now);
    let nextStart = new Date(now);
    let previousStart = new Date(now);

    if (timeframe === 'today') {
      currentStart.setHours(0, 0, 0, 0);
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 1);
      nextStart = new Date(currentStart);
      nextStart.setDate(nextStart.getDate() + 1);
    } else if (timeframe === 'week') {
      currentStart.setDate(currentStart.getDate() - currentStart.getDay());
      currentStart.setHours(0, 0, 0, 0);
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
      nextStart = new Date(currentStart);
      nextStart.setDate(nextStart.getDate() + 7);
    } else if (timeframe === 'year') {
      currentStart = new Date(now.getFullYear(), 0, 1);
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      nextStart = new Date(now.getFullYear() + 1, 0, 1);
    } else {
      const ranges = getMonthRanges();
      currentStart = ranges.currentMonthStart;
      previousStart = ranges.previousMonthStart;
      nextStart = ranges.nextMonthStart;
    }

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const currentYear = new Date().getFullYear();
    const startOfCurrentYear = new Date(currentYear, 0, 1);

    const qTimings: Record<string, number> = {};

    const tQueriesStart = performance.now();
    const [
      statsRaw,
      monthlySalesRaw,
      sparklineDealsRaw,
      sparklineRevenueRaw,
      recentDeals,
      recentQuotations,
      recentCompletedTasks,
      revenueTargetData,
    ] = await Promise.all([
      // 1. Consolidated Key Metric Counts & Sums in a Single DB Query
      (async () => {
        const t0 = performance.now();
        const res = await this.prisma.$queryRaw<
          Array<{
            total_deals: number;
            current_period_deals: number;
            prev_period_deals: number;
            current_period_revenue: number;
            prev_period_revenue: number;
            current_period_customers: number;
            prev_period_customers: number;
            pending_tasks_total: number;
            current_period_pending_tasks: number;
            prev_period_pending_tasks: number;
          }>
        >`
          SELECT
            (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL) as total_deals,
            (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${currentStart} AND "createdAt" < ${nextStart}) as current_period_deals,
            (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${previousStart} AND "createdAt" < ${currentStart}) as prev_period_deals,
            (SELECT COALESCE(SUM("value"), 0)::float FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "stage" = 'WON'::"DealStage" AND "updatedAt" >= ${currentStart} AND "updatedAt" < ${nextStart}) as current_period_revenue,
            (SELECT COALESCE(SUM("value"), 0)::float FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "stage" = 'WON'::"DealStage" AND "updatedAt" >= ${previousStart} AND "updatedAt" < ${currentStart}) as prev_period_revenue,
            (SELECT COUNT(*)::int FROM "Customer" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${currentStart} AND "createdAt" < ${nextStart}) as current_period_customers,
            (SELECT COUNT(*)::int FROM "Customer" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${previousStart} AND "createdAt" < ${currentStart}) as prev_period_customers,
            (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus") as pending_tasks_total,
            (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus" AND "createdAt" >= ${currentStart} AND "createdAt" < ${nextStart}) as current_period_pending_tasks,
            (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus" AND "createdAt" >= ${previousStart} AND "createdAt" < ${currentStart}) as prev_period_pending_tasks
        `;
        qTimings['Q1_statsRaw'] = performance.now() - t0;
        return res;
      })(),

      // 2. Aggregated Year-to-Date Won Deals Sales Chart by Month
      (async () => {
        const t0 = performance.now();
        const res = await this.prisma.$queryRaw<
          Array<{
            month_index: number;
            total: number;
          }>
        >`
          SELECT 
            (EXTRACT(MONTH FROM "updatedAt")::int - 1) as month_index,
            COALESCE(SUM("value"), 0)::float as total
          FROM "Deal"
          WHERE "tenantId" = ${tenantId} 
            AND "deletedAt" IS NULL 
            AND "stage" = 'WON'::"DealStage" 
            AND "updatedAt" >= ${startOfCurrentYear}
          GROUP BY (EXTRACT(MONTH FROM "updatedAt")::int - 1)
        `;
        qTimings['Q2_monthlySalesRaw'] = performance.now() - t0;
        return res;
      })(),

      // 3. Sparkline Deal Counts (Last 7 Days)
      (async () => {
        const t0 = performance.now();
        const res = await this.prisma.$queryRaw<
          Array<{
            day_date: Date;
            deal_count: number;
          }>
        >`
          SELECT
            DATE_TRUNC('day', "createdAt")::date as day_date,
            COUNT(*)::int as deal_count
          FROM "Deal"
          WHERE "tenantId" = ${tenantId} 
            AND "deletedAt" IS NULL 
            AND "createdAt" >= ${sevenDaysAgo}
          GROUP BY DATE_TRUNC('day', "createdAt")::date
        `;
        qTimings['Q3_sparklineDealsRaw'] = performance.now() - t0;
        return res;
      })(),

      // 4. Sparkline Won Revenue (Last 7 Days)
      (async () => {
        const t0 = performance.now();
        const res = await this.prisma.$queryRaw<
          Array<{
            day_date: Date;
            revenue: number;
          }>
        >`
          SELECT
            DATE_TRUNC('day', "updatedAt")::date as day_date,
            COALESCE(SUM("value"), 0)::float as revenue
          FROM "Deal"
          WHERE "tenantId" = ${tenantId} 
            AND "deletedAt" IS NULL 
            AND "stage" = 'WON'::"DealStage" 
            AND "updatedAt" >= ${sevenDaysAgo}
          GROUP BY DATE_TRUNC('day', "updatedAt")::date
        `;
        qTimings['Q4_sparklineRevenueRaw'] = performance.now() - t0;
        return res;
      })(),

      // 5. Recent Deals (take 5)
      (async () => {
        const t0 = performance.now();
        const res = await this.prisma.deal.findMany({
          where: { tenantId, deletedAt: null },
          select: { id: true, name: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });
        qTimings['Q5_recentDeals'] = performance.now() - t0;
        return res;
      })(),

      // 6. Recent Quotations (take 5)
      (async () => {
        const t0 = performance.now();
        const res = await this.prisma.quotation.findMany({
          where: { tenantId, deletedAt: null },
          select: { id: true, client: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });
        qTimings['Q6_recentQuotations'] = performance.now() - t0;
        return res;
      })(),

      // 7. Recent Completed Tasks (take 5)
      (async () => {
        const t0 = performance.now();
        const res = await this.prisma.task.findMany({
          where: { tenantId, deletedAt: null, status: 'COMPLETED' },
          select: { id: true, title: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        });
        qTimings['Q7_recentCompletedTasks'] = performance.now() - t0;
        return res;
      })(),

      // 8. Active Revenue Target
      (async () => {
        const t0 = performance.now();
        const res = await this.prisma.revenueTarget.findFirst({
          where: { tenantId, isActive: true },
          orderBy: { createdAt: 'desc' },
          select: { value: true },
        });
        qTimings['Q8_revenueTargetData'] = performance.now() - t0;
        return res;
      })(),
    ]);
    const tQueriesEnd = performance.now();

    const stats = statsRaw[0] || {
      total_deals: 0,
      current_period_deals: 0,
      prev_period_deals: 0,
      current_period_revenue: 0,
      prev_period_revenue: 0,
      current_period_customers: 0,
      prev_period_customers: 0,
      pending_tasks_total: 0,
      current_period_pending_tasks: 0,
      prev_period_pending_tasks: 0,
    };

    const currentRevenue = Number(stats.current_period_revenue || 0);
    const previousRevenue = Number(stats.prev_period_revenue || 0);

    // Build 7-day sparklines efficiently from grouped data
    const dealsDayMap = new Map<string, number>();
    for (const r of sparklineDealsRaw) {
      const dStr = new Date(r.day_date).toISOString().split('T')[0];
      dealsDayMap.set(dStr, Number(r.deal_count || 0));
    }

    const revenueDayMap = new Map<string, number>();
    for (const r of sparklineRevenueRaw) {
      const dStr = new Date(r.day_date).toISOString().split('T')[0];
      revenueDayMap.set(dStr, Number(r.revenue || 0));
    }

    const sparklineDeals: { value: number }[] = [];
    const sparklineRevenue: { value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      sparklineDeals.push({ value: dealsDayMap.get(dStr) || 0 });
      sparklineRevenue.push({ value: revenueDayMap.get(dStr) || 0 });
    }

    const dashboardStats = [
      {
        title: 'Total Deals',
        value: Number(stats.total_deals || 0).toLocaleString('en-US'),
        valueAmount: Number(stats.total_deals || 0),
        sparklineData: sparklineDeals,
        ...calculateTrend(
          Number(stats.current_period_deals || 0),
          Number(stats.prev_period_deals || 0),
        ),
      },
      {
        title: 'New Customers',
        value: Number(stats.current_period_customers || 0).toLocaleString('en-US'),
        valueAmount: Number(stats.current_period_customers || 0),
        ...calculateTrend(
          Number(stats.current_period_customers || 0),
          Number(stats.prev_period_customers || 0),
        ),
      },
      {
        title: 'Revenue',
        value: formatCurrency(currentRevenue, currency),
        valueAmount: currentRevenue,
        sparklineData: sparklineRevenue,
        ...calculateTrend(currentRevenue, previousRevenue),
      },
      {
        title: 'Pending Tasks',
        value: Number(stats.pending_tasks_total || 0).toLocaleString('en-US'),
        valueAmount: Number(stats.pending_tasks_total || 0),
        ...calculateTrend(
          Number(stats.current_period_pending_tasks || 0),
          Number(stats.prev_period_pending_tasks || 0),
        ),
      },
    ];

    const recentActivities = [
      ...recentDeals.map((d) => ({
        id: `deal-${d.id}`,
        title: `New deal: ${d.name}`,
        time: d.createdAt,
      })),
      ...recentQuotations.map((q) => ({
        id: `quote-${q.id}`,
        title: `Quotation: ${q.client}`,
        time: q.createdAt,
      })),
      ...recentCompletedTasks.map((t) => ({
        id: `task-${t.id}`,
        title: `Completed: ${t.title}`,
        time: t.updatedAt,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)
      .map((a) => ({
        ...a,
        time: formatRelativeDate(a.time, { fallback: 'Just now' }),
      }));

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
    const salesChartData = months.map((month) => ({ name: month, total: 0 }));
    for (const row of monthlySalesRaw) {
      if (row.month_index >= 0 && row.month_index < 12) {
        salesChartData[row.month_index].total = Number(row.total || 0);
      }
    }

    const targetValue = revenueTargetData
      ? toNumber(revenueTargetData.value)
      : 0;
    const targetChange =
      targetValue > 0 ? (currentRevenue / targetValue) * 100 : 0;
    const revenueTarget = {
      revenue: currentRevenue,
      target: targetValue,
      change: formatPercentage(targetChange / 100),
      positive: targetChange >= 100,
    };

    return {
      stats: dashboardStats,
      recentActivities,
      salesChartData,
      activeUsers: 0,
      liveTraffic: 0,
      weeklyGrowth: 0,
      liveTrafficGrowth: 0,
      activeUsersGrowth: 0,
      revenueTarget,
    };
  }

  async getRevenueGrowth(tenantId: string, filter: string) {
    // Basic implementation to return revenue growth data
    // The frontend fetches this to cache it for the dashboard
    return {
      growth: 0,
      trend: 'stable',
      data: [],
    };
  }

  /**
   * Employee-scoped dashboard data.
   * Returns ONLY records that belong to / are assigned to the calling user.
   * No organisation-wide metrics are exposed.
   */
  async getEmployeeDashboardData(tenantId: string, userId: string) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      myPendingTasks,
      myTodayMeetings,
      myUpcomingMeetings,
      myAssignedLeads,
      myAssignedDeals,
      myRecentActivities,
    ] = await Promise.all([
      // Tasks assigned to this user that are not completed
      this.prisma.task.count({
        where: {
          tenantId,
          assignedToId: userId,
          deletedAt: null,
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      }),

      // Today's meetings for this user
      this.prisma.meeting.count({
        where: {
          tenantId,
          assignedToId: userId,
          startTime: { gte: todayStart, lt: todayEnd },
        },
      }),

      // All upcoming meetings (including today)
      this.prisma.meeting.count({
        where: {
          tenantId,
          assignedToId: userId,
          startTime: { gte: now },
        },
      }),

      // Leads assigned to this user
      this.prisma.lead.count({
        where: {
          tenantId,
          assignedToId: userId,
          deletedAt: null,
        },
      }),

      // Deals owned by this user
      this.prisma.deal.count({
        where: {
          tenantId,
          ownerId: userId,
          deletedAt: null,
          stage: { notIn: ['WON', 'LOST'] },
        },
      }),

      // Recent activities: completed tasks, recent leads, recent deals for this user
      Promise.all([
        this.prisma.task.findMany({
          where: {
            tenantId,
            assignedToId: userId,
            status: 'COMPLETED',
            deletedAt: null,
          },
          select: { id: true, title: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
        this.prisma.lead.findMany({
          where: {
            tenantId,
            assignedToId: userId,
            deletedAt: null,
            createdAt: { gte: sevenDaysAgo },
          },
          select: { id: true, name: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]),
    ]);

    const [recentTasks, recentLeads] = myRecentActivities;

    const recentActivities = [
      ...recentTasks.map((t) => ({
        id: `task-${t.id}`,
        title: `Completed: ${t.title}`,
        time: t.updatedAt,
        type: 'task',
      })),
      ...recentLeads.map((l) => ({
        id: `lead-${l.id}`,
        title: `Lead assigned: ${l.name}`,
        time: l.createdAt,
        type: 'lead',
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)
      .map((a) => ({
        ...a,
        time: formatRelativeDate(a.time, { fallback: 'Just now' }),
      }));

    return {
      myTasks: myPendingTasks,
      myTodayMeetings,
      myUpcomingMeetings,
      myLeads: myAssignedLeads,
      myDeals: myAssignedDeals,
      myActivities: recentTasks.length + recentLeads.length,
      recentActivities,
    };
  }
}
