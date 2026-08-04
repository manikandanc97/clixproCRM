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


export class SecurityService {
  static async getSecuritySettings(_tenantId: string) {
    return {
      activeSessions: [
        { id: "s1", device: "Chrome on Windows", location: "New York, USA", ip: "192.168.1.1", current: true },
        { id: "s2", device: "Safari on iPhone", location: "New York, USA", ip: "192.168.1.2", current: false }
      ],
      loginHistory: [
        { id: "l1", event: "Login successful", date: new Date().toISOString(), status: "SUCCESS" },
        { id: "l2", event: "Failed login attempt", date: new Date(Date.now() - 86400000).toISOString(), status: "FAILED" }
      ],
      twoFactorEnabled: false
    };
  }
}


