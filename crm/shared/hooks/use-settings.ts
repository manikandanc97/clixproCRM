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

import { useAuth } from "@/features/auth/components/auth-provider";

export function useWorkspace() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["workspace", token],
    queryFn: fetchWorkspaceData,
    enabled: isAuthenticated ,
  });
}

export function useSecuritySettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "security", token],
    queryFn: fetchSecuritySettings,
    enabled: isAuthenticated ,
  });
}

export function useBillingSettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "billing", token],
    queryFn: fetchBillingSettings,
    enabled: isAuthenticated ,
  });
}

export function useIntegrationSettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "integrations", token],
    queryFn: fetchIntegrationSettings,
    enabled: isAuthenticated ,
  });
}

export function useAiSettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "ai", token],
    queryFn: fetchAiSettings,
    enabled: isAuthenticated ,
  });
}

export function useNotificationSettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "notifications", token],
    queryFn: fetchNotificationSettings,
    enabled: isAuthenticated ,
  });
}











