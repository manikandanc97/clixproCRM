"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { 
  fetchDashboardData, 
  fetchHotLeads, 
  fetchMeetings, 
  fetchNotifications, 
  fetchAiInsights,
  fetchLeadsData,
  fetchTasksData,
  fetchPipelineData,
  fetchCustomersData,
  fetchRevenueGrowth
} from "@/shared/lib/api/crm";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useCRMStore } from "@/shared/store/useCRMStore";

export function useDashboardData(timeframeProp?: string) {
  const storeTimeframe = useCRMStore((state) => state.activeTimeframe);
  const timeframe = timeframeProp || storeTimeframe;
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["dashboardData", timeframe],
    queryFn: () => fetchDashboardData(timeframe),
    enabled: isHydrated && isAuthenticated,
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useRevenueGrowth(filter: string = "Year") {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["revenueGrowth", filter],
    queryFn: () => fetchRevenueGrowth(filter),
    enabled: isHydrated && isAuthenticated,
    refetchInterval: 60 * 1000,
    staleTime: 60 * 1000,
  });
}

export function useHotLeads() {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["hotLeads"],
    queryFn: fetchHotLeads,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}



export function useMeetings() {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["meetings"],
    queryFn: fetchMeetings,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}

export function useNotifications() {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 30 * 1000, // Notifications can be slightly more frequent
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAiInsights() {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["aiInsights"],
    queryFn: fetchAiInsights,
    enabled: isHydrated && isAuthenticated ,
    refetchInterval: 10 * 60 * 1000, // AI insights change slowly
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Entity Hooks ────────────────────────────────────────────────────────────

export function useLeads() {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeadsData,
    enabled: isHydrated && isAuthenticated ,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTasks() {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasksData,
    enabled: isHydrated && isAuthenticated ,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePipeline() {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["pipeline"],
    queryFn: fetchPipelineData,
    enabled: isHydrated && isAuthenticated ,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomers() {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomersData,
    enabled: isHydrated && isAuthenticated ,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to initialize all dashboard-related data in one go.
 * This ensures that even if specific components aren't mounted yet,
 * the core CRM data is being fetched and cached.
 */
export function useDashboardInitializer(timeframeProp?: string) {
  const storeTimeframe = useCRMStore((state) => state.activeTimeframe);
  const timeframe = timeframeProp || storeTimeframe;
  const { isAuthenticated, isInitializing: isAuthInitializing } = useAuth();
  
  // Primary dashboard data
  const dashboard = useDashboardData(timeframe);
  
  // Trigger secondary data fetches in parallel
  useRevenueGrowth();
  useHotLeads();
  useMeetings();
  useNotifications();
  useAiInsights();
  useLeads();
  useTasks();
  usePipeline();
  useCustomers();
  
  // Critical: We are only "initializing" if auth is still reading from storage,
  // OR if we are authenticated but the primary dashboard data hasn't arrived yet.
  const isInitializing = isAuthInitializing || (isAuthenticated && dashboard.isLoading && !dashboard.data);

  return {
    isAuthenticated,
    isAuthInitializing,
    isInitializing,
  };
}
