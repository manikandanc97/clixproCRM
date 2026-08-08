import prisma from "@/lib/prisma";
import { Prisma, DealStage } from "@prisma/client";

export class DealService {
  static async getDeals(tenantId: string, page = 1, limit = 10, search = "") {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    
    const where: Prisma.DealWhereInput = { tenantId };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
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
      where: { id, tenantId },
      include: {
        company: true,
        customer: true,
        owner: true,
        tasks: true,
        meetings: true,
        quotations: true,
        invoices: true,
        timelineEvents: { orderBy: { createdAt: "desc" } }
      }
    });
  }

  static async createDeal(tenantId: string, data: any, userId: string) {
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

  static async updateDeal(tenantId: string, id: string, data: any, userId: string) {
    const oldDeal = await prisma.deal.findUnique({ where: { id, tenantId } });
    if (!oldDeal) throw new Error("Deal not found");

    const deal = await prisma.deal.update({
      where: { id, tenantId },
      data,
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

    if (data.status === "WON" && oldDeal.status !== "WON") {
      await prisma.timelineEvent.create({
        data: {
          tenantId,
          action: "DEAL_WON",
          description: `Deal marked as WON!`,
          userId,
          dealId: deal.id,
        }
      });
    } else if (data.status === "LOST" && oldDeal.status !== "LOST") {
      await prisma.timelineEvent.create({
        data: {
          tenantId,
          action: "DEAL_LOST",
          description: `Deal marked as LOST. Reason: ${data.lostReason || "Not specified"}`,
          userId,
          dealId: deal.id,
        }
      });
    }

    return deal;
  }

  static async deleteDeal(tenantId: string, id: string) {
    return prisma.deal.delete({
      where: { id, tenantId }
    });
  }
}
