"use client";

import { LeadType } from "@/shared/types/lead";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchCustomersData, 
  fetchLeadsData, 
  fetchPipelineData, 
  fetchTasksData, 
  fetchQuotationsData,
  fetchReportsData,
  createLead,
  updateLead,
  deleteLead,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createTask,
  updateTask,
  deleteTask,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  updatePipelineItem,
  fetchLeadNotes,
  createLeadNote,
  fetchLeadTimeline,
  createLeadTimelineEvent,
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

export function useTasks() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["tasks", token],
    queryFn: fetchTasksData,
    enabled: isAuthenticated ,
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

export function useReports() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["reports", token],
    queryFn: fetchReportsData,
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
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => updatePipelineItem(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["pipeline"] });
      const previousPipeline = queryClient.getQueryData(["pipeline"]);

      queryClient.setQueryData(["pipeline"], (old: any) => {
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
          items: old.items.map((item: any) => 
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

      queryClient.setQueryData(["leads"], (old: any) => {
        if (!old || !old.leads) return old;
        return {
          ...old,
          leads: old.leads.filter((lead: any) => lead.id !== id),
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete task");
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
    mutationFn: ({ leadId, data }: { leadId: string; data: any }) => createLeadNote(leadId, data),
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
    mutationFn: ({ leadId, data }: { leadId: string; data: any }) => createLeadAttachment(leadId, data),
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
    mutationFn: ({ leadId, data }: { leadId: string; data: any }) => createLeadMeeting(leadId, data),
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
