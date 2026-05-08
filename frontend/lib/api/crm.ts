import client from "./client";
import { ApiResponseType } from "@/types/api";
import { CustomersDataType } from "@/types/customer";
import { DashboardDataType } from "@/types/dashboard";
import { LeadsDataType } from "@/types/lead";
import { PipelineDataType } from "@/types/pipeline";
import { QuotationsDataType } from "@/types/quotation";
import { ReportsDataType } from "@/types/report";
import { TasksDataType } from "@/types/task";

async function unwrapResponse<T>(request: Promise<{ data: ApiResponseType<T> }>) {
  const response = await request;
  return response.data.data;
}

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
