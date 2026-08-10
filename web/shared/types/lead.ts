// lead types

export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  PROPOSAL_SENT = "PROPOSAL_SENT",
  WON = "WON",
  LOST = "LOST",
}

export interface LeadType {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: LeadStatus;
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
  notesCount?: number;
  meetingsCount?: number;
  upcomingMeeting?: ReturnType<typeof JSON.parse>;
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

export interface TimelineEventType {
  id: string;
  leadId: string;
  userId?: string;
  action: string;
  description?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AttachmentType {
  id: string;
  leadId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
