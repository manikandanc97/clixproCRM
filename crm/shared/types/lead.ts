// lead types

export interface LeadType {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  value: string;
  valueAmount: number;
  followUp: string;
  followUpAt: string | null;
  createdAt: string;
  updatedAt?: string;
  phone?: string;
  probability?: number;
  owner?: { name: string; avatar?: string; id?: string };
  // intelligence fields
  score: number;
  priority: "Low" | "Medium" | "High" | "Urgent";
  source: string;
  lastActivity: string;
  aiInsights?: {
    summary: string;
    conversionProbability: number;
    recommendation: string;
  };
  customerId?: string;
  isConverted?: boolean;
  notes?: NoteType[];
}

export interface NoteType {
  id: string;
  leadId: string;
  userId: string;
  createdBy: string;
  userAvatar?: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
  isPinned: boolean;
  mentions?: string[];
  title?: string;
  attachment?: { name: string; url: string };
}

export interface LeadsDataType {
  summary: {
    total: number;
  };
  leads: LeadType[];
}











