"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchDashboardData, 
  fetchHotLeads, 
  fetchTeamPerformance, 
  fetchMeetings, 
  fetchNotifications, 
  fetchAiInsights 
} from "@/lib/api/crm";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
  });
}

export function useHotLeads() {
  return useQuery({
    queryKey: ["hotLeads"],
    queryFn: fetchHotLeads,
  });
}

export function useTeamPerformance() {
  return useQuery({
    queryKey: ["teamPerformance"],
    queryFn: fetchTeamPerformance,
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: fetchMeetings,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
}

export function useAiInsights() {
  return useQuery({
    queryKey: ["aiInsights"],
    queryFn: fetchAiInsights,
  });
}
