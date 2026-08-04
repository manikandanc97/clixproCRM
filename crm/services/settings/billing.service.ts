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


export class BillingService {
  static async getBillingSettings(_tenantId: string) {
    return {
      plan: "Pro Plan",
      status: "Active",
      modules: [
        { id: "m1", label: "Advanced Analytics", enabled: true },
        { id: "m2", label: "Custom Workflows", enabled: true },
        { id: "m3", label: "API Access", enabled: false }
      ],
      licenseDetails: [
        { id: "l1", label: "License Key", value: "CLIX-PRO-1234-5678" },
        { id: "l2", label: "Valid Until", value: "2026-12-31" },
        { id: "l3", label: "Seats Used", value: "5 / 10" }
      ]
    };
  }
}


