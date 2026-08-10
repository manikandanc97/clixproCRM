import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  formatCurrency,
  getStatusLabel,
  toNumber,
  LEAD_STATUS_LABELS
} from "@/lib/crm-formatters";


export class LeadService {
  static async getLeads(tenantId: string, currency = "USD", page = 1, limit = 10, search = "", stage?: string) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.LeadWhereInput = { tenantId, deletedAt: null };
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (stage) where.stage = stage as ReturnType<typeof JSON.parse>;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true, name: true, company: true, email: true, phone: true, source: true,
          stage: true, priority: true, assignedToId: true, value: true, expectedCloseDate: true,
          tags: true, isConverted: true, convertedAt: true, customerId: true, lastActivityAt: true, createdAt: true, updatedAt: true,
          _count: { select: { notes: true, meetings: true } },
          meetings: {
            where: { startTime: { gte: new Date() } },
            orderBy: { startTime: "asc" },
            take: 1,
            select: { startTime: true, title: true }
          }
        }
      }),
      prisma.lead.count({ where }),
    ]);

    const emails = leads.map(l => l.email).filter(Boolean);
    const customers = await prisma.customer.findMany({
      where: { tenantId, email: { in: emails }, deletedAt: null },
      select: { id: true, email: true }
    });
    const customerMap = new Map(customers.map(c => [c.email, c.id]));

    return {
      summary: { total },
      leads: leads.map((lead: ReturnType<typeof JSON.parse>) => {
        const customerId = lead.email ? customerMap.get(lead.email) : undefined;
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
          isConverted: !!customerId || lead.stage === "WON",
          notesCount: lead._count?.notes || 0,
          meetingsCount: lead._count?.meetings || 0,
          upcomingMeeting: lead.meetings && lead.meetings.length > 0 ? lead.meetings[0] : null,
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async createLead(tenantId: string, userId: string, data: ReturnType<typeof JSON.parse>) {
    return await prisma.$transaction(async (tx) => {
      if (data.assignedToId && data.assignedToId !== userId) {
        const isValidAssignee = await tx.tenantUser.findFirst({
          where: { userId: data.assignedToId, tenantId, status: "ACTIVE" }
        });
        if (!isValidAssignee) {
          throw new Error("Invalid assignment: User does not belong to this workspace or is inactive.");
        }
      }

      const isWon = data.stage === "WON";
      let companyId = null;
      const companyName = data.company ? data.company.trim() : null;
      if (companyName) {
        let company = await tx.company.findFirst({
          where: { tenantId, name: { equals: companyName, mode: "insensitive" } }
        });
        if (!company) {
          company = await tx.company.create({
            data: {
              tenantId,
              name: companyName,
              ownerId: userId,
              status: "ACTIVE"
            }
          });
        }
        companyId = company.id;
      }

      const lead = await tx.lead.create({
        data: {
          tenantId,
          name: data.name,
          company: companyName || "Unknown Company",
          companyId,
          email: data.email,
          phone: data.phone,
          source: data.source || "Direct",
          stage: data.stage || "NEW",
          priority: data.priority || "MEDIUM",
          value: data.valueAmount || data.value || 0,
          expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
          tags: data.tags || [],
          assignedToId: data.assignedToId || userId,
          createdById: userId,
          isConverted: isWon,
          convertedAt: isWon ? new Date() : null,
        }
      });
      
      await tx.timelineEvent.create({
        data: {
          tenantId,
          leadId: lead.id,
          action: "Lead Created",
          description: `Created lead for ${data.company}`,
          userId
        }
      });

      return lead;
    });
  }

  static async updateLead(tenantId: string, userId: string, id: string, data: ReturnType<typeof JSON.parse>) {
    return await prisma.$transaction(async (tx) => {
      const existingLead = await tx.lead.findUnique({
        where: { id, tenantId },
        select: { id: true, stage: true, name: true, company: true, email: true, phone: true, assignedToId: true, customerId: true, isConverted: true, value: true }
      });
      if (!existingLead) throw new Error("Lead not found");

      const targetStage = data.stage || existingLead.stage;
      const isWon = targetStage === "WON";
      const wasWon = existingLead.stage === "WON";
      const stageChanged = data.stage && existingLead.stage !== data.stage;
      let finalCompanyId = undefined;
      let finalCompanyName = undefined;
      
      if (data.company !== undefined && data.company !== existingLead.company) {
        finalCompanyName = data.company.trim();
        if (finalCompanyName) {
          let company = await tx.company.findFirst({
            where: { tenantId, name: { equals: finalCompanyName, mode: "insensitive" } }
          });
          if (!company) {
            company = await tx.company.create({
              data: {
                tenantId,
                name: finalCompanyName,
                ownerId: userId,
                status: "ACTIVE"
              }
            });
          }
          finalCompanyId = company.id;
        } else {
          finalCompanyId = null;
          finalCompanyName = "Unknown Company";
        }
      }

      if (data.assignedToId && data.assignedToId !== existingLead.assignedToId && data.assignedToId !== userId) {
        const isValidAssignee = await tx.tenantUser.findFirst({
          where: { userId: data.assignedToId, tenantId, status: "ACTIVE" }
        });
        if (!isValidAssignee) {
          throw new Error("Invalid assignment: User does not belong to this workspace or is inactive.");
        }
      }

      let customerId = existingLead.customerId;
      if (isWon && !wasWon && !customerId) {
        // We need to auto-create a Customer upon winning the lead if it doesn't have one
        const customer = await tx.customer.create({
          data: {
            tenantId,
            name: data.name || existingLead.name,
            email: data.email || existingLead.email || null,
            company: finalCompanyName || existingLead.company || null,
            companyId: finalCompanyId,
            status: "ACTIVE"
          }
        });
        customerId = customer.id;
      }

      const lead = await tx.lead.update({
        where: { id, tenantId },
        data: {
          ...(data.name && { name: data.name }),
          ...(finalCompanyName !== undefined && { company: finalCompanyName }),
          ...(finalCompanyId !== undefined && { companyId: finalCompanyId }),
          ...(data.email && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.source && { source: data.source }),
          ...(data.value !== undefined && { value: data.value }),
          ...(data.valueAmount !== undefined && data.value === undefined && { value: data.valueAmount }),
          ...(data.stage && { stage: data.stage }),
          ...(data.priority && { priority: data.priority }),
          ...(data.expectedCloseDate !== undefined && { expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null }),
          ...(data.tags && { tags: data.tags }),
          ...(data.assignedToId && { assignedToId: data.assignedToId }),
          ...(isWon && !wasWon && { isConverted: true, convertedAt: new Date(), customerId }),
          updatedById: userId,
          lastActivityAt: new Date()
        }
      });

      if (stageChanged) {
        let description = `Moved from ${existingLead.stage} to ${data.stage}`;
        if (data.stage === "WON") {
          description += `. Revenue: ${data.actualRevenue || data.value || existingLead.value || 0}. Reason: ${data.wonReason || "Not specified"}. ${data.notes ? `Notes: ${data.notes}` : ""}`;
        } else if (data.stage === "LOST") {
          description += `. Reason: ${data.lostReason || "Not specified"}. Competitor: ${data.competitor || "None"}. ${data.notes ? `Notes: ${data.notes}` : ""}`;
        }
        
        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: id,
            action: "Stage Changed",
            description,
            userId
          }
        });
      }
      return lead;
    });
  }

  static async deleteLead(tenantId: string, userId: string, id: string) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.lead.findUnique({
        where: { id, tenantId },
        select: { id: true, stage: true, customerId: true, email: true, name: true, company: true }
      });
      if (!existing) throw new Error("Lead not found");

      const lead = await tx.lead.update({
        where: { id, tenantId },
        data: {
          deletedAt: new Date(),
          updatedById: userId,
          lastActivityAt: new Date()
        }
      });

      await tx.timelineEvent.create({
        data: {
          tenantId,
          leadId: id,
          action: "Lead Deleted",
          description: `Lead was softly deleted`,
          userId
        }
      });

      return lead;
    });
  }

  static async bulkDeleteLeads(tenantId: string, userId: string, ids: string[]) {
    return await prisma.$transaction(async (tx) => {
      const leads = await tx.lead.updateMany({
        where: { id: { in: ids }, tenantId },
        data: {
          deletedAt: new Date(),
          updatedById: userId,
          lastActivityAt: new Date()
        }
      });

      const timelineEvents = ids.map(id => ({
        tenantId,
        leadId: id,
        action: "Lead Deleted",
        description: `Lead was softly deleted (Bulk)`,
        userId
      }));

      if (timelineEvents.length > 0) {
        await tx.timelineEvent.createMany({ data: timelineEvents });
      }

      return leads;
    });
  }

  static async getHotLeads(tenantId: string) {
    const leads = await prisma.lead.findMany({
      where: { tenantId, stage: "NEW", deletedAt: null },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, company: true, value: true }
    });
    return leads.map(l => ({ id: l.id, name: l.name, company: l.company, score: 90, value: formatCurrency(toNumber(l.value), "USD") }));
  }
}


