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


export class IntegrationService {
  static async getIntegrationSettings(_tenantId: string) {
    return {
      integrations: [
        { id: "i1", name: "Google Workspace", description: "Sync contacts and calendar", category: "Productivity", connected: true },
        { id: "i2", name: "Slack", description: "Receive notifications in channels", category: "Communication", connected: false },
        { id: "i3", name: "Mailchimp", description: "Sync leads to mailing lists", category: "Marketing", connected: true }
      ]
    };
  }
}


