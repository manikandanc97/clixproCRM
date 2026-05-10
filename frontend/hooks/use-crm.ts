"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchCustomersData, 
  fetchLeadsData, 
  fetchPipelineData, 
  fetchTasksData, 
  fetchQuotationsData,
  fetchReportsData
} from "@/lib/api/crm";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomersData,
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeadsData,
  });
}

export function usePipeline() {
  return useQuery({
    queryKey: ["pipeline"],
    queryFn: fetchPipelineData,
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasksData,
  });
}

export function useQuotations() {
  return useQuery({
    queryKey: ["quotations"],
    queryFn: fetchQuotationsData,
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: fetchReportsData,
  });
}
