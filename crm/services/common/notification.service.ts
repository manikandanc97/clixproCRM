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


export class CommonNotificationService {
  static async getNotifications(tenantId: string) {
    const notifications = await prisma.notification.findMany({ where: { tenantId }, take: 5, orderBy: { createdAt: 'desc' } });
    return { notifications: notifications.map((n) => ({ id: n.id, title: n.title, description: n.message, read: n.isRead, time: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(), type: n.type })) };
  }
}



