"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  fetchEmployees, 
  fetchRoles 
} from "@/lib/api/crm";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
}
