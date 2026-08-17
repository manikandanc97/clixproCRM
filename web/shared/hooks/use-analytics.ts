"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsData } from "@/shared/lib/api/crm";
import { useAuth } from "@/features/auth/components/auth-provider";

export function useAnalytics(filter?: string) {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["analytics", filter],
    queryFn: () => fetchAnalyticsData(filter),
    enabled: isHydrated && isAuthenticated,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}











