"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchEmployees, 
  fetchRoles 
} from "@/shared/lib/api/crm";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    refetchInterval: 30000,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    refetchInterval: 30000,
  });
}











