import { MetricCardType } from "./common";

export interface QuotationType {
  id: string;
  quoteId: string;
  client: string;
  amount: string;
  amountValue: number;
  status: "Pending" | "Approved" | "Rejected" | "Expired";
  validTill: string;
  validTillValue: string | null;
  createdBy: string;
  probability?: number;
  viewCount?: number;
  downloadCount?: number;
  lastActivity?: string;
  isSigned?: boolean;
  items?: { name: string; quantity: number; price: number; total: number }[];
  tax?: number;
  discount?: number;
}

export interface QuotationsDataType {
  stats: MetricCardType[];
  quotations: QuotationType[];
}











