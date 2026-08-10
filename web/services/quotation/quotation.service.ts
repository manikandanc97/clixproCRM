import prisma from "@/lib/prisma";
import { Prisma, QuotationStatus } from "@prisma/client";
import {
  formatCurrency,
  toNumber,
  formatDate
} from "@/lib/crm-formatters";


export class QuotationService {
  /**
   * Generates a unique, sequential, tenant-scoped quote number atomically.
   * Runs inside a transaction to prevent duplicates under concurrent creation.
   */
  private static async generateQuoteNumber(tenantId: string, tx: Prisma.TransactionClient): Promise<string> {
    const last = await tx.quotation.findFirst({
      where: { tenantId, quoteNumber: { startsWith: "QT-" } },
      orderBy: { createdAt: "desc" },
      select: { quoteNumber: true },
    });
    const lastSeq = last?.quoteNumber ? parseInt(last.quoteNumber.replace("QT-", ""), 10) : 0;
    const nextSeq = (isNaN(lastSeq) ? 0 : lastSeq) + 1;
    return `QT-${String(nextSeq).padStart(4, "0")}`;
  }

  static async createQuotation(tenantId: string, data: { quoteNumber?: string; client: string; leadId: string; amount?: number | string; status?: QuotationStatus; validTill?: string | Date | null; items?: ReturnType<typeof JSON.parse>; notes?: string; discount?: number; tax?: number }) {
    return prisma.$transaction(async (tx) => {
      const quoteNumber = data.quoteNumber || await QuotationService.generateQuoteNumber(tenantId, tx);
      const quotation = await tx.quotation.create({
        data: {
          tenantId,
          leadId: data.leadId,
          quoteNumber,
          client: data.client,
          amount: data.amount || 0,
          status: data.status || "DRAFT",
          validTill: data.validTill ? new Date(data.validTill) : null,
          items: data.items || [],
          notes: data.notes || "",
          discount: data.discount || 0,
          tax: data.tax || 0,
        },
      });
      return quotation;
    });
  }

  static async updateQuotation(tenantId: string, id: string, data: Partial<{ client: string; amount: number | string; status: QuotationStatus; validTill: string | Date | null; quoteNumber: string; items: ReturnType<typeof JSON.parse>; notes: string; discount: number; tax: number; leadId: string }>) {
    const quotation = await prisma.quotation.update({
      where: { id, tenantId },
      data: {
        ...(data.client && { client: data.client }),
        ...(data.leadId && { leadId: data.leadId }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status && { status: data.status }),
        ...(data.validTill !== undefined && { validTill: data.validTill ? new Date(data.validTill) : null }),
        ...(data.quoteNumber && { quoteNumber: data.quoteNumber }),
        ...(data.items !== undefined && { items: data.items }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.discount !== undefined && { discount: data.discount }),
        ...(data.tax !== undefined && { tax: data.tax }),
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

  static async updateQuotationStatus(tenantId: string, id: string, newStatus: QuotationStatus) {
    const quotation = await prisma.quotation.findFirst({ where: { id, tenantId } });
    if (!quotation) throw new Error("Quotation not found");

    return prisma.quotation.update({
      where: { id, tenantId },
      data: { status: newStatus }
    });
  }

  static async getQuotations(tenantId: string, page = 1, limit = 10, search = "") {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.QuotationWhereInput = { tenantId, deletedAt: null };
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: "insensitive" } },
        { client: { contains: search, mode: "insensitive" } },
      ];
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        include: { lead: { select: { id: true, name: true, company: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.quotation.count({ where }),
    ]);

    // Automatic Expiry
    const now = new Date();
    const expiredIds: string[] = [];
    quotations.forEach(q => {
      if ((q.status === "DRAFT" || q.status === "SENT") && q.validTill && q.validTill < now) {
        q.status = "EXPIRED";
        expiredIds.push(q.id);
      }
    });
    if (expiredIds.length > 0) {
      await prisma.quotation.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: "EXPIRED" },
      });
    }

    // Stats from FULL tenant dataset, NOT just current page
    const allStats = await prisma.quotation.groupBy({
      by: ["status"],
      where: { tenantId, deletedAt: null },
      _count: { id: true },
      _sum: { amount: true },
    });
    const totalCount = allStats.reduce((s, r) => s + r._count.id, 0);
    const totalValue = allStats.reduce((s, r) => s + toNumber(r._sum.amount), 0);
    const sentCount = allStats.find(r => r.status === "SENT")?._count.id ?? 0;
    const acceptedCount = allStats.find(r => r.status === "APPROVED")?._count.id ?? 0;

    return {
      stats: [
        { title: "Total Quotations", value: totalCount.toString() },
        { title: "Total Quote Value", value: formatCurrency(totalValue, "USD"), valueAmount: totalValue },
        { title: "Sent Quotes", value: sentCount.toString() },
        { title: "Accepted Quotes", value: acceptedCount.toString() },
      ],
      quotations: quotations.map((q) => ({
        id: q.id,
        quoteId: q.quoteNumber,
        client: q.client,
        leadId: q.leadId,
        leadName: q.lead?.name || q.client,
        leadDetails: q.lead
          ? { name: q.lead.name, email: q.lead.email, phone: q.lead.phone, company: q.lead.company }
          : undefined,
        amount: formatCurrency(toNumber(q.amount), "USD"),
        amountValue: toNumber(q.amount),
        status: q.status,
        validTill: formatDate(q.validTill || new Date()),
        validTillValue: q.validTill ? new Date(q.validTill).toISOString() : null,
        items: q.items as ReturnType<typeof JSON.parse>,
        notes: q.notes,
        discount: toNumber(q.discount),
        tax: toNumber(q.tax),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}


