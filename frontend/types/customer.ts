// customer types

import { MetricCardType } from "./common";

export interface CustomerType {
  id: string;
  name: string;
  company: string;
  email: string;
  status: "Premium" | "Active" | "Inactive";
  revenue: string;
  revenueValue: number;
  lastContact: string;
  lastContactAt: string | null;
  manager: string;
  // Relationship Intelligence Fields
  healthScore: number; // 0-100
  ltv: string; // Lifetime Value
  totalInteractions: number;
  revenueTrend: "up" | "down" | "stable";
  segment: "VIP" | "Enterprise" | "SMB" | "Growth";
  renewalDate?: string;
  lastPurchaseDate?: string;
  churnRisk: "Low" | "Medium" | "High";
  sentiment: "Positive" | "Neutral" | "Negative";
  aiSummary: string;
}

export interface CustomersDataType {
  stats: MetricCardType[];
  customers: CustomerType[];
}
