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


export class QuotationService {
  static async createQuotation(tenantId: string, data: { quoteNumber?: string; client: string; amount?: number | string; status?: QuotationStatus; validTill?: string | Date | null }) {
    const quotation = await prisma.quotation.create({
      data: {
        tenantId,
        quoteNumber: data.quoteNumber || `QT-${Date.now().toString().slice(-4)}`,
        client: data.client,
        amount: data.amount || 0,
        status: data.status || "PENDING",
        validTill: data.validTill ? new Date(data.validTill) : null,
      }
    });
    return quotation;
  }

  static async updateQuotation(tenantId: string, id: string, data: Partial<{ client: string; amount: number | string; status: QuotationStatus; validTill: string | Date | null; quoteNumber: string }>) {
    const quotation = await prisma.quotation.update({
      where: { id, tenantId },
      data: {
        ...(data.client && { client: data.client }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status && { status: data.status }),
        ...(data.validTill !== undefined && { validTill: data.validTill ? new Date(data.validTill) : null }),
        ...(data.quoteNumber && { quoteNumber: data.quoteNumber }),
      }
    });
    return quotation;
  }

  static async deleteQuotation(tenantId: string, id: string) {
    const quotation = await prisma.quotation.update({
      where: { id, tenantId },
      data: { deletedAt: new Date() }
    });
    return quotation;
  }

  static async getQuotations(tenantId: string, page = 1, limit = 10, search = "") {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.QuotationWhereInput = { tenantId, deletedAt: null };
    if (search) where.quoteNumber = { contains: search, mode: "insensitive" };

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.quotation.count({ where }),
    ]);
    const approved = quotations.filter((q) => q.status === "APPROVED");
    const pending = quotations.filter((q) => q.status === "PENDING");
    return {
      stats: [
        { title: "Total Quotations", value: quotations.length.toString() },
        { title: "Approved", value: approved.length.toString() },
        { title: "Pending", value: pending.length.toString() },
      ],
      quotations: quotations.map((q) => ({
        id: q.id, 
        quoteId: q.quoteNumber, 
        client: q.client,
        amount: formatCurrency(toNumber(q.amount), "USD"),
        amountValue: toNumber(q.amount),
        status: q.status, 
        validTill: formatDate(q.validTill || new Date()),
        validTillValue: q.validTill ? new Date(q.validTill).toISOString() : null,
        probability: 50,
        viewCount: 0,
        downloadCount: 0,
        lastActivity: formatDate(q.updatedAt || q.createdAt)
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}


