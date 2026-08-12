import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuotationDto } from '../dto/create-quotation.dto';
import {
  UpdateQuotationDto,
  UpdateQuotationStatusDto,
} from '../dto/update-quotation.dto';
import { Prisma, QuotationStatus } from '@prisma/client';
import {
  toNumber,
  formatCurrency,
  formatDate,
} from '../../common/utils/crm-formatters.util';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  private async getTenantCurrency(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { currency: true },
    });
    return tenant?.currency || 'USD';
  }

  private async generateQuoteNumber(
    tenantId: string,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const last = await tx.quotation.findFirst({
      where: { tenantId, quoteNumber: { startsWith: 'QT-' } },
      orderBy: { createdAt: 'desc' },
      select: { quoteNumber: true },
    });
    const lastSeq = last?.quoteNumber
      ? parseInt(last.quoteNumber.replace('QT-', ''), 10)
      : 0;
    const nextSeq = (isNaN(lastSeq) ? 0 : lastSeq) + 1;
    return `QT-${String(nextSeq).padStart(4, '0')}`;
  }

  async createQuotation(tenantId: string, data: CreateQuotationDto) {
    return this.prisma.$transaction(async (tx) => {
      const quoteNumber =
        data.quoteNumber || (await this.generateQuoteNumber(tenantId, tx));
      const quotation = await tx.quotation.create({
        data: {
          tenantId,
          leadId: data.leadId,
          quoteNumber,
          client: data.client,
          amount: data.amount || 0,
          status: data.status || 'DRAFT',
          validTill: data.validTill ? new Date(data.validTill) : null,
          items: data.items || [],
          notes: data.notes || '',
          discount: data.discount || 0,
          tax: data.tax || 0,
        },
      });
      return quotation;
    });
  }

  async updateQuotation(
    tenantId: string,
    id: string,
    data: Partial<CreateQuotationDto>,
  ) {
    const existing = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Quotation not found');

    return this.prisma.quotation.update({
      where: { id },
      data: {
        ...(data.client && { client: data.client }),
        ...(data.leadId && { leadId: data.leadId }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status && { status: data.status }),
        ...(data.validTill !== undefined && {
          validTill: data.validTill ? new Date(data.validTill) : null,
        }),
        ...(data.quoteNumber && { quoteNumber: data.quoteNumber }),
        ...(data.items !== undefined && { items: data.items }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.discount !== undefined && { discount: data.discount }),
        ...(data.tax !== undefined && { tax: data.tax }),
      },
    });
  }

  async deleteQuotation(tenantId: string, id: string) {
    const existing = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Quotation not found');

    return this.prisma.quotation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateQuotationStatus(
    tenantId: string,
    id: string,
    data: UpdateQuotationStatusDto,
  ) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');

    return this.prisma.quotation.update({
      where: { id },
      data: { status: data.status },
    });
  }

  async getQuotations(tenantId: string, page = 1, limit = 10, search = '') {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 10000));
    const skip = (page - 1) * limit;
    const where: Prisma.QuotationWhereInput = { tenantId, deletedAt: null };

    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { client: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [quotations, total, currency] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.quotation.count({ where }),
      this.getTenantCurrency(tenantId),
    ]);

    // Automatic Expiry behavior dynamically encapsulated here without external cron dependencies
    const now = new Date();
    const expiredIds: string[] = [];
    quotations.forEach((q) => {
      if (
        (q.status === 'DRAFT' || q.status === 'SENT') &&
        q.validTill &&
        q.validTill < now
      ) {
        q.status = 'EXPIRED';
        expiredIds.push(q.id);
      }
    });

    if (expiredIds.length > 0) {
      await this.prisma.quotation.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: 'EXPIRED' },
      });
    }

    // Stats from FULL dataset
    const allStats = await this.prisma.quotation.groupBy({
      by: ['status'],
      where: { tenantId, deletedAt: null },
      _count: { id: true },
      _sum: { amount: true },
    });

    const totalCount = allStats.reduce((s, r) => s + r._count.id, 0);
    const totalValue = allStats.reduce(
      (s, r) => s + toNumber(r._sum.amount),
      0,
    );
    const sentCount = allStats.find((r) => r.status === 'SENT')?._count.id ?? 0;
    const acceptedCount =
      allStats.find((r) => r.status === 'APPROVED')?._count.id ?? 0;

    return {
      stats: [
        { title: 'Total Quotations', value: totalCount.toString() },
        {
          title: 'Total Quote Value',
          value: formatCurrency(totalValue, currency),
          valueAmount: totalValue,
        },
        { title: 'Sent Quotes', value: sentCount.toString() },
        { title: 'Accepted Quotes', value: acceptedCount.toString() },
      ],
      quotations: quotations.map((q) => ({
        id: q.id,
        quoteId: q.quoteNumber,
        client: q.client,
        leadId: q.leadId,
        leadName: q.lead?.name || q.client,
        leadDetails: q.lead
          ? {
              name: q.lead.name,
              email: q.lead.email,
              phone: q.lead.phone,
              company: q.lead.company,
            }
          : undefined,
        amount: formatCurrency(toNumber(q.amount), currency),
        amountValue: toNumber(q.amount),
        status: q.status,
        validTill: formatDate(q.validTill || new Date()),
        validTillValue: q.validTill
          ? new Date(q.validTill).toISOString()
          : null,
        items: q.items,
        notes: q.notes,
        discount: toNumber(q.discount),
        tax: toNumber(q.tax),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
