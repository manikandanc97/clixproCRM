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
  static async getAiSettings(_tenantId: string) {
    return {
      features: [
        { id: "f1", label: "Smart Reply", description: "AI generated email responses", enabled: true },
        { id: "f2", label: "Lead Scoring", description: "Predict likelihood to close", enabled: true }
      ],
      modules: [
        { id: "m1", label: "GPT-4 Processing", description: "Advanced text generation", enabled: true },
        { id: "m2", label: "Custom Data Training", description: "Train on your data", enabled: false }
      ],
      controls: [
        { id: "c1", label: "Creativity Level", value: 70, badge: "Balanced" },
        { id: "c2", label: "Max Tokens", value: 2000, badge: "Standard" }
      ]
    };
  }
}


