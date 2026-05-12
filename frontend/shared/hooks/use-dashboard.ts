"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchDashboardData, 
  fetchHotLeads, 
  fetchTeamPerformance, 
  fetchMeetings, 
  fetchNotifications, 
  fetchAiInsights 
} from "@/shared/lib/api/crm";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    refetchInterval: 30000,
  });
}

export function useHotLeads() {
  return useQuery({
    queryKey: ["hotLeads"],
    queryFn: fetchHotLeads,
    refetchInterval: 30000,
  });
}

export function useTeamPerformance() {
  return useQuery({
    queryKey: ["teamPerformance"],
    queryFn: fetchTeamPerformance,
    refetchInterval: 30000,
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: fetchMeetings,
    refetchInterval: 30000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  });
}

export function useAiInsights() {
  return useQuery({
    queryKey: ["aiInsights"],
    queryFn: fetchAiInsights,
    refetchInterval: 30000,
  });
}











