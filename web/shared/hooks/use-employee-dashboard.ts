"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEmployeeDashboardData } from "@/shared/lib/api/crm";
import { useAuth } from "@/features/auth/components/auth-provider";

/**
 * React Query hook that fetches personal dashboard metrics for the
 * currently logged-in user. Only returns records assigned to / owned by
 * this user — no org-wide data is included.
 *
 * Used by EmployeeDashboardKPIs for the EMPLOYEE role dashboard.
 */
export function useEmployeeDashboard() {
  const { isAuthenticated, isHydrated } = useAuth();
  return useQuery({
    queryKey: ["employeeDashboard"],
    queryFn: fetchEmployeeDashboardData,
    enabled: isHydrated && isAuthenticated,
    refetchInterval: 60 * 1000, // refresh every minute
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
