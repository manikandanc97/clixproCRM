/**
 * @file shared/lib/api/employees.api.ts
 * Employees-related API endpoints.
 */
import client from "./client";
import { ApiResponseType } from "@/shared/types/api";
import { EmployeesDataType, EmployeeType } from "@/shared/types/employee";

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

export function fetchEmployees() {
  return unwrapResponse<EmployeesDataType>(client.get("/crm/employees"));
}

export function createEmployee(data: Partial<EmployeeType>) {
  return unwrapResponse<EmployeeType>(client.post("/crm/employees", data));
}

export function updateEmployee(id: string, data: Partial<EmployeeType>) {
  return unwrapResponse<any>(client.put(`/crm/employees/${id}`, data));
}

export function toggleEmployeeStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  return unwrapResponse<any>(client.patch(`/crm/employees/${id}`, { status }));
}

export function deleteEmployee(id: string) {
  return unwrapResponse<any>(client.delete(`/crm/employees/${id}`));
}

