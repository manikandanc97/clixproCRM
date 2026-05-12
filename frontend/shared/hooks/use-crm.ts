"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchCustomersData, 
  fetchLeadsData, 
  fetchPipelineData, 
  fetchTasksData, 
  fetchQuotationsData,
  fetchReportsData
} from "@/shared/lib/api/crm";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomersData,
    refetchInterval: 30000,
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeadsData,
    refetchInterval: 30000,
  });
}

export function usePipeline() {
  return useQuery({
    queryKey: ["pipeline"],
    queryFn: fetchPipelineData,
    refetchInterval: 30000,
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasksData,
    refetchInterval: 30000,
  });
}

export function useQuotations() {
  return useQuery({
    queryKey: ["quotations"],
    queryFn: fetchQuotationsData,
    refetchInterval: 30000,
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: fetchReportsData,
    refetchInterval: 30000,
  });
}











