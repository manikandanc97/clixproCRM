"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAiSettings,
  fetchBillingSettings,
  fetchIntegrationSettings,
  fetchNotificationSettings,
  fetchSecuritySettings,
  fetchWorkspaceData,
} from "@/shared/lib/api/crm";

export function useWorkspace() {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: fetchWorkspaceData,
    refetchInterval: 60000,
  });
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: ["settings", "security"],
    queryFn: fetchSecuritySettings,
    refetchInterval: 60000,
  });
}

export function useBillingSettings() {
  return useQuery({
    queryKey: ["settings", "billing"],
    queryFn: fetchBillingSettings,
    refetchInterval: 60000,
  });
}

export function useIntegrationSettings() {
  return useQuery({
    queryKey: ["settings", "integrations"],
    queryFn: fetchIntegrationSettings,
    refetchInterval: 60000,
  });
}

export function useAiSettings() {
  return useQuery({
    queryKey: ["settings", "ai"],
    queryFn: fetchAiSettings,
    refetchInterval: 60000,
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["settings", "notifications"],
    queryFn: fetchNotificationSettings,
    refetchInterval: 60000,
  });
}











