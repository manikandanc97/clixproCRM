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


export class LeadTimelineService {
  static async getLeadTimeline(tenantId: string, leadId: string) {
    return prisma.timelineEvent.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createTimelineEvent(tenantId: string, leadId: string, action: string, description?: string, userId?: string) {
    return prisma.timelineEvent.create({
      data: {
        tenantId,
        leadId,
        userId,
        action,
        description
      },
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }
}


