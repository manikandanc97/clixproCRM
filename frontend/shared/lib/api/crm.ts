import client from "./client";
import { ApiResponseType } from "@/shared/types/api";
import { CustomersDataType } from "@/shared/types/customer";
import { DashboardDataType } from "@/shared/types/dashboard";
import { LeadsDataType } from "@/shared/types/lead";
import { PipelineDataType } from "@/shared/types/pipeline";
import { QuotationsDataType } from "@/shared/types/quotation";
import { ReportsDataType } from "@/shared/types/report";
import { TasksDataType } from "@/shared/types/task";
import { AnalyticsDataType } from "@/shared/types/analytics";
import { EmployeesDataType, RolesDataType } from "@/shared/types/employee";
import { MeetingsDataType } from "@/shared/types/meeting";
import {
  HotLeadsDataType,
  TeamPerformanceDataType,
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
export async function fetchDashboardData() {
  return normalizeDashboardData(await unwrapResponse<DashboardDataType>(client.get("/crm/dashboard")));
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
export function fetchAnalyticsData() {
  return unwrapResponse<AnalyticsDataType>(client.get("/crm/analytics"));
}

export function fetchHotLeads() {
  return unwrapResponse<HotLeadsDataType>(client.get("/crm/hot-leads"));
}

export function fetchTeamPerformance() {
  return unwrapResponse<TeamPerformanceDataType>(client.get("/crm/team-performance"));
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

export function fetchRoles() {
  return unwrapResponse<RolesDataType>(client.get("/crm/roles"));
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











