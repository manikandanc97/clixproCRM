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

import { CustomerSyncService } from "../customer/customer.sync.service";

export class DashboardService {
  static async getDashboardData(tenantId: string, currency = "USD", timeframe = "month") {
    try {
      CustomerSyncService.cleanupCustomerAnomalies(tenantId).catch(() => {});
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

    const revenueTargetData = await prisma.revenueTarget.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });
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
      activeUsers: activeUsersCurrent,
      liveTraffic: liveTrafficToday,
      weeklyGrowth: Math.round(weeklyGrowth * 10) / 10,
      liveTrafficGrowth: Math.round(liveTrafficGrowth * 10) / 10,
      activeUsersGrowth: Math.round(activeUsersGrowth * 10) / 10,
      revenueTarget,
    };
  }
}


