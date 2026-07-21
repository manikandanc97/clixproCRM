// pipeline types

export interface PipelineMetricType {
  title: string;
  value: string;
}

export interface PipelineLeadType {
  id: string;
  name: string;
  company: string;
  value: string;
  valueAmount: number;
  followUp: string;
  followUpAt: string | null;
  stage: "New Lead" | "Contacted" | "Proposal Sent" | "Won" | "Lost";
  // Deal Intelligence
  priority: "High" | "Medium" | "Low";
  probability: number;
  temperature: "Hot" | "Warm" | "Cold";
  expectedCloseDate: string;
  activityCount: number;
  isStuck: boolean;
  aiSummary: string;
}

export interface PipelineDataType {
  stats: PipelineMetricType[];
  items: PipelineLeadType[];
}











