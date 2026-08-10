import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadStage, LeadPriority } from '@prisma/client';

@Injectable()
export class LeadsImportService {
  constructor(private readonly prisma: PrismaService) {}

  async bulkImportLeads(
    tenantId: string,
    userId: string,
    leadsData: any[],
    duplicateStrategy: 'skip' | 'update' | 'create',
  ) {
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const failedRows = [];

    const defaults = {
      stage: 'NEW' as LeadStage,
      priority: 'MEDIUM' as LeadPriority,
    };

    for (let i = 0; i < leadsData.length; i++) {
      const row = leadsData[i];
      try {
        if (!row.name || !row.email) {
          failed++;
          failedRows.push({
            ...row,
            ErrorReason: 'Missing required fields (Name or Email)',
          });
          continue;
        }

        const stageToUse = (
          row.stage ||
          row.status ||
          defaults.stage
        ).toUpperCase();
        let priorityToUse = defaults.priority;
        if (row.priority) {
          priorityToUse = String(row.priority).toUpperCase() as LeadPriority;
        }

        let valueToUse = 0;
        if (row.valueAmount !== undefined) {
          valueToUse =
            parseFloat(String(row.valueAmount).replace(/[^0-9.-]+/g, '')) || 0;
        } else if (row.value !== undefined) {
          valueToUse =
            parseFloat(String(row.value).replace(/[^0-9.-]+/g, '')) || 0;
        }

        const companyName = (row.company || 'Unknown Company').trim();
        let companyId: string | null = null;
        if (companyName && companyName !== 'Unknown Company') {
          let company = await this.prisma.company.findFirst({
            where: {
              tenantId,
              name: { equals: companyName, mode: 'insensitive' },
            },
          });
          if (!company) {
            company = await this.prisma.company.create({
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

        const existing = await this.prisma.lead.findFirst({
          where: { tenantId, email: row.email, deletedAt: null },
        });

        if (existing) {
          if (duplicateStrategy === 'skip') {
            skipped++;
            continue;
          } else if (duplicateStrategy === 'update') {
            await this.prisma.lead.update({
              where: { id: existing.id },
              data: {
                name: row.name,
                company: companyName,
                companyId: companyId || existing.companyId,
                phone: row.phone || existing.phone,
                value: valueToUse,
                stage: stageToUse as LeadStage,
                priority: priorityToUse,
                assignedToId: row.assignedToId || existing.assignedToId,
              },
            });
            imported++;
          } else if (duplicateStrategy === 'create') {
            await this.prisma.lead.create({
              data: {
                tenantId,
                name: row.name,
                company: companyName,
                companyId,
                email: row.email,
                phone: row.phone,
                value: valueToUse,
                stage: stageToUse as LeadStage,
                priority: priorityToUse,
                assignedToId: row.assignedToId || null,
              },
            });
            imported++;
          }
        } else {
          await this.prisma.lead.create({
            data: {
              tenantId,
              name: row.name,
              company: companyName,
              companyId,
              email: row.email,
              phone: row.phone,
              value: valueToUse,
              stage: stageToUse as LeadStage,
              priority: priorityToUse,
              assignedToId: row.assignedToId || null,
            },
          });
          imported++;
        }
      } catch (err: any) {
        failed++;
        failedRows.push({
          ...row,
          ErrorReason: err.message || 'Database error',
        });
      }
    }

    if (imported > 0) {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'BULK_IMPORT_LEADS',
          module: 'PIPELINE',
          details: { imported, skipped, failed },
        },
      });
    }

    return { imported, skipped, failed, failedRows };
  }
}
