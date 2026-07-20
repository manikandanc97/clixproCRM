"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchEmployees, 
  fetchRoles 
} from "@/shared/lib/api/crm";
import { useAuth } from "@/features/auth/components/auth-provider";

export function useEmployees() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["employees", token],
    queryFn: fetchEmployees,
    enabled: isAuthenticated && !!token,
    refetchInterval: 30000,
  });
}

export function useRoles() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["roles", token],
    queryFn: fetchRoles,
    enabled: isAuthenticated && !!token,
    refetchInterval: 30000,
  });
}











