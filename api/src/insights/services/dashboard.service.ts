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

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private async getTenantCurrency(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { currency: true },
    });
    return tenant?.currency || 'USD';
  }

  async getDashboardData(tenantId: string, timeframe = 'month') {
    const currency = await this.getTenantCurrency(tenantId);

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

    const [
      totalDealsCount,
      currentPeriodDealsCount,
      previousPeriodDealsCount,
      currentPeriodRevenue,
      previousPeriodRevenue,
      currentPeriodCustomers,
      previousPeriodCustomers,
      pendingTasksTotal,
      currentPeriodPendingTasks,
      previousPeriodPendingTasks,
      recentDeals,
      recentQuotations,
      recentCompletedTasks,
      revenueTargetData,
      weekWonDeals,
      weekNewDeals,
      yearWonDeals,
    ] = await Promise.all([
      this.prisma.deal.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.deal.count({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { gte: currentStart, lt: nextStart },
        },
      }),
      this.prisma.deal.count({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { gte: previousStart, lt: currentStart },
        },
      }),
      this.prisma.deal.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          stage: 'WON',
          updatedAt: { gte: currentStart, lt: nextStart },
        },
        _sum: { value: true },
      }),
      this.prisma.deal.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          stage: 'WON',
          updatedAt: { gte: previousStart, lt: currentStart },
        },
        _sum: { value: true },
      }),
      this.prisma.customer.count({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { gte: currentStart, lt: nextStart },
        },
      }),
      this.prisma.customer.count({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { gte: previousStart, lt: currentStart },
        },
      }),
      this.prisma.task.count({
        where: { tenantId, deletedAt: null, status: { not: 'COMPLETED' } },
      }),
      this.prisma.task.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { not: 'COMPLETED' },
          createdAt: { gte: currentStart, lt: nextStart },
        },
      }),
      this.prisma.task.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { not: 'COMPLETED' },
          createdAt: { gte: previousStart, lt: currentStart },
        },
      }),
      this.prisma.deal.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.quotation.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, client: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.task.findMany({
        where: { tenantId, deletedAt: null, status: 'COMPLETED' },
        select: { id: true, title: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.revenueTarget.findFirst({
        where: { tenantId, isActive: true },
        orderBy: { createdAt: 'desc' },
        select: { value: true },
      }),
      this.prisma.deal.findMany({
        where: {
          tenantId,
          deletedAt: null,
          stage: 'WON',
          updatedAt: { gte: sevenDaysAgo },
        },
        select: { value: true, updatedAt: true },
      }),
      this.prisma.deal.findMany({
        where: { tenantId, deletedAt: null, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      this.prisma.deal.findMany({
        where: {
          tenantId,
          deletedAt: null,
          stage: 'WON',
          updatedAt: { gte: startOfCurrentYear },
        },
        select: { value: true, updatedAt: true },
      }),
    ]);

    const currentRevenue = toNumber(currentPeriodRevenue._sum.value);
    const previousRevenue = toNumber(previousPeriodRevenue._sum.value);

    const sparklineDeals: { value: number }[] = [];
    const sparklineRevenue: { value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dStart = new Date(todayStart);
      dStart.setDate(dStart.getDate() - i);
      const dEnd = new Date(dStart);
      dEnd.setDate(dEnd.getDate() + 1);

      const dayDeals = weekNewDeals.filter(
        (d) => d.createdAt >= dStart && d.createdAt < dEnd,
      ).length;
      const dayRevenue = weekWonDeals
        .filter((d) => d.updatedAt >= dStart && d.updatedAt < dEnd)
        .reduce((sum, d) => sum + toNumber(d.value), 0);

      sparklineDeals.push({ value: dayDeals });
      sparklineRevenue.push({ value: dayRevenue });
    }

    const dashboardStats = [
      {
        title: 'Total Deals',
        value: totalDealsCount.toLocaleString('en-US'),
        valueAmount: totalDealsCount,
        sparklineData: sparklineDeals,
        ...calculateTrend(currentPeriodDealsCount, previousPeriodDealsCount),
      },
      {
        title: 'New Customers',
        value: currentPeriodCustomers.toLocaleString('en-US'),
        valueAmount: currentPeriodCustomers,
        ...calculateTrend(currentPeriodCustomers, previousPeriodCustomers),
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
        value: pendingTasksTotal.toLocaleString('en-US'),
        valueAmount: pendingTasksTotal,
        ...calculateTrend(
          currentPeriodPendingTasks,
          previousPeriodPendingTasks,
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
    yearWonDeals.forEach((deal) => {
      const monthIndex = new Date(deal.updatedAt).getMonth();
      salesChartData[monthIndex].total += toNumber(deal.value);
    });

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
