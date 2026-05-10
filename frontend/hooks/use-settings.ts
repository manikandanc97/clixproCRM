"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWorkspaceData } from "@/lib/api/crm";

export function useWorkspace() {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: fetchWorkspaceData,
  });
}
