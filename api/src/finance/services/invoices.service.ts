import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { Prisma } from '@prisma/client';
import {
  toNumber,
  formatCurrency,
} from '../../common/utils/crm-formatters.util';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private async getTenantCurrency(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { currency: true },
    });
    return tenant?.currency || 'USD';
  }

  /**
   * Atomically increments the tenant's invoice counter using a raw UPDATE...RETURNING
   * query. This is safe under concurrent requests because the DB serialises the
   * UPDATE itself — no two callers can increment from the same value.
   *
   * Returns the newly allocated sequence number (1-based).
   */
  private async allocateInvoiceNumber(
    tenantId: string,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    // Upsert the counter row first (idempotent — does nothing if it already exists).
    // We use raw SQL to do an atomic "INSERT ... ON CONFLICT DO UPDATE" so that
    // both the upsert AND the increment happen in a single round-trip.
    const result = await tx.$queryRaw<Array<{ current: number }>>`
      INSERT INTO "InvoiceCounter" ("id", "tenantId", "current")
      VALUES (gen_random_uuid()::text, ${tenantId}, 1)
      ON CONFLICT ("tenantId")
      DO UPDATE SET "current" = "InvoiceCounter"."current" + 1
      RETURNING "current"
    `;

    const seq = result[0].current;
    return `INV-${String(seq).padStart(4, '0')}`;
  }

  async createInvoice(
    tenantId: string,
    userId: string,
    data: CreateInvoiceDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Atomically allocate the next invoice number for this tenant
      const invoiceNumber = await this.allocateInvoiceNumber(tenantId, tx);

      // 2. Create the invoice
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          customerId: data.customerId,
          dealId: data.dealId || null,
          invoiceNumber,
          amount: data.amount,
          status: data.status || 'DRAFT',
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        },
      });

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'INVOICE_CREATED',
          module: 'INVOICES',
          details: {
            invoiceId: invoice.id,
            invoiceNumber,
            amount: data.amount,
            customerId: data.customerId,
          },
        },
      });

      return invoice;
    }, { timeout: 30000 }); // 30 second timeout for remote DB (Supabase over PgBouncer)
  }

  async updateInvoice(
    tenantId: string,
    id: string,
    data: Partial<CreateInvoiceDto>,
  ) {
    const existing = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Invoice not found');

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status && { status: data.status }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.customerId && { customerId: data.customerId }),
        ...(data.dealId !== undefined && { dealId: data.dealId }),
      },
    });
  }

  async getInvoices(tenantId: string, page = 1, limit = 20) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = { tenantId };

    const [invoices, total, currency] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
      this.getTenantCurrency(tenantId),
    ]);

    const stats = await this.prisma.invoice.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true },
      _sum: { amount: true },
    });

    const totalCount = stats.reduce((s, r) => s + r._count.id, 0);
    const totalRevenue = stats.reduce((s, r) => s + toNumber(r._sum.amount), 0);
    const paidRevenue =
      stats.find((r) => r.status === 'PAID')?._sum.amount ?? 0;

    return {
      stats: [
        { title: 'Total Invoices', value: totalCount.toString() },
        {
          title: 'Total Revenue',
          value: formatCurrency(totalRevenue, currency),
          valueAmount: totalRevenue,
        },
        {
          title: 'Paid Revenue',
          value: formatCurrency(toNumber(paidRevenue), currency),
          valueAmount: toNumber(paidRevenue),
        },
        {
          title: 'Outstanding',
          value: formatCurrency(totalRevenue - toNumber(paidRevenue), currency),
          valueAmount: totalRevenue - toNumber(paidRevenue),
        },
      ],
      invoices: invoices.map((inv) => ({
        id: inv.id,
        tenantId: inv.tenantId,
        customerId: inv.customerId,
        dealId: inv.dealId,
        invoiceNumber: inv.invoiceNumber,
        amount: toNumber(inv.amount),
        amountFormatted: formatCurrency(toNumber(inv.amount), currency),
        status: inv.status,
        dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
        createdAt: inv.createdAt.toISOString(),
        updatedAt: inv.updatedAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getInvoiceById(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) return null;
    return {
      ...invoice,
      amount: toNumber(invoice.amount),
    };
  }

  async deleteInvoice(tenantId: string, id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({ where: { id, tenantId } });
      if (!invoice) throw new NotFoundException('Invoice not found');

      await tx.invoice.delete({ where: { id, tenantId } });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'INVOICE_DELETED',
          module: 'INVOICES',
          details: {
            invoiceId: id,
            invoiceNumber: invoice.invoiceNumber,
            amount: Number(invoice.amount),
            customerId: invoice.customerId,
          },
        },
      });

      return { id };
    });
  }

  async updateInvoiceStatus(tenantId: string, id: string, status: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    if (invoice.status === 'PAID' && status === 'DRAFT') {
      throw new BadRequestException('Cannot revert a PAID invoice to DRAFT.');
    }

    return this.prisma.invoice.update({
      where: { id, tenantId },
      data: { status },
    });
  }
}
