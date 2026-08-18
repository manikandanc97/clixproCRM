import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConvertLeadDto } from '../dto/convert-lead.dto';

/**
 * @file leads/services/leads.convert.service.ts
 * Lead conversion transaction logic: resolving company/customer, creating deal, updating lead stage.
 */
@Injectable()
export class LeadsConvertService {
  constructor(private readonly prisma: PrismaService) {}

  async convertLead(
    tenantId: string,
    userId: string,
    leadId: string,
    data: ConvertLeadDto,
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId, tenantId, deletedAt: null },
    });

    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.isConverted)
      throw new BadRequestException('Lead is already converted');

    return this.prisma.$transaction(async (tx) => {
      // 1. Resolve Company
      let finalCompanyId = data.companyId;
      if (!finalCompanyId && data.companyName) {
        const existingCompany = await tx.company.findFirst({
          where: {
            tenantId,
            name: { equals: data.companyName, mode: 'insensitive' },
          },
        });
        if (existingCompany) {
          finalCompanyId = existingCompany.id;
        } else {
          const newCompany = await tx.company.create({
            data: {
              tenantId,
              name: data.companyName,
              ownerId: data.ownerId || userId,
              status: 'ACTIVE',
            },
          });
          finalCompanyId = newCompany.id;
        }
      }

      // 2. Resolve Customer
      let finalCustomerId = data.customerId;
      if (!finalCustomerId && data.customerName) {
        if (data.customerEmail) {
          const existing = await tx.customer.findFirst({
            where: { tenantId, email: data.customerEmail, deletedAt: null },
          });
          if (existing) finalCustomerId = existing.id;
        }

        if (!finalCustomerId) {
          const existingByName = await tx.customer.findFirst({
            where: {
              tenantId,
              name: { equals: data.customerName, mode: 'insensitive' },
              company: { equals: data.companyName || '', mode: 'insensitive' },
              deletedAt: null,
            },
          });
          if (existingByName) finalCustomerId = existingByName.id;
        }

        if (!finalCustomerId) {
          const newCustomer = await tx.customer.create({
            data: {
              tenantId,
              name: data.customerName,
              email: data.customerEmail || lead.email,
              companyId: finalCompanyId,
              company: data.companyName || lead.company || '',
              revenue: data.createDeal ? data.dealValue || lead.value : 0,
              status: 'ACTIVE',
              assignedToId: data.ownerId || userId,
            },
          });
          finalCustomerId = newCustomer.id;
        }
      }

      // 3. Create Deal
      let deal = null;
      if (data.createDeal) {
        deal = await tx.deal.create({
          data: {
            tenantId,
            name: data.dealName || `${lead.name} Deal`,
            companyId: finalCompanyId,
            customerId: finalCustomerId,
            value: data.dealValue || lead.value,
            stage: data.dealStage || 'NEW',
            probability:
              data.probability !== undefined ? Number(data.probability) : 20,
            expectedCloseDate: data.expectedCloseDate
              ? new Date(data.expectedCloseDate)
              : null,
            ownerId: data.ownerId || userId,
            leadId: lead.id,
            source: lead.source,
            status: 'OPEN',
          },
        });
      }

      // 4. Update Lead
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          isConverted: true,
          convertedAt: new Date(),
          customerId: finalCustomerId,
          companyId: finalCompanyId,
          stage: 'WON',
        },
      });

      // 5. Timeline Event
      await tx.timelineEvent.create({
        data: {
          tenantId,
          action: 'LEAD_CONVERTED',
          description: deal
            ? `Lead converted to Deal: ${deal.name}`
            : `Lead converted to Customer`,
          userId: userId,
          leadId: lead.id,
          dealId: deal?.id,
          companyId: finalCompanyId,
          customerId: finalCustomerId,
        },
      });

      return { deal, customerId: finalCustomerId, companyId: finalCompanyId };
    });
  }
}
