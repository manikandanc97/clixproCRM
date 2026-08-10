import prisma from "@/lib/prisma";
import { Prisma, DealStage } from "@prisma/client";

export class DealService {
  static async getDeals(tenantId: string, page = 1, limit = 10, search = "") {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    
    const where: Prisma.DealWhereInput = { tenantId, deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
        { customer: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          company: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true } }
        }
      }),
      prisma.deal.count({ where }),
    ]);
    
    return {
      deals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getDealById(tenantId: string, id: string) {
    return prisma.deal.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        company: { select: { id: true, name: true, industry: true, website: true, email: true, phone: true } },
        customer: { select: { id: true, name: true, email: true, company: true, status: true } },
        owner: { select: { id: true, name: true, email: true } },
        tasks: { where: { deletedAt: null }, take: 50, orderBy: { createdAt: "desc" } },
        meetings: { take: 20, orderBy: { startTime: "desc" } },
        quotations: { where: { deletedAt: null }, take: 20, orderBy: { createdAt: "desc" } },
        invoices: { take: 20, orderBy: { createdAt: "desc" } },
        timelineEvents: { orderBy: { createdAt: "desc" }, take: 50 }
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async createDeal(tenantId: string, data: any, userId: string) {
    if (data.ownerId && data.ownerId !== userId) {
      const isValidOwner = await prisma.tenantUser.findFirst({
        where: { userId: data.ownerId, tenantId, status: "ACTIVE" }
      });
      if (!isValidOwner) throw new Error("Invalid deal owner");
    }

    const deal = await prisma.deal.create({
      data: {
        tenantId,
        name: data.name,
        companyId: data.companyId,
        customerId: data.customerId,
        value: data.value || 0,
        stage: data.stage || DealStage.NEW,
        probability: data.probability || 0,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        ownerId: data.ownerId || userId,
        source: data.source || "Direct",
        description: data.description,
        status: "OPEN",
        leadId: data.leadId,
      }
    });

    await prisma.timelineEvent.create({
      data: {
        tenantId,
        action: "DEAL_CREATED",
        description: `Deal created: ${deal.name}`,
        userId,
        dealId: deal.id,
      }
    });

    return deal;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async updateDeal(tenantId: string, id: string, data: any, userId: string) {
    const oldDeal = await prisma.deal.findUnique({ where: { id, tenantId } });
    if (!oldDeal) throw new Error("Deal not found");

    const {
      wonReason: _wonReason,
      wonDate: _wonDate,
      actualRevenue: _actualRevenue,
      notes: _notes,
      competitor: _competitor,
      ...cleanData
    } = data;

    if (cleanData.ownerId && cleanData.ownerId !== oldDeal.ownerId && cleanData.ownerId !== userId) {
      const isValidOwner = await prisma.tenantUser.findFirst({
        where: { userId: cleanData.ownerId, tenantId, status: "ACTIVE" }
      });
      if (!isValidOwner) throw new Error("Invalid deal owner");
    }

    const deal = await prisma.deal.update({
      where: { id, tenantId },
      data: cleanData,
    });

    if (data.stage && oldDeal.stage !== data.stage) {
      await prisma.timelineEvent.create({
        data: {
          tenantId,
          action: "STAGE_CHANGED",
          description: `Stage changed from ${oldDeal.stage} to ${data.stage}`,
          userId,
          dealId: deal.id,
        }
      });
    }

    if (data.stage === "WON" && oldDeal.stage !== "WON") {
      await prisma.timelineEvent.create({
        data: {
          tenantId,
          action: "DEAL_WON",
          description: `Deal marked as WON! Revenue: ${data.actualRevenue || deal.value}. Reason: ${data.wonReason || "Not specified"}. ${data.notes ? `Notes: ${data.notes}` : ""}`,
          userId,
          dealId: deal.id,
        }
      });
    } else if (data.stage === "LOST" && oldDeal.stage !== "LOST") {
      await prisma.timelineEvent.create({
        data: {
          tenantId,
          action: "DEAL_LOST",
          description: `Deal marked as LOST. Reason: ${data.lostReason || "Not specified"}. Competitor: ${data.competitor || "None"}. ${data.notes ? `Notes: ${data.notes}` : ""}`,
          userId,
          dealId: deal.id,
        }
      });
    }

    return deal;
  }

  static async deleteDeal(tenantId: string, id: string) {
    return prisma.deal.update({
      where: { id, tenantId },
      data: { deletedAt: new Date(), status: "INACTIVE" as const }
    });
  }

  static async bulkDeleteDeals(tenantId: string, ids: string[]) {
    return prisma.deal.updateMany({
      where: { id: { in: ids }, tenantId },
      data: { deletedAt: new Date(), status: "INACTIVE" as const }
    });
  }
}
