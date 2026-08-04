import prisma from "@/lib/prisma";
import { Prisma, Lead, Customer, Quotation, Invoice, Task, PrismaClient, LeadStage, LeadPriority, CustomerStatus, TaskPriority, TaskStatus, QuotationStatus } from "@prisma/client";
import {
  calculateTrend,
  formatCurrency,
  countInRange,
  getMonthRanges,
  getStatusLabel,
  formatRelativeDate,
  toNumber,
  formatDate,
  formatPercentage,
  PIPELINE_STAGE_LABELS,
  LEAD_STATUS_LABELS
} from "@/lib/crm-formatters";


export class CustomerSyncService {
  static async ensureDatabaseColumns() {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "isConverted" BOOLEAN DEFAULT false;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "customerId" TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "leadId" TEXT;`);
    } catch (_e) {
      // Ignore if columns already exist
    }
  }

  static async cleanupCustomerAnomalies(tenantId: string) {
    try {
      await CustomerSyncService.ensureDatabaseColumns();

      return await prisma.$transaction(async (tx) => {
      // 1. Fetch all non-deleted WON leads
      const wonLeads = await tx.lead.findMany({
        where: { tenantId, stage: "WON", deletedAt: null }
      });

      // 2. Fetch all non-deleted customers
      const allCustomers = await tx.customer.findMany({
        where: { tenantId, deletedAt: null }
      });

      // Find duplicate customers (e.g. identical email or identical name+company)
      const seenKeys = new Map<string, string>();
      const duplicateIds: string[] = [];

      for (const cust of allCustomers) {
        const key = (cust.email && cust.email.trim() !== "") 
          ? `email:${cust.email.trim().toLowerCase()}`
          : `name:${cust.name.trim().toLowerCase()}|company:${cust.company.trim().toLowerCase()}`;

        if (seenKeys.has(key)) {
          duplicateIds.push(cust.id);
        } else {
          seenKeys.set(key, cust.id);
        }
      }

      if (duplicateIds.length > 0) {
        await tx.customer.updateMany({
          where: { id: { in: duplicateIds } },
          data: { deletedAt: new Date(), status: "INACTIVE" }
        });
      }

      // 3. For each WON lead, ensure exactly ONE customer exists
      for (const lead of wonLeads) {
        let customer = null;
        if (lead.customerId) {
          customer = await tx.customer.findFirst({
            where: { id: lead.customerId, tenantId, deletedAt: null }
          });
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

        // Update lead conversion state
        await tx.lead.update({
          where: { id: lead.id },
          data: {
            isConverted: true,
            convertedAt: lead.convertedAt || new Date(),
            customerId: customer.id
          }
        });
      }

      // 4. Clean up any customers that do NOT have an active WON lead
      const currentWonLeads = await tx.lead.findMany({
        where: { tenantId, stage: "WON", deletedAt: null },
        select: { id: true, customerId: true }
      });
      const validCustomerIds = new Set(currentWonLeads.map(l => l.customerId).filter(Boolean));

      // Reset non-WON leads
      const nonWonLeads = await tx.lead.findMany({
        where: { tenantId, stage: { not: "WON" }, deletedAt: null }
      });

      for (const nonWonLead of nonWonLeads) {
        if (nonWonLead.isConverted || nonWonLead.customerId) {
          if (nonWonLead.customerId && !validCustomerIds.has(nonWonLead.customerId)) {
            await tx.customer.updateMany({
              where: { id: nonWonLead.customerId, deletedAt: null },
              data: { deletedAt: new Date(), status: "INACTIVE" }
            });
          }
          await tx.lead.update({
            where: { id: nonWonLead.id },
            data: {
              isConverted: false,
              convertedAt: null,
              customerId: null
            }
          });
        }
      }
    }, { timeout: 20000, maxWait: 10000 });
    } catch (error) {
      console.error("Cleanup anomalies non-fatal error:", error);
    }
  }

  static async syncWonLeadsToCustomers(tenantId: string) {
    return await CustomerSyncService.cleanupCustomerAnomalies(tenantId);
  }
}


