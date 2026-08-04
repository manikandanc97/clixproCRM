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


export class LeadNoteService {
  static async getLeadNotes(tenantId: string, leadId: string) {
    return prisma.note.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createLeadNote(tenantId: string, leadId: string, userId: string, data: { message: string, isPinned?: boolean, mentions?: any }) {
    return prisma.note.create({
      data: {
        tenantId,
        leadId,
        userId,
        message: data.message,
        isPinned: data.isPinned || false,
        mentions: data.mentions || null
      },
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }

  static async updateLeadNote(tenantId: string, noteId: string, data: { message?: string, isPinned?: boolean }) {
    return prisma.note.update({
      where: { id: noteId, tenantId },
      data,
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }

  static async deleteLeadNote(tenantId: string, noteId: string) {
    return prisma.note.delete({
      where: { id: noteId, tenantId }
    });
  }
}


