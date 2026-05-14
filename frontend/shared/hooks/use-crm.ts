"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchCustomersData, 
  fetchLeadsData, 
  fetchPipelineData, 
  fetchTasksData, 
  fetchQuotationsData,
  fetchReportsData,
  createLead,
  createCustomer,
  createTask,
  createQuotation
} from "@/shared/lib/api/crm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

// ─── Mutations ───────────────────────────────────────────────────────────────
export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Lead created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create lead");
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Customer created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create customer");
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create task");
    },
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Quotation created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create quotation");
    },
  });
}











