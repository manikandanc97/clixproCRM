// pipeline types

import { LeadStatus } from "./lead";

export interface PipelineMetricType {
  title: string;
  value: string;
  valueAmount?: number;
}

export interface PipelineLeadType {
  id: string;
  name: string;
  company: string;
  value: string;
  valueAmount: number;
  followUp: string;
  followUpAt: string | null;
  stage: LeadStatus;
  // Deal Intelligence
  priority: "High" | "Medium" | "Low";
  probability: number;
  temperature: "Hot" | "Warm" | "Cold";
  expectedCloseDate: string;
  activityCount: number;
  isStuck: boolean;
  aiSummary: string;
  createdAt?: string;
  wonReason?: string;
  wonDate?: string;
  actualRevenue?: number;
  lostReason?: string;
  competitor?: string;
  notes?: string;
}

export interface PipelineDataType {
  stats: PipelineMetricType[];
  items: PipelineLeadType[];
}











