import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { toNumber, formatCurrency } from "@/lib/crm-formatters";

export class InvoiceService {
  /**
   * Generates a unique, sequential, tenant-scoped invoice number atomically.
   */
  private static async generateInvoiceNumber(tenantId: string, tx: Prisma.TransactionClient): Promise<string> {
    // Use count-based sequential numbering
    const count = await tx.invoice.count({ where: { tenantId } });
    const nextSeq = count + 1;
    return `INV-${String(nextSeq).padStart(4, "0")}`;
  }

  static async createInvoice(
    tenantId: string,
    userId: string,
    data: {
      customerId: string;
      dealId?: string | null;
      amount: number | string;
      status?: string;
      dueDate?: Date | string | null;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          customerId: data.customerId,
          dealId: data.dealId || null,
          amount: data.amount,
          status: data.status || "DRAFT",
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "INVOICE_CREATED",
          module: "INVOICES",
          details: { invoiceId: invoice.id, amount: data.amount, customerId: data.customerId },
        },
      });

      return invoice;
    });
  }

  static async updateInvoice(
    tenantId: string,
    id: string,
    data: Partial<{
      amount: number | string;
      status: string;
      dueDate: Date | string | null;
      customerId: string;
      dealId: string | null;
    }>
  ) {
    const existing = await prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!existing) throw new Error("Invoice not found");

    return prisma.invoice.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status && { status: data.status }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.customerId && { customerId: data.customerId }),
        ...(data.dealId !== undefined && { dealId: data.dealId }),
      },
    });
  }

  static async getInvoices(tenantId: string, page = 1, limit = 20) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = { tenantId };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    // Full-dataset stats via aggregation (not page-scoped)
    const stats = await prisma.invoice.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { id: true },
      _sum: { amount: true },
    });

    const totalCount = stats.reduce((s, r) => s + r._count.id, 0);
    const totalRevenue = stats.reduce((s, r) => s + toNumber(r._sum.amount), 0);
    const paidRevenue = stats.find(r => r.status === "PAID")?._sum.amount ?? 0;

    return {
      stats: [
        { title: "Total Invoices", value: totalCount.toString() },
        { title: "Total Revenue", value: formatCurrency(totalRevenue, "USD"), valueAmount: totalRevenue },
        { title: "Paid Revenue", value: formatCurrency(toNumber(paidRevenue), "USD"), valueAmount: toNumber(paidRevenue) },
        { title: "Outstanding", value: formatCurrency(totalRevenue - toNumber(paidRevenue), "USD"), valueAmount: totalRevenue - toNumber(paidRevenue) },
      ],
      invoices: invoices.map((inv) => ({
        id: inv.id,
        tenantId: inv.tenantId,
        customerId: inv.customerId,
        dealId: inv.dealId,
        amount: toNumber(inv.amount),
        amountFormatted: formatCurrency(toNumber(inv.amount), "USD"),
        status: inv.status,
        dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
        createdAt: inv.createdAt.toISOString(),
        updatedAt: inv.updatedAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getInvoiceById(tenantId: string, id: string) {
    return prisma.invoice.findFirst({ where: { id, tenantId } });
  }

  static async deleteInvoice(tenantId: string, id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({ where: { id, tenantId } });
      if (!invoice) throw new Error("Invoice not found");

      await tx.invoice.delete({ where: { id, tenantId } });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "INVOICE_DELETED",
          module: "INVOICES",
          details: { invoiceId: id, amount: invoice.amount, customerId: invoice.customerId },
        },
      });

      return { id };
    });
  }

  static async updateInvoiceStatus(tenantId: string, id: string, status: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) throw new Error("Invoice not found");

    // Guard against invalid backward transitions
    if (invoice.status === "PAID" && status === "DRAFT") {
      throw new Error("Cannot revert a PAID invoice to DRAFT.");
    }

    return prisma.invoice.update({ where: { id, tenantId }, data: { status } });
  }
}
