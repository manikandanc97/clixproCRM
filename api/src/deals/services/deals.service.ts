import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, DealStage } from '@prisma/client';
import { CreateDealDto } from '../dto/create-deal.dto';
import { UpdateDealDto } from '../dto/update-deal.dto';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDeals(tenantId: string, page = 1, limit = 10, search = '') {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;

    const where: Prisma.DealWhereInput = { tenantId, deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          company: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true } },
        },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      deals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDealById(tenantId: string, id: string) {
    return this.prisma.deal.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            website: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            status: true,
          },
        },
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          where: { deletedAt: null },
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        meetings: { take: 20, orderBy: { startTime: 'desc' } },
        quotations: {
          where: { deletedAt: null },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        invoices: { take: 20, orderBy: { createdAt: 'desc' } },
        timelineEvents: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
  }

  async createDeal(tenantId: string, userId: string, data: CreateDealDto) {
    if (data.ownerId && data.ownerId !== userId) {
      const isValidOwner = await this.prisma.tenantUser.findFirst({
        where: { userId: data.ownerId, tenantId, status: 'ACTIVE' },
      });
      if (!isValidOwner) throw new BadRequestException('Invalid deal owner');
    }

    return this.prisma.$transaction(async (tx) => {
      const deal = await tx.deal.create({
        data: {
          tenantId,
          name: data.name,
          companyId: data.companyId,
          customerId: data.customerId,
          value: data.value || 0,
          stage: data.stage || DealStage.NEW,
          probability: data.probability || 0,
          expectedCloseDate: data.expectedCloseDate
            ? new Date(data.expectedCloseDate)
            : null,
          ownerId: data.ownerId || userId,
          source: data.source || 'Direct',
          description: data.description,
          status: 'OPEN',
          leadId: data.leadId,
        },
      });

      await tx.timelineEvent.create({
        data: {
          tenantId,
          action: 'DEAL_CREATED',
          description: `Deal created: ${deal.name}`,
          userId,
          dealId: deal.id,
        },
      });

      return deal;
    });
  }

  async updateDeal(
    tenantId: string,
    id: string,
    userId: string,
    data: UpdateDealDto,
  ) {
    const oldDeal = await this.prisma.deal.findUnique({
      where: { id, tenantId },
    });
    if (!oldDeal) throw new NotFoundException('Deal not found');

    const {
      wonReason,
      actualRevenue,
      notes,
      competitor,
      lostReason,
      ...cleanData
    } = data;

    if (
      cleanData.ownerId &&
      cleanData.ownerId !== oldDeal.ownerId &&
      cleanData.ownerId !== userId
    ) {
      const isValidOwner = await this.prisma.tenantUser.findFirst({
        where: { userId: cleanData.ownerId, tenantId, status: 'ACTIVE' },
      });
      if (!isValidOwner) throw new BadRequestException('Invalid deal owner');
    }

    const updateData: any = { ...cleanData };
    if (cleanData.expectedCloseDate) {
      updateData.expectedCloseDate = new Date(cleanData.expectedCloseDate);
    }

    return this.prisma.$transaction(async (tx) => {
      const deal = await tx.deal.update({
        where: { id, tenantId },
        data: updateData,
      });

      if (cleanData.stage && oldDeal.stage !== cleanData.stage) {
        await tx.timelineEvent.create({
          data: {
            tenantId,
            action: 'STAGE_CHANGED',
            description: `Stage changed from ${oldDeal.stage} to ${cleanData.stage}`,
            userId,
            dealId: deal.id,
          },
        });
      }

      if (cleanData.stage === 'WON' && oldDeal.stage !== 'WON') {
        await tx.timelineEvent.create({
          data: {
            tenantId,
            action: 'DEAL_WON',
            description: `Deal marked as WON! Revenue: ${actualRevenue || deal.value}. Reason: ${wonReason || 'Not specified'}. ${notes ? `Notes: ${notes}` : ''}`,
            userId,
            dealId: deal.id,
          },
        });
      } else if (cleanData.stage === 'LOST' && oldDeal.stage !== 'LOST') {
        await tx.timelineEvent.create({
          data: {
            tenantId,
            action: 'DEAL_LOST',
            description: `Deal marked as LOST. Reason: ${lostReason || 'Not specified'}. Competitor: ${competitor || 'None'}. ${notes ? `Notes: ${notes}` : ''}`,
            userId,
            dealId: deal.id,
          },
        });
      }

      return deal;
    });
  }

  async deleteDeal(tenantId: string, id: string) {
    return this.prisma.deal.update({
      where: { id, tenantId },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async bulkDeleteDeals(tenantId: string, ids: string[]) {
    return this.prisma.deal.updateMany({
      where: { id: { in: ids }, tenantId },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }
}
