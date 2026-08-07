"use client";

import { LeadType } from "@/shared/types/lead";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchCustomersData, 
  fetchLeadsData, 
  fetchPipelineData, 
  fetchTasksData,
  fetchTaskDashboard,
  fetchTaskBoard,
  fetchTaskCalendar, 
  fetchQuotationsData,
  fetchEmployees,
  fetchReportsData,
  createLead,
  updateLead,
  deleteLead,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  completeTask,
  deleteTask,
  createQuotation,
  updateQuotation,
  updateQuotationStatus,
  deleteQuotation,
  updatePipelineItem,
  fetchLeadNotes,
  createLeadNote,
  fetchLeadTimeline,
  fetchLeadAttachments,
  createLeadAttachment,
  fetchLeadMeetings,
  createLeadMeeting
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
  });
}

export function useLeads() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["leads", token],
    queryFn: fetchLeadsData,
    enabled: isAuthenticated ,
  });
}

export function usePipeline() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["pipeline", token],
    queryFn: fetchPipelineData,
    enabled: isAuthenticated ,
  });
}

export function useTasks(params?: Record<string, ReturnType<typeof JSON.parse>>) {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["tasks", token, params],
    queryFn: () => fetchTasksData(params),
    enabled: isAuthenticated,
  });
}

export function useTaskDashboard() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["tasks-dashboard", token],
    queryFn: fetchTaskDashboard,
    enabled: isAuthenticated,
  });
}

export function useTaskBoard(search?: string) {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["tasks-board", token, search],
    queryFn: () => fetchTaskBoard(search),
    enabled: isAuthenticated,
  });
}

export function useTaskCalendar(startDate?: string, endDate?: string) {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["tasks-calendar", token, startDate, endDate],
    queryFn: () => fetchTaskCalendar(startDate, endDate),
    enabled: isAuthenticated,
  });
}

export function useEmployees() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["employees", token],
    queryFn: fetchEmployees,
    enabled: isAuthenticated,
  });
}

export function useQuotations() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["quotations", token],
    queryFn: fetchQuotationsData,
    enabled: isAuthenticated ,
  });
}

export function useReports(params?: Record<string, ReturnType<typeof JSON.parse>>) {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["reports", token, params],
    queryFn: () => fetchReportsData(params),
    enabled: isAuthenticated ,
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
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Lead created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create lead");
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadType> }) => updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Lead updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update lead");
    },
  });
}

export function useUpdatePipelineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, ReturnType<typeof JSON.parse>> }) => updatePipelineItem(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["pipeline"] });
      const previousPipeline = queryClient.getQueryData(["pipeline"]);

      queryClient.setQueryData(["pipeline"], (old: ReturnType<typeof JSON.parse>) => {
        if (!old || !old.items) return old;
        
        let newStage = undefined;
        if (data.stage) {
          const enumToStage: Record<string, string> = {
            "NEW": "New Lead",
            "CONTACTED": "Contacted",
            "PROPOSAL_SENT": "Proposal Sent",
            "WON": "Won",
            "LOST": "Lost"
          };
          newStage = enumToStage[data.stage];
        }

        return {
          ...old,
          items: old.items.map((item: ReturnType<typeof JSON.parse>) => 
            item.id === id 
              ? { ...item, ...data, ...(newStage ? { stage: newStage } : {}) } 
              : item
          )
        };
      });

      return { previousPipeline };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousPipeline) {
        queryClient.setQueryData(["pipeline"], context.previousPipeline);
      }
      toast.error(error.message || "Failed to update pipeline stage");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onSuccess: () => {
      // Toast is handled in the component
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const previousLeads = queryClient.getQueryData(["leads"]);

      queryClient.setQueryData(["leads"], (old: ReturnType<typeof JSON.parse>) => {
        if (!old || !old.leads) return old;
        return {
          ...old,
          leads: old.leads.filter((lead: ReturnType<typeof JSON.parse>) => lead.id !== id),
          summary: { ...old.summary, total: Math.max(0, (old.summary?.total || 1) - 1) },
          pagination: { ...old.pagination, total: Math.max(0, (old.pagination?.total || 1) - 1) }
        };
      });

      return { previousLeads };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(["leads"], context.previousLeads);
      }
      toast.error(error.message || "Failed to delete lead");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    }
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

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('@/shared/types/customer').CustomerType> }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Customer updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update customer");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete customer");
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

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('@/shared/types/task').TaskType> }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update task");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-board"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-board"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) => assignTask(id, assignedToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-board"] });
      toast.success("Task reassigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reassign task");
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-board"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task marked as completed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete task");
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

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('@/shared/types/quotation').QuotationType> }) => updateQuotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Quotation updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update quotation");
    },
  });
}

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateQuotationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Quotation status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update quotation status");
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Quotation deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete quotation");
    },
  });
}

// ─── Lead Details Hooks ──────────────────────────────────────────────────────────

export function useLeadNotes(leadId: string) {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["leadNotes", leadId, token],
    queryFn: () => fetchLeadNotes(leadId),
    enabled: isAuthenticated && !!leadId,
  });
}

export function useCreateLeadNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: ReturnType<typeof JSON.parse> }) => createLeadNote(leadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leadNotes", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadTimeline", variables.leadId] });
      toast.success("Note added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add note");
    },
  });
}

export function useLeadTimeline(leadId: string) {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["leadTimeline", leadId, token],
    queryFn: () => fetchLeadTimeline(leadId),
    enabled: isAuthenticated && !!leadId,
  });
}

export function useLeadAttachments(leadId: string) {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["leadAttachments", leadId, token],
    queryFn: () => fetchLeadAttachments(leadId),
    enabled: isAuthenticated && !!leadId,
  });
}

export function useCreateLeadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: ReturnType<typeof JSON.parse> }) => createLeadAttachment(leadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leadAttachments", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["leadTimeline", variables.leadId] });
      toast.success("Attachment added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add attachment");
    },
  });
}

export function useLeadMeetings(leadId: string) {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["leadMeetings", leadId, token],
    queryFn: () => fetchLeadMeetings(leadId),
    enabled: isAuthenticated && !!leadId,
  });
}

export function useCreateLeadMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: ReturnType<typeof JSON.parse> }) => createLeadMeeting(leadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leadMeetings", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadTimeline", variables.leadId] });
      toast.success("Meeting scheduled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to schedule meeting");
    },
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReturnType<typeof JSON.parse>) => import("@/shared/lib/api/crm").then(m => m.createMeeting(data)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
      }
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: ["leadMeetings", variables.leadId] });
        queryClient.invalidateQueries({ queryKey: ["leadTimeline", variables.leadId] });
      }
      toast.success("Meeting scheduled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to schedule meeting");
    },
  });
}
