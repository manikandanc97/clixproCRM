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


export class AiService {
  private static aiSettings = {
    features: [
      { id: "f1", label: "Enable AI", description: "Activate AI assistant across the platform", enabled: true },
      { id: "f2", label: "Smart Reply", description: "AI generated email responses", enabled: true },
      { id: "f3", label: "Lead Scoring", description: "Predict likelihood to close", enabled: true },
      { id: "f4", label: "Meeting Summary", description: "Auto-generate notes from meetings", enabled: false },
      { id: "f5", label: "Email Draft", description: "Draft outbound sales emails", enabled: true },
      { id: "f6", label: "Task Suggestions", description: "Suggest next best actions", enabled: false },
      { id: "f7", label: "Knowledge Base", description: "Answer support questions automatically", enabled: false },
    ],
    modules: [], // No longer used as requested
    controls: [] // No longer used as requested
  };

  static async getAiSettings(_tenantId: string) {
    return this.aiSettings;
  }

  static async updateAiSettings(_tenantId: string, data: any) {
    // update specific features
    if (data.features) {
      this.aiSettings.features = data.features;
    }
    return this.aiSettings;
  }
}


