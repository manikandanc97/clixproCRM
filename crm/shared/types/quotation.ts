import { MetricCardType } from "./common";

export interface QuotationType {
  id: string;
  quoteId: string;
  client: string;
  amount: string;
  amountValue: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  validTill: string;
  validTillValue: string | null;
  leadId?: string;
  leadName?: string;
  leadDetails?: {
    name: string;
    email: string;
    phone: string | null;
    company: string;
  };
  isSigned?: boolean;
  notes?: string;
  items?: { name: string; quantity: number; price: number; total: number }[];
  tax?: number;
  discount?: number;
  lastActivity?: string;
}

export interface QuotationsDataType {
  stats: MetricCardType[];
  quotations: QuotationType[];
}











