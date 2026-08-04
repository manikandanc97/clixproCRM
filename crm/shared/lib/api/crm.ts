import client from "./client";
import { ApiResponseType } from "@/shared/types/api";
import { CustomersDataType, CustomerType } from "@/shared/types/customer";
import { DashboardDataType } from "@/shared/types/dashboard";
import { LeadsDataType, LeadType } from "@/shared/types/lead";
import { PipelineDataType } from "@/shared/types/pipeline";
import { QuotationsDataType, QuotationType } from "@/shared/types/quotation";
import { ReportsDataType } from "@/shared/types/report";
import { TasksDataType, TaskType } from "@/shared/types/task";
import { AnalyticsDataType } from "@/shared/types/analytics";
import { EmployeesDataType,  EmployeeType } from "@/shared/types/employee";
import { MeetingsDataType } from "@/shared/types/meeting";
import {
  HotLeadsDataType,
  NotificationsDataType,
  AiInsightsDataType,
} from "@/shared/types/dashboard-widgets";
import {
  AiSettingsDataType,
  BillingSettingsDataType,
  IntegrationSettingsDataType,
  NotificationSettingsDataType,
  SecuritySettingsDataType,
  WorkspaceDataType,
} from "@/shared/types/settings";

async function unwrapResponse<T>(request: Promise<{ data: ApiResponseType<T> }>) {
  const response = await request;
  if (!response.data?.success || response.data.data == null) {
    throw new Error(response.data?.message || "Invalid API response.");
  }
  return response.data.data;
}

function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeDashboardData(data: DashboardDataType): DashboardDataType {
  return {
    stats: ensureArray(data?.stats),
    recentActivities: ensureArray(data?.recentActivities),
    salesChartData: ensureArray(data?.salesChartData),
  };
}

function normalizeReportsData(data: ReportsDataType): ReportsDataType {
  return {
    stats: ensureArray(data?.stats),
    revenueChart: ensureArray(data?.revenueChart),
    conversionChart: ensureArray(data?.conversionChart),
    performance: ensureArray(data?.performance),
    funnel: ensureArray(data?.funnel),
    activityHeatmap: ensureArray(data?.activityHeatmap),
    insights: ensureArray(data?.insights),
    revenueTarget: data?.revenueTarget ?? null,
  };
}

// ─── Existing endpoints ───────────────────────────────────────────────────────
export async function fetchDashboardData(timeframe: string = "month") {
  return normalizeDashboardData(await unwrapResponse<DashboardDataType>(client.get(`/crm/dashboard?timeframe=${timeframe}`)));
}

export function fetchRevenueGrowth(filter: string = "Year") {
  return unwrapResponse<any>(client.get(`/crm/dashboard/revenue-growth?filter=${encodeURIComponent(filter)}`));
}

export function fetchCustomersData() {
  return unwrapResponse<CustomersDataType>(client.get("/crm/customers"));
}

export function fetchLeadsData() {
  return unwrapResponse<LeadsDataType>(client.get("/crm/leads"));
}

export function fetchPipelineData() {
  return unwrapResponse<PipelineDataType>(client.get("/crm/pipeline"));
}

export function fetchTasksData() {
  return unwrapResponse<TasksDataType>(client.get("/crm/tasks"));
}

export function fetchQuotationsData() {
  return unwrapResponse<QuotationsDataType>(client.get("/crm/quotations"));
}

export async function fetchReportsData() {
  return normalizeReportsData(await unwrapResponse<ReportsDataType>(client.get("/crm/reports")));
}

// ─── New dynamic endpoints ────────────────────────────────────────────────────
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

// ─── Analytics endpoints ──────────────────────────────────────────────────────
export function fetchAnalyticsData(filter?: string) {
  const query = filter ? `?filter=${encodeURIComponent(filter)}` : "";
  return unwrapResponse<AnalyticsDataType>(client.get(`/crm/analytics${query}`));
}

export function fetchHotLeads() {
  return unwrapResponse<HotLeadsDataType>(client.get("/crm/hot-leads"));
}



export function fetchMeetings() {
  return unwrapResponse<MeetingsDataType>(client.get("/crm/meetings"));
}

export function fetchNotifications() {
  return unwrapResponse<NotificationsDataType>(client.get("/crm/notifications"));
}

export function fetchEmployees() {
  return unwrapResponse<EmployeesDataType>(client.get("/crm/employees"));
}



export function fetchAiInsights() {
  return unwrapResponse<AiInsightsDataType>(client.get("/crm/ai-insights"));
}

export function fetchWorkspaceData() {
  return unwrapResponse<WorkspaceDataType>(client.get("/crm/workspace"));
}

export function fetchSecuritySettings() {
  return unwrapResponse<SecuritySettingsDataType>(client.get("/crm/settings/security"));
}

export function fetchBillingSettings() {
  return unwrapResponse<BillingSettingsDataType>(client.get("/crm/settings/billing"));
}

export function fetchIntegrationSettings() {
  return unwrapResponse<IntegrationSettingsDataType>(client.get("/crm/settings/integrations"));
}

export function fetchAiSettings() {
  return unwrapResponse<AiSettingsDataType>(client.get("/crm/settings/ai"));
}

export function fetchNotificationSettings() {
  return unwrapResponse<NotificationSettingsDataType>(client.get("/crm/settings/notifications"));
}

export function fetchRevenueTargets() {
  return unwrapResponse<any[]>(client.get("/crm/settings/revenue-targets"));
}

export function fetchRevenueTargetAnalytics(filters: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(filters);
  return unwrapResponse<any>(client.get(`/crm/analytics/revenue-target?${searchParams.toString()}`));
}

// ─── Creation endpoints ──────────────────────────────────────────────────────
export function createLead(data: Partial<LeadType>) {
  return unwrapResponse<LeadType>(client.post("/crm/leads", data));
}

export function updateLead(id: string, data: Partial<LeadType>) {
  return unwrapResponse<LeadType>(client.patch(`/crm/leads/${id}`, data));
}

export function deleteLead(id: string) {
  return unwrapResponse<{ id: string }>(client.delete(`/crm/leads/${id}`));
}

export function updatePipelineItem(id: string, data: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return unwrapResponse<any>(client.patch(`/crm/pipeline/${id}`, data));
}

export function createCustomer(data: Partial<CustomerType>) {
  return unwrapResponse<CustomerType>(client.post("/crm/customers", data));
}

export function updateCustomer(id: string, data: Partial<CustomerType>) {
  return unwrapResponse<CustomerType>(client.patch(`/crm/customers/${id}`, data));
}

export function deleteCustomer(id: string) {
  return unwrapResponse<{ id: string }>(client.delete(`/crm/customers/${id}`));
}

export function createTask(data: Partial<TaskType>) {
  return unwrapResponse<TaskType>(client.post("/crm/tasks", data));
}

export function updateTask(id: string, data: Partial<TaskType>) {
  return unwrapResponse<TaskType>(client.patch(`/crm/tasks/${id}`, data));
}

export function deleteTask(id: string) {
  return unwrapResponse<{ id: string }>(client.delete(`/crm/tasks/${id}`));
}

export function createQuotation(data: Partial<QuotationType>) {
  return unwrapResponse<QuotationType>(client.post("/crm/quotations", data));
}

export function updateQuotation(id: string, data: Partial<QuotationType>) {
  return unwrapResponse<QuotationType>(client.patch(`/crm/quotations/${id}`, data));
}

export function deleteQuotation(id: string) {
  return unwrapResponse<{ id: string }>(client.delete(`/crm/quotations/${id}`));
}

export function createEmployee(data: Partial<EmployeeType>) {
  return unwrapResponse<EmployeeType>(client.post("/crm/employees", data));
}

// ─── Employee operations ──────────────────────────────────────────────────────
export function updateEmployee(id: string, data: Partial<EmployeeType>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return unwrapResponse<any>(client.put(`/crm/employees/${id}`, data));
}

export function toggleEmployeeStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return unwrapResponse<any>(client.patch(`/crm/employees/${id}`, { status }));
}

export function deleteEmployee(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return unwrapResponse<any>(client.delete(`/crm/employees/${id}`));
}
