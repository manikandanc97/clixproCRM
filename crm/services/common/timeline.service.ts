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


export class TimelineService {
  static async logTimeline(tenantId: string, leadId: string, action: string, description: string | null = null, userId?: string) {
    return prisma.timelineEvent.create({
      data: {
        tenantId,
        leadId,
        action,
        description,
        userId
      }
    });
  }
}


