import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { ConvertLeadDto } from '../dto/convert-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { LeadsQueryService } from './leads.query.service';
import { LeadsConvertService } from './leads.convert.service';

/**
 * @file leads/services/leads.service.ts
 * Leads core CRUD service.
 * Query & formatting logic is in leads.query.service.ts.
 * Conversion logic is in leads.convert.service.ts.
 */
@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leadsQueryService: LeadsQueryService,
    private readonly leadsConvertService: LeadsConvertService,
  ) {}

  // ─── Query Delegation ───────────────────────────────────────────────────────

  async getLeads(
    tenantId: string,
    query: PaginationQueryDto & { stage?: string; status?: string },
  ) {
    return this.leadsQueryService.getLeads(tenantId, query);
  }

  async getHotLeads(tenantId: string) {
    return this.leadsQueryService.getHotLeads(tenantId);
  }

  // ─── Conversion Delegation ──────────────────────────────────────────────────

  async convertLead(
    tenantId: string,
    userId: string,
    leadId: string,
    data: ConvertLeadDto,
  ) {
    return this.leadsConvertService.convertLead(tenantId, userId, leadId, data);
  }

  // ─── Core CRUD Operations ───────────────────────────────────────────────────

  async createLead(tenantId: string, userId: string, data: CreateLeadDto) {
    return this.prisma.$transaction(async (tx) => {
      if (data.assignedToId && data.assignedToId !== userId) {
        const isValidAssignee = await tx.tenantUser.findFirst({
          where: { userId: data.assignedToId, tenantId, status: 'ACTIVE' },
        });
        if (!isValidAssignee) {
          throw new BadRequestException(
            'Invalid assignment: User does not belong to this workspace or is inactive.',
          );
        }
      }

      const isWon = data.stage === 'WON';
      let companyId = null;
      const companyName = data.company ? data.company.trim() : null;
      if (companyName) {
        let company = await tx.company.findFirst({
          where: {
            tenantId,
            name: { equals: companyName, mode: 'insensitive' },
          },
        });
        if (!company) {
          company = await tx.company.create({
            data: {
              tenantId,
              name: companyName,
              ownerId: userId,
              status: 'ACTIVE',
            },
          });
        }
        companyId = company.id;
      }

      const lead = await tx.lead.create({
        data: {
          tenantId,
          name: data.name,
          company: companyName || 'Unknown Company',
          companyId,
          email: data.email,
          phone: data.phone,
          source: data.source || 'Direct',
          stage: data.stage || 'NEW',
          priority: data.priority || 'MEDIUM',
          value: data.valueAmount || data.value || 0,
          expectedCloseDate: data.expectedCloseDate
            ? new Date(data.expectedCloseDate)
            : null,
          tags: data.tags || [],
          assignedToId: data.assignedToId || userId,
          createdById: userId,
          isConverted: isWon,
          convertedAt: isWon ? new Date() : null,
        },
      });

      await tx.timelineEvent.create({
        data: {
          tenantId,
          leadId: lead.id,
          action: 'Lead Created',
          description: `Created lead for ${companyName || 'Unknown Company'}`,
          userId,
        },
      });

      return lead;
    });
  }

  async getLeadById(tenantId: string, leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId, tenantId, deletedAt: null },
      include: {
        companyRecord: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            notes: true,
            meetings: true,
            attachments: true,
            timelineEvents: true,
          },
        },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateLead(
    tenantId: string,
    userId: string,
    id: string,
    data: UpdateLeadDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existingLead = await tx.lead.findUnique({
        where: { id, tenantId },
        select: {
          id: true,
          stage: true,
          name: true,
          company: true,
          email: true,
          phone: true,
          assignedToId: true,
          customerId: true,
          isConverted: true,
          value: true,
        },
      });
      if (!existingLead) throw new NotFoundException('Lead not found');

      const targetStage = data.stage || existingLead.stage;
      const isWon = targetStage === 'WON';
      const wasWon = existingLead.stage === 'WON';
      const stageChanged = data.stage && existingLead.stage !== data.stage;
      let finalCompanyId = undefined;
      let finalCompanyName = undefined;

      if (data.company !== undefined && data.company !== existingLead.company) {
        finalCompanyName = data.company.trim();
        if (finalCompanyName) {
          let company = await tx.company.findFirst({
            where: {
              tenantId,
              name: { equals: finalCompanyName, mode: 'insensitive' },
            },
          });
          if (!company) {
            company = await tx.company.create({
              data: {
                tenantId,
                name: finalCompanyName,
                ownerId: userId,
                status: 'ACTIVE',
              },
            });
          }
          finalCompanyId = company.id;
        } else {
          finalCompanyId = null;
          finalCompanyName = 'Unknown Company';
        }
      }

      if (
        data.assignedToId &&
        data.assignedToId !== existingLead.assignedToId &&
        data.assignedToId !== userId
      ) {
        const isValidAssignee = await tx.tenantUser.findFirst({
          where: { userId: data.assignedToId, tenantId, status: 'ACTIVE' },
        });
        if (!isValidAssignee) {
          throw new BadRequestException(
            'Invalid assignment: User does not belong to this workspace or is inactive.',
          );
        }
      }

      let customerId = existingLead.customerId;
      if (isWon && !wasWon && !customerId) {
        const customer = await tx.customer.create({
          data: {
            tenantId,
            name: data.name || existingLead.name,
            email: data.email || existingLead.email || null,
            company: finalCompanyName || existingLead.company || '',
            companyId: finalCompanyId,
            status: 'ACTIVE',
          },
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
          ...(data.valueAmount !== undefined &&
            data.value === undefined && { value: data.valueAmount }),
          ...(data.stage && { stage: data.stage }),
          ...(data.priority && { priority: data.priority }),
          ...(data.expectedCloseDate !== undefined && {
            expectedCloseDate: data.expectedCloseDate
              ? new Date(data.expectedCloseDate)
              : null,
          }),
          ...(data.tags && { tags: data.tags }),
          ...(data.assignedToId && { assignedToId: data.assignedToId }),
          ...(isWon &&
            !wasWon && {
              isConverted: true,
              convertedAt: new Date(),
              customerId,
            }),
          updatedById: userId,
          lastActivityAt: new Date(),
        },
      });

      if (stageChanged) {
        let description = `Moved from ${existingLead.stage} to ${data.stage}`;
        if (data.stage === 'WON') {
          description +=
            '. Revenue: ' +
            (data.actualRevenue || data.value || existingLead.value || 0) +
            '. Reason: ' +
            (data.wonReason || 'Not specified') +
            '. ' +
            (data.notes ? 'Notes: ' + data.notes : '');
        } else if (data.stage === 'LOST') {
          description +=
            '. Reason: ' +
            (data.lostReason || 'Not specified') +
            '. Competitor: ' +
            (data.competitor || 'None') +
            '. ' +
            (data.notes ? 'Notes: ' + data.notes : '');
        }

        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: id,
            action: 'Stage Changed',
            description,
            userId,
          },
        });
      }
      return lead;
    });
  }

  async deleteLead(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.lead.findUnique({
        where: { id, tenantId },
        select: {
          id: true,
          stage: true,
          customerId: true,
          email: true,
          name: true,
          company: true,
        },
      });
      if (!existing) throw new NotFoundException('Lead not found');

      const lead = await tx.lead.update({
        where: { id, tenantId },
        data: {
          deletedAt: new Date(),
          updatedById: userId,
          lastActivityAt: new Date(),
        },
      });

      await tx.timelineEvent.create({
        data: {
          tenantId,
          leadId: id,
          action: 'Lead Deleted',
          description: `Lead was softly deleted`,
          userId,
        },
      });

      return lead;
    });
  }

  async getLeadAttachments(tenantId: string, leadId: string) {
    return this.prisma.attachment.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeadAttachment(
    tenantId: string,
    leadId: string,
    userId: string,
    data: {
      fileName: string;
      fileUrl: string;
      fileSize: number;
      fileType: string;
    },
  ) {
    const attachment = await this.prisma.attachment.create({
      data: {
        tenantId,
        leadId,
        userId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType,
      },
      include: {
        user: { select: { name: true, email: true, id: true } },
      },
    });

    await this.prisma.timelineEvent.create({
      data: {
        tenantId,
        leadId,
        action: 'Attachment Added',
        description: `Uploaded ${data.fileName}`,
        userId,
      },
    });

    return attachment;
  }

  async getLeadNotes(tenantId: string, leadId: string) {
    return this.prisma.note.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeadNote(
    tenantId: string,
    leadId: string,
    userId: string,
    data: { content: string },
  ) {
    const note = await this.prisma.note.create({
      data: {
        tenantId,
        leadId,
        userId,
        message: data.content,
      },
      include: {
        user: { select: { name: true, email: true, id: true } },
      },
    });

    await this.prisma.timelineEvent.create({
      data: {
        tenantId,
        leadId,
        action: 'Note Added',
        description: 'A new note was added',
        userId,
      },
    });

    return note;
  }

  async getLeadTimeline(tenantId: string, leadId: string) {
    return this.prisma.timelineEvent.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTimelineEvent(
    tenantId: string,
    leadId: string,
    action: string,
    description: string,
    userId: string,
  ) {
    return this.prisma.timelineEvent.create({
      data: {
        tenantId,
        leadId,
        userId,
        action,
        description,
      },
    });
  }

  async bulkDeleteLeads(tenantId: string, userId: string, ids: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const leads = await tx.lead.updateMany({
        where: { id: { in: ids }, tenantId },
        data: {
          deletedAt: new Date(),
          updatedById: userId,
          lastActivityAt: new Date(),
        },
      });

      const timelineEvents = ids.map((id) => ({
        tenantId,
        leadId: id,
        action: 'Lead Deleted',
        description: 'Lead was softly deleted (Bulk)',
        userId,
      }));

      if (timelineEvents.length > 0) {
        await tx.timelineEvent.createMany({ data: timelineEvents });
      }

      return leads;
    });
  }
}

