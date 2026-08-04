"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRevenueTargetAnalytics } from "@/shared/lib/api/crm";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useSearchParams } from "next/navigation";

export function useRevenueTarget() {
  const { isAuthenticated, token } = useAuth();
  const searchParams = useSearchParams();
  
  // Extract filters from URL
  const filters = {
    region: searchParams.get("region") || "all",
    agent: searchParams.get("agent") || "all",
    timeframe: searchParams.get("timeframe") || "this-month",
  };

  return useQuery({
    queryKey: ["revenue-target", token, filters],
    queryFn: () => fetchRevenueTargetAnalytics(filters),
    enabled: isAuthenticated,
    refetchInterval: 60 * 1000, // Refetch every minute for near real-time updates
    staleTime: 30 * 1000,
  });
}
