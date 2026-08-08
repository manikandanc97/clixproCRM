import prisma from "@/lib/prisma";
import { LeadStage, LeadPriority } from "@prisma/client";




export class LeadImportService {
  static async bulkImportLeads(
    tenantId: string, 
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leadsData: any[], 
    duplicateStrategy: "skip" | "update" | "create"
  ) {
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const failedRows = [];

    const defaults = {
      stage: "NEW" as LeadStage,
      priority: "MEDIUM" as LeadPriority,
    };

    for (let i = 0; i < leadsData.length; i++) {
      const row = leadsData[i];
      try {
        if (!row.name || !row.email) {
          failed++;
          failedRows.push({ ...row, ErrorReason: "Missing required fields (Name or Email)" });
          continue;
        }

        const stageToUse = (row.stage || row.status || defaults.stage).toUpperCase();
        let priorityToUse = defaults.priority;
        if (row.priority) {
          priorityToUse = String(row.priority).toUpperCase() as LeadPriority;
        }
        
        let valueToUse = 0;
        if (row.valueAmount !== undefined) {
          valueToUse = parseFloat(String(row.valueAmount).replace(/[^0-9.-]+/g,"")) || 0;
        } else if (row.value !== undefined) {
          valueToUse = parseFloat(String(row.value).replace(/[^0-9.-]+/g,"")) || 0;
        }

        const existing = await prisma.lead.findFirst({
          where: { tenantId, email: row.email, deletedAt: null }
        });

        if (existing) {
          if (duplicateStrategy === "skip") {
            skipped++;
            continue;
          } else if (duplicateStrategy === "update") {
            await prisma.lead.update({
              where: { id: existing.id },
              data: {
                name: row.name,
                company: row.company || existing.company,
                phone: row.phone || existing.phone,
                value: valueToUse,
                stage: stageToUse as LeadStage,
                priority: priorityToUse,
                assignedToId: row.assignedToId || existing.assignedToId,
              }
            });
            imported++;
          } else if (duplicateStrategy === "create") {
            await prisma.lead.create({
              data: {
                tenantId,
                name: row.name,
                company: row.company || "Unknown Company",
                email: row.email,
                phone: row.phone,
                value: valueToUse,
                stage: stageToUse as LeadStage,
                priority: priorityToUse,
                assignedToId: row.assignedToId || null,
              }
            });
            imported++;
          }
        } else {
          await prisma.lead.create({
            data: {
              tenantId,
              name: row.name,
              company: row.company || "Unknown Company",
              email: row.email,
              phone: row.phone,
              value: valueToUse,
              stage: stageToUse as LeadStage,
              priority: priorityToUse,
              assignedToId: row.assignedToId || null,
            }
          });
          imported++;
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        failed++;
        failedRows.push({ ...row, ErrorReason: err.message || "Database error" });
      }
    }

    if (imported > 0) {
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "BULK_IMPORT_LEADS",
          module: "PIPELINE",
          details: { imported, skipped, failed }
        }
      });
    }

    return { imported, skipped, failed, failedRows };
  }
}


