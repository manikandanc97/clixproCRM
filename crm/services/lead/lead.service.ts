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
      const isWon = data.stage === "WON";

      const lead = await tx.lead.create({
        data: {
          tenantId,
          name: data.name,
          company: data.company,
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

      if (isWon) {
        const customer = await tx.customer.create({
          data: {
            tenantId,
            name: lead.name,
            company: lead.company,
            email: lead.email || null,
            revenue: lead.value,
            status: "ACTIVE",
            assignedToId: lead.assignedToId,
            leadId: lead.id
          }
        });

        const updatedLead = await tx.lead.update({
          where: { id: lead.id },
          data: {
            isConverted: true,
            convertedAt: new Date(),
            customerId: customer.id
          }
        });

        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: lead.id,
            action: "Lead Converted to Customer",
            description: `Lead converted to customer (${customer.name})`,
            userId
          }
        });

        return updatedLead;
      }

      return lead;
    });
  }

  static async updateLead(tenantId: string, userId: string, id: string, data: ReturnType<typeof JSON.parse>) {
    return await prisma.$transaction(async (tx) => {
      const existingLead = await tx.lead.findUnique({
        where: { id, tenantId },
        select: { id: true, stage: true, name: true, company: true, email: true, phone: true, assignedToId: true, customerId: true, isConverted: true }
      });
      if (!existingLead) throw new Error("Lead not found");

      const targetStage = data.stage || existingLead.stage;
      const isWon = targetStage === "WON";
      const wasWon = existingLead.stage === "WON";
      const stageChanged = data.stage && existingLead.stage !== data.stage;

      const lead = await tx.lead.update({
        where: { id, tenantId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.company && { company: data.company }),
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
          updatedById: userId,
          lastActivityAt: new Date()
        }
      });

      if (stageChanged) {
        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: id,
            action: "Stage Changed",
            description: `Moved from ${existingLead.stage} to ${data.stage}`,
            userId
          }
        });
      }

      // Transition to WON
      if (isWon) {
        let customer = null;
        const cid = lead.customerId || existingLead.customerId;
        if (cid) {
          customer = await tx.customer.findFirst({ where: { id: cid, tenantId, deletedAt: null } });
        }
        if (!customer && lead.email && lead.email.trim() !== "") {
          customer = await tx.customer.findFirst({
            where: { tenantId, email: lead.email.trim(), deletedAt: null }
          });
        }
        if (!customer) {
          customer = await tx.customer.findFirst({
            where: { tenantId, name: lead.name.trim(), company: lead.company.trim(), deletedAt: null }
          });
        }

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              tenantId,
              name: lead.name,
              company: lead.company,
              email: lead.email || null,
              revenue: lead.value,
              status: "ACTIVE",
              assignedToId: lead.assignedToId,
              leadId: lead.id
            }
          });
        } else {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              name: lead.name,
              company: lead.company,
              email: lead.email || customer.email,
              revenue: lead.value,
              status: "ACTIVE",
              assignedToId: lead.assignedToId || customer.assignedToId,
              leadId: lead.id,
              deletedAt: null
            }
          });
        }

        const updatedLead = await tx.lead.update({
          where: { id: lead.id },
          data: {
            isConverted: true,
            convertedAt: lead.convertedAt || new Date(),
            customerId: customer.id
          }
        });

        if (stageChanged) {
          await tx.timelineEvent.create({
            data: {
              tenantId,
              leadId: id,
              action: "Lead Converted to Customer",
              description: `Lead converted to customer (${customer.name})`,
              userId
            }
          });

          if (userId) {
            await tx.notification.create({
              data: {
                tenantId,
                userId,
                type: "DEAL_WON",
                title: "Deal Won & Customer Created!",
                message: `Lead ${lead.name} (${lead.company}) was marked as Won and converted to a Customer.`,
                isRead: false
              }
            }).catch(() => {});
          }
        }

        return updatedLead;

      // Transition FROM WON to non-WON (New Lead, Contacted, Proposal Sent, Lost)
      } else if (wasWon && !isWon) {
        const cid = existingLead.customerId || lead.customerId;
        let customer = cid ? await tx.customer.findFirst({ where: { id: cid, tenantId, deletedAt: null } }) : null;
        if (!customer && existingLead.email) {
          customer = await tx.customer.findFirst({
            where: { tenantId, email: existingLead.email, deletedAt: null }
          });
        }
        if (!customer) {
          customer = await tx.customer.findFirst({
            where: { tenantId, name: existingLead.name, company: existingLead.company, deletedAt: null }
          });
        }

        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: { deletedAt: new Date(), status: "INACTIVE" }
          });
        }

        const updatedLead = await tx.lead.update({
          where: { id: lead.id },
          data: {
            isConverted: false,
            convertedAt: null,
            customerId: null
          }
        });

        if (stageChanged) {
          await tx.timelineEvent.create({
            data: {
              tenantId,
              leadId: id,
              action: "Lead Demoted from Won",
              description: `Moved from Won to ${data.stage}. Customer record removed.`,
              userId
            }
          });
        }

        return updatedLead;
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
          isConverted: false,
          convertedAt: null,
          customerId: null,
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

      if (existing.stage === "WON" || existing.customerId) {
        const custId = existing.customerId;
        let customer = custId ? await tx.customer.findFirst({ where: { id: custId, tenantId, deletedAt: null } }) : null;
        if (!customer && existing.email) {
          customer = await tx.customer.findFirst({
            where: { tenantId, email: existing.email, deletedAt: null }
          });
        }
        if (!customer) {
          customer = await tx.customer.findFirst({
            where: { tenantId, name: existing.name, company: existing.company, deletedAt: null }
          });
        }

        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: { deletedAt: new Date(), status: "INACTIVE" }
          });
        }
      }

      return lead;
    });
  }

  static async getHotLeads(tenantId: string) {
    const leads = await prisma.lead.findMany({ where: { tenantId, stage: "NEW" }, take: 5, orderBy: { createdAt: 'desc' } });
    return leads.map(l => ({ id: l.id, name: l.name, company: l.company, score: 90, value: formatCurrency(toNumber(l.value), "USD") }));
  }
}


