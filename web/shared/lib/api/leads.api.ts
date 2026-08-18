/**
 * @file shared/lib/api/leads.api.ts
 * Leads-related API endpoints.
 */
import client from "./client";
import { ApiResponseType } from "@/shared/types/api";
import { LeadsDataType, LeadType } from "@/shared/types/lead";

async function unwrapResponse<T>(request: Promise<{ data: ApiResponseType<T> }>) {
  try {
    const response = await request;
    if (!response.data?.success || response.data.data === undefined) {
      throw new Error(response.data?.message || "Invalid API response.");
    }
    return response.data.data;
  } catch (error: any) {
    const msg = error.response?.data?.message;
    if (msg) {
      if (typeof msg === 'string') throw new Error(msg);
      else if (typeof msg === 'object') throw new Error(msg.message || JSON.stringify(msg));
    }
    throw error;
  }
}

export function fetchLeadsData() {
  return unwrapResponse<LeadsDataType>(client.get("/crm/leads"));
}

export function createLead(data: Partial<LeadType>) {
  return unwrapResponse<LeadType>(client.post("/crm/leads", data));
}

export function updateLead(id: string, data: Partial<LeadType>) {
  return unwrapResponse<LeadType>(client.patch(`/crm/leads/${id}`, data));
}

export function deleteLead(id: string) {
  return unwrapResponse<{ id: string }>(client.delete(`/crm/leads/${id}`));
}

export function bulkDeleteLeads(ids: string[]) {
  return unwrapResponse<{ count: number }>(client.post("/crm/leads/bulk", { ids }));
}

export function fetchLeadNotes(leadId: string) {
  return unwrapResponse<any>(client.get(`/crm/leads/${leadId}/notes`));
}

export function createLeadNote(leadId: string, data: any) {
  return unwrapResponse<any>(client.post(`/crm/leads/${leadId}/notes`, data));
}

export function fetchLeadTimeline(leadId: string) {
  return unwrapResponse<any>(client.get(`/crm/leads/${leadId}/timeline`));
}

export function createLeadTimelineEvent(leadId: string, data: any) {
  return unwrapResponse<any>(client.post(`/crm/leads/${leadId}/timeline`, data));
}

export function fetchLeadAttachments(leadId: string) {
  return unwrapResponse<any>(client.get(`/crm/leads/${leadId}/attachments`));
}

export function createLeadAttachment(leadId: string, data: any) {
  return unwrapResponse<any>(client.post(`/crm/leads/${leadId}/attachments`, data));
}

export function fetchLeadMeetings(leadId: string) {
  return unwrapResponse<any>(client.get(`/crm/leads/${leadId}/meetings`));
}

export function createLeadMeeting(leadId: string, data: any) {
  return unwrapResponse<any>(client.post(`/crm/leads/${leadId}/meetings`, data));
}

