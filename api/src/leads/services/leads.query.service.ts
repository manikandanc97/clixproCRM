import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, LeadStage } from '@prisma/client';
import {
  formatCurrency,
  getStatusLabel,
  toNumber,
  LEAD_STATUS_LABELS,
} from '../../common/utils/crm-formatters.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { getCachedTenantCurrency } from '../../common/utils/tenant-cache.util';

/**
 * @file leads/services/leads.query.service.ts
 * Query, filter, format, and pagination operations for Leads.
 */
@Injectable()
export class LeadsQueryService {
  constructor(private readonly prisma: PrismaService) {}

  private async getTenantCurrency(tenantId: string): Promise<string> {
    return getCachedTenantCurrency(this.prisma, tenantId);
  }

  async getLeads(
    tenantId: string,
    query: PaginationQueryDto & { stage?: string; status?: string },
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(query.limit || 50, 10000));
    const skip = (page - 1) * limit;
    const search = query.search || '';
    const stageQuery = query.stage || query.status || '';

    const where: Prisma.LeadWhereInput = { tenantId, deletedAt: null };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (stageQuery) {
      where.stage = stageQuery as LeadStage;
    }

    const [currency, leads, total] = await Promise.all([
      this.getTenantCurrency(tenantId),
      this.prisma.lead.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          phone: true,
          source: true,
          stage: true,
          priority: true,
          assignedToId: true,
          value: true,
          expectedCloseDate: true,
          tags: true,
          isConverted: true,
          convertedAt: true,
          customerId: true,
          lastActivityAt: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { notes: true, meetings: true } },
          meetings: {
            where: { startTime: { gte: new Date() } },
            orderBy: { startTime: 'asc' },
            take: 1,
            select: { startTime: true, title: true },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      summary: { total },
      leads: leads.map((lead) => {
        const customerId = lead.customerId;
        return {
          id: lead.id,
          name: lead.name,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          stage: lead.stage,
          status: getStatusLabel(LEAD_STATUS_LABELS, lead.stage),
          priority: lead.priority,
          value: formatCurrency(lead.value, currency),
          valueAmount: toNumber(lead.value),
          expectedCloseDate: lead.expectedCloseDate,
          tags: lead.tags,
          lastActivityAt: lead.lastActivityAt,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          customerId,
          isConverted: !!customerId || lead.isConverted || lead.stage === 'WON',
          notesCount: lead._count?.notes || 0,
          meetingsCount: lead._count?.meetings || 0,
          upcomingMeeting:
            lead.meetings && lead.meetings.length > 0 ? lead.meetings[0] : null,
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getHotLeads(tenantId: string) {
    const [currency, leads] = await Promise.all([
      this.getTenantCurrency(tenantId),
      this.prisma.lead.findMany({
        where: { tenantId, stage: 'NEW', deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, company: true, value: true },
      }),
    ]);
    return leads.map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company,
      score: 90,
      value: formatCurrency(toNumber(l.value), currency),
    }));
  }
}
