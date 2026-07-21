"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchEmployees, 
  fetchRoles 
} from "@/shared/lib/api/crm";
import { useAuth } from "@/features/auth/components/auth-provider";

export function useEmployees() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
}

export function useRoles() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
}











