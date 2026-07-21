// lead types

export interface LeadType {
  id: string;
  name: string;
  company: string;
  email: string;
  status: "New" | "Contacted" | "Proposal Sent" | "Won" | "Lost";
  value: string;
  valueAmount: number;
  followUp: string;
  followUpAt: string | null;
  createdAt: string;
  // intelligence fields
  score: number;
  priority: "Low" | "Medium" | "High";
  source: string;
  lastActivity: string;
  aiInsights?: {
    summary: string;
    conversionProbability: number;
    recommendation: string;
  };
}

export interface LeadsDataType {
  summary: {
    total: number;
  };
  leads: LeadType[];
}











