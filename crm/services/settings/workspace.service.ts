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


export class WorkspaceService {
  static async getWorkspace(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    return { 
      name: tenant?.name || "ClixProCRM Workspace",
      taxId: (tenant as any)?.taxId || "",
      address: (tenant as any)?.address || "",
      currency: (tenant as any)?.currency || "INR",
      timezone: (tenant as any)?.timezone || "ist",
      logo: (tenant as any)?.logo || null
    };
  }

  static async updateWorkspace(tenantId: string, data: any) {
    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
      }
    });
    return updated;
  }
}


