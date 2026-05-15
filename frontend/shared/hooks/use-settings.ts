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
    enabled: isAuthenticated && !!token,
    refetchInterval: 60000,
  });
}

export function useSecuritySettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "security", token],
    queryFn: fetchSecuritySettings,
    enabled: isAuthenticated && !!token,
    refetchInterval: 60000,
  });
}

export function useBillingSettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "billing", token],
    queryFn: fetchBillingSettings,
    enabled: isAuthenticated && !!token,
    refetchInterval: 60000,
  });
}

export function useIntegrationSettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "integrations", token],
    queryFn: fetchIntegrationSettings,
    enabled: isAuthenticated && !!token,
    refetchInterval: 60000,
  });
}

export function useAiSettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "ai", token],
    queryFn: fetchAiSettings,
    enabled: isAuthenticated && !!token,
    refetchInterval: 60000,
  });
}

export function useNotificationSettings() {
  const { isAuthenticated, token } = useAuth();
  return useQuery({
    queryKey: ["settings", "notifications", token],
    queryFn: fetchNotificationSettings,
    enabled: isAuthenticated && !!token,
    refetchInterval: 60000,
  });
}











