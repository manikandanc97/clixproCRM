"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsData } from "@/shared/lib/api/crm";
import { useAuth } from "@/features/auth/components/auth-provider";

export function useAnalytics(filter?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["analytics", filter],
    queryFn: () => fetchAnalyticsData(filter),
    enabled: isAuthenticated ,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}











