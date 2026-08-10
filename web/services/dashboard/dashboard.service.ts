import prisma from "@/lib/prisma";
import {
  calculateTrend,
  formatCurrency,
  getMonthRanges,
  formatRelativeDate,
  toNumber,
  formatPercentage
} from "@/lib/crm-formatters";

import { CustomerSyncService } from "../customer/customer.sync.service";

export class DashboardService {
  static async getDashboardData(tenantId: string, currency = "USD", timeframe = "month") {
    // Fire-and-forget: cleanup anomalies in background, don't block the response
    CustomerSyncService.cleanupCustomerAnomalies(tenantId).catch(() => {});

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

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const currentYear = new Date().getFullYear();
    const startOfCurrentYear = new Date(currentYear, 0, 1);

    // ─── Single parallel batch — no sequential roundtrips ─────────────────────
    const [
      // Deal KPI aggregates
      totalDealsCount,
      currentPeriodDealsCount,
      previousPeriodDealsCount,
      // Won deal revenue aggregates
      currentPeriodRevenue,
      previousPeriodRevenue,
      // Customer counts
      currentPeriodCustomers,
      previousPeriodCustomers,
      // Task counts
      pendingTasksTotal,
      currentPeriodPendingTasks,
      previousPeriodPendingTasks,
      // Recent activities data (small, bounded)
      recentDeals,
      recentQuotations,
      recentCompletedTasks,
      // Revenue target
      revenueTargetData,
      // Sparkline: won deals in last 7 days (small dataset, bounded)
      weekWonDeals,
      // Sparkline: new deals in last 7 days (small dataset, bounded)
      weekNewDeals,
      // Sales chart: won deals this year (only select minimal fields)
      yearWonDeals,
    ] = await Promise.all([
      // Total deal count (all time, tenantId only)
      prisma.deal.count({ where: { tenantId, deletedAt: null } }),

      // Current period new deals
      prisma.deal.count({ where: { tenantId, deletedAt: null, createdAt: { gte: currentStart, lt: nextStart } } }),

      // Previous period new deals
      prisma.deal.count({ where: { tenantId, deletedAt: null, createdAt: { gte: previousStart, lt: currentStart } } }),

      // Current period WON deal revenue
      prisma.deal.aggregate({
        where: { tenantId, deletedAt: null, stage: "WON", updatedAt: { gte: currentStart, lt: nextStart } },
        _sum: { value: true }
      }),

      // Previous period WON deal revenue
      prisma.deal.aggregate({
        where: { tenantId, deletedAt: null, stage: "WON", updatedAt: { gte: previousStart, lt: currentStart } },
        _sum: { value: true }
      }),

      // Current period new customers
      prisma.customer.count({ where: { tenantId, deletedAt: null, createdAt: { gte: currentStart, lt: nextStart } } }),

      // Previous period new customers
      prisma.customer.count({ where: { tenantId, deletedAt: null, createdAt: { gte: previousStart, lt: currentStart } } }),

      // Total pending tasks
      prisma.task.count({ where: { tenantId, deletedAt: null, status: { not: "COMPLETED" } } }),

      // Current period pending tasks
      prisma.task.count({ where: { tenantId, deletedAt: null, status: { not: "COMPLETED" }, createdAt: { gte: currentStart, lt: nextStart } } }),

      // Previous period pending tasks
      prisma.task.count({ where: { tenantId, deletedAt: null, status: { not: "COMPLETED" }, createdAt: { gte: previousStart, lt: currentStart } } }),

      // Recent deals for activity feed (bounded: take 5)
      prisma.deal.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, name: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5
      }),

      // Recent quotations for activity feed (bounded: take 5)
      prisma.quotation.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, client: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5
      }),

      // Recent completed tasks for activity feed (bounded: take 5)
      prisma.task.findMany({
        where: { tenantId, deletedAt: null, status: "COMPLETED" },
        select: { id: true, title: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5
      }),

      // Revenue target (active)
      prisma.revenueTarget.findFirst({
        where: { tenantId, isActive: true },
        orderBy: { createdAt: "desc" },
        select: { value: true }
      }),

      // Sparkline: won deals last 7 days (bounded, only value+date needed)
      prisma.deal.findMany({
        where: { tenantId, deletedAt: null, stage: "WON", updatedAt: { gte: sevenDaysAgo } },
        select: { value: true, updatedAt: true }
      }),

      // Sparkline: new deals last 7 days (bounded, only date needed)
      prisma.deal.findMany({
        where: { tenantId, deletedAt: null, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true }
      }),

      // Sales chart: won deals this year (bounded to 1 year, minimal select)
      prisma.deal.findMany({
        where: { tenantId, deletedAt: null, stage: "WON", updatedAt: { gte: startOfCurrentYear } },
        select: { value: true, updatedAt: true }
      }),
    ]);

    // ─── In-memory computation (all on bounded datasets) ─────────────────────

    const currentRevenue = toNumber(currentPeriodRevenue._sum.value);
    const previousRevenue = toNumber(previousPeriodRevenue._sum.value);

    // Sparkline: 7-day daily buckets
    const sparklineDeals: { value: number }[] = [];
    const sparklineRevenue: { value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dStart = new Date(todayStart);
      dStart.setDate(dStart.getDate() - i);
      const dEnd = new Date(dStart);
      dEnd.setDate(dEnd.getDate() + 1);

      const dayDeals = weekNewDeals.filter(d => d.createdAt >= dStart && d.createdAt < dEnd).length;
      const dayRevenue = weekWonDeals
        .filter(d => d.updatedAt >= dStart && d.updatedAt < dEnd)
        .reduce((sum, d) => sum + toNumber(d.value), 0);

      sparklineDeals.push({ value: dayDeals });
      sparklineRevenue.push({ value: dayRevenue });
    }

    const dashboardStats = [
      { title: "Total Deals", value: totalDealsCount.toLocaleString("en-US"), valueAmount: totalDealsCount, sparklineData: sparklineDeals, ...calculateTrend(currentPeriodDealsCount, previousPeriodDealsCount) },
      { title: "New Customers", value: currentPeriodCustomers.toLocaleString("en-US"), valueAmount: currentPeriodCustomers, ...calculateTrend(currentPeriodCustomers, previousPeriodCustomers) },
      { title: "Revenue", value: formatCurrency(currentRevenue, currency), valueAmount: currentRevenue, sparklineData: sparklineRevenue, ...calculateTrend(currentRevenue, previousRevenue) },
      { title: "Pending Tasks", value: pendingTasksTotal.toLocaleString("en-US"), valueAmount: pendingTasksTotal, ...calculateTrend(currentPeriodPendingTasks, previousPeriodPendingTasks) },
    ];

    const recentActivities = [
      ...recentDeals.map(d => ({ id: `deal-${d.id}`, title: `New deal: ${d.name}`, time: d.createdAt })),
      ...recentQuotations.map(q => ({ id: `quote-${q.id}`, title: `Quotation: ${q.client}`, time: q.createdAt })),
      ...recentCompletedTasks.map(t => ({ id: `task-${t.id}`, title: `Completed: ${t.title}`, time: t.updatedAt })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)
      .map(a => ({ ...a, time: formatRelativeDate(a.time, { fallback: "Just now" }) }));

    // Sales chart: monthly aggregation from bounded yearly dataset
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesChartData = months.map(month => ({ name: month, total: 0 }));
    yearWonDeals.forEach(deal => {
      const monthIndex = new Date(deal.updatedAt).getMonth();
      salesChartData[monthIndex].total += toNumber(deal.value);
    });

    // Revenue target progress
    const targetValue = revenueTargetData ? toNumber(revenueTargetData.value) : 0;
    const targetChange = targetValue > 0 ? (currentRevenue / targetValue) * 100 : 0;
    const revenueTarget = {
      revenue: currentRevenue,
      target: targetValue,
      change: formatPercentage(targetChange / 100),
      positive: targetChange >= 100
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
}
