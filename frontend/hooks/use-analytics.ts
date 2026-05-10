"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsData } from "@/lib/api/crm";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalyticsData,
  });
}
