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

async function unwrapResponse<T>(request: Promise<{ data: ApiResponseType<T> }>) {
  const response = await request;
  return response.data.data;
}

// ─── Existing endpoints ───────────────────────────────────────────────────────
export function fetchDashboardData() {
  return unwrapResponse<DashboardDataType>(client.get("/crm/dashboard"));
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

export function fetchReportsData() {
  return unwrapResponse<ReportsDataType>(client.get("/crm/reports"));
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

import { WorkspaceDataType } from "@/shared/types/settings";

export function fetchWorkspaceData() {
  return unwrapResponse<WorkspaceDataType>(client.get("/crm/workspace"));
}











