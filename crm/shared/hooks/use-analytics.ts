"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsData } from "@/shared/lib/api/crm";
import { useAuth } from "@/features/auth/components/auth-provider";

export function useAnalytics() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["analytics", token],
    queryFn: fetchAnalyticsData,
    enabled: isAuthenticated ,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}











