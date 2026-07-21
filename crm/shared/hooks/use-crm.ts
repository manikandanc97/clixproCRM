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
import { useAuth } from "@/features/auth/components/auth-provider";

export function useCustomers() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["customers", token],
    queryFn: fetchCustomersData,
    enabled: isAuthenticated ,
    refetchInterval: 30000,
  });
}

export function useLeads() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["leads", token],
    queryFn: fetchLeadsData,
    enabled: isAuthenticated ,
    refetchInterval: 30000,
  });
}

export function usePipeline() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["pipeline", token],
    queryFn: fetchPipelineData,
    enabled: isAuthenticated ,
    refetchInterval: 30000,
  });
}

export function useTasks() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["tasks", token],
    queryFn: fetchTasksData,
    enabled: isAuthenticated ,
    refetchInterval: 30000,
  });
}

export function useQuotations() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["quotations", token],
    queryFn: fetchQuotationsData,
    enabled: isAuthenticated ,
    refetchInterval: 30000,
  });
}

export function useReports() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["reports", token],
    queryFn: fetchReportsData,
    enabled: isAuthenticated ,
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
    onError: (error: Error) => {
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
    onError: (error: Error) => {
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
    onError: (error: Error) => {
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
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create quotation");
    },
  });
}
