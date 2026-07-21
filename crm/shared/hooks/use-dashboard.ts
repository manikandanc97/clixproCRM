"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchDashboardData, 
  fetchHotLeads, 
  fetchTeamPerformance, 
  fetchMeetings, 
  fetchNotifications, 
  fetchAiInsights,
  fetchLeadsData,
  fetchTasksData,
  fetchPipelineData,
  fetchCustomersData
} from "@/shared/lib/api/crm";
import { useAuth } from "@/features/auth/components/auth-provider";

export function useDashboardData() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["dashboardData", token],
    queryFn: fetchDashboardData,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useHotLeads() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["hotLeads", token],
    queryFn: fetchHotLeads,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}

export function useTeamPerformance() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["teamPerformance", token],
    queryFn: fetchTeamPerformance,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}

export function useMeetings() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["meetings", token],
    queryFn: fetchMeetings,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}

export function useNotifications() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["notifications", token],
    queryFn: fetchNotifications,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 30 * 1000, // Notifications can be slightly more frequent
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAiInsights() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["aiInsights", token],
    queryFn: fetchAiInsights,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 10 * 60 * 1000, // AI insights change slowly
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Entity Hooks ────────────────────────────────────────────────────────────

export function useLeads() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["leads", token],
    queryFn: fetchLeadsData,
    enabled: isHydrated && isAuthenticated ,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTasks() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["tasks", token],
    queryFn: fetchTasksData,
    enabled: isHydrated && isAuthenticated ,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePipeline() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["pipeline", token],
    queryFn: fetchPipelineData,
    enabled: isHydrated && isAuthenticated ,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomers() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  return useQuery({
    queryKey: ["customers", token],
    queryFn: fetchCustomersData,
    enabled: isHydrated && isAuthenticated ,
    staleTime: 5 * 60 * 1000,
  });
}

import { useAnalytics } from "./use-analytics";

/**
 * Hook to initialize all dashboard-related data in one go.
 * This ensures that even if specific components aren't mounted yet,
 * the core CRM data is being fetched and cached.
 */
export function useDashboardInitializer() {
  const { isAuthenticated, isInitializing: isAuthInitializing } = useAuth();
  
  // Primary dashboard data
  const dashboard = useDashboardData();
  
  // Entity data
  const leads = useLeads();
  const tasks = useTasks();
  const pipeline = usePipeline();
  const customers = useCustomers();

  // Widget specific data
  const meetings = useMeetings();
  const hotLeads = useHotLeads();
  const teamPerformance = useTeamPerformance();
  const aiInsights = useAiInsights();
  const analytics = useAnalytics();

  const queries = {
    dashboard,
    leads,
    tasks,
    pipeline,
    customers,
    meetings,
    hotLeads,
    teamPerformance,
    aiInsights,
    analytics,
  };

  // Critical: We are only "initializing" if auth is still reading from storage,
  // OR if we are authenticated but the primary dashboard data hasn't arrived yet.
  const isInitializing = isAuthInitializing || (isAuthenticated && dashboard.isLoading && !dashboard.data);
  const isLoading = dashboard.isLoading || Object.values(queries).some(q => q.isLoading);

  return {
    isAuthenticated,
    isAuthInitializing,
    isLoading,
    isInitializing,
    queries, 
    data: {
      dashboard: dashboard.data,
      leads: leads.data,
      tasks: tasks.data,
      pipeline: pipeline.data,
      customers: customers.data,
      meetings: meetings.data,
      hotLeads: hotLeads.data,
      teamPerformance: teamPerformance.data,
      aiInsights: aiInsights.data,
      analytics: analytics.data,
    },
    refetchAll: () => {
      Object.values(queries).forEach(q => q.refetch());
    }
  };
}
