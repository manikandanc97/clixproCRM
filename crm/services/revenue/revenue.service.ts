import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  toNumber
} from "@/lib/crm-formatters";


export class RevenueService {
  static async getRevenueTargets(tenantId: string) {
    return prisma.revenueTarget.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createRevenueTarget(tenantId: string, data: ReturnType<typeof JSON.parse>) {
    const isActive = data.isActive !== undefined ? data.isActive : true;
    if (isActive) {
      await prisma.revenueTarget.updateMany({
        where: { tenantId, isActive: true },
        data: { isActive: false },
      });
    }

    return prisma.revenueTarget.create({
      data: {
        tenantId,
        periodType: data.periodType || "MONTHLY",
        value: data.value || 0,
        currency: data.currency || "USD",
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: isActive,
      },
    });
  }

  static async updateRevenueTarget(tenantId: string, id: string, data: ReturnType<typeof JSON.parse>) {
    if (data.isActive) {
      await prisma.revenueTarget.updateMany({
        where: { tenantId, isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    return prisma.revenueTarget.update({
      where: { id, tenantId },
      data: {
        ...(data.periodType && { periodType: data.periodType }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.currency && { currency: data.currency }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  static async deleteRevenueTarget(tenantId: string, id: string) {
    return prisma.revenueTarget.delete({
      where: { id, tenantId },
    });
  }

  static async getRevenueTargetAnalytics(tenantId: string, filters: ReturnType<typeof JSON.parse> = {}) {
    // Determine the active target based on filters or default
    const targets = await prisma.revenueTarget.findMany({
      where: { tenantId, isActive: true },
    });

    const activeTarget = targets.length > 0 ? targets[0] : null;

    if (!activeTarget) {
      return { hasTarget: false, currentRevenue: 0, targetValue: 0, achievementPercentage: 0, trend: null };
    }

    const now = new Date();
    // Default to target dates if no timeframe provided, otherwise we'd parse timeframe
    // For simplicity, we'll use the target's configured dates for "current period"
    // Or if a specific filter like "this-month" is applied, we override the period.
    const start = new Date(activeTarget.startDate);
    const end = new Date(activeTarget.endDate);
    const prevStart = new Date(start);
    const prevEnd = new Date(end);
    
    // Simple previous period calculation (e.g. subtract month if monthly)
    if (activeTarget.periodType === "MONTHLY") {
      prevStart.setMonth(prevStart.getMonth() - 1);
      prevEnd.setMonth(prevEnd.getMonth() - 1);
    } else if (activeTarget.periodType === "QUARTERLY") {
      prevStart.setMonth(prevStart.getMonth() - 3);
      prevEnd.setMonth(prevEnd.getMonth() - 3);
    } else if (activeTarget.periodType === "YEARLY") {
      prevStart.setFullYear(prevStart.getFullYear() - 1);
      prevEnd.setFullYear(prevEnd.getFullYear() - 1);
    }

    const leadWhere: Prisma.LeadWhereInput = {
      tenantId,
      stage: "WON",
      deletedAt: null,
    };

    if (filters.employee && filters.employee !== "all" && filters.employee !== "me") {
      leadWhere.assignedToId = filters.employee;
    }

    const currentRevenueAgg = await prisma.lead.aggregate({
      _sum: { value: true },
      where: {
        ...leadWhere,
        updatedAt: { gte: start, lte: end },
      },
    });

    const previousRevenueAgg = await prisma.lead.aggregate({
      _sum: { value: true },
      where: {
        ...leadWhere,
        updatedAt: { gte: prevStart, lte: prevEnd },
      },
    });

    const currentRevenue = toNumber(currentRevenueAgg._sum.value || 0);
    const previousRevenue = toNumber(previousRevenueAgg._sum.value || 0);
    const targetValue = toNumber(activeTarget.value);

    let achievementPercentage = 0;
    if (targetValue > 0) {
      achievementPercentage = Math.round((currentRevenue / targetValue) * 100);
    }

    let trend = 0;
    let trendDirection = "neutral";
    if (previousRevenue > 0) {
      trend = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100 * 10) / 10;
      if (trend > 0) trendDirection = "up";
      if (trend < 0) trendDirection = "down";
    } else if (currentRevenue > 0) {
      trend = 100;
      trendDirection = "up";
    }

    return {
      hasTarget: true,
      target: activeTarget,
      currentRevenue,
      previousRevenue,
      targetValue,
      achievementPercentage,
      trend: {
        value: Math.abs(trend),
        direction: trendDirection,
        label: `${Math.abs(trend)}% vs last period`,
      },
    };
  }
}


