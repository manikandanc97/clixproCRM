"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCurrentUser, loginUser, logoutUser as clearSessionToken } from "@/shared/lib/api/auth";
import { 
  defaultRoleAccess, 
  normalizeRole, 
  type RoleAccess, 
  CRM_ROLES, 
  getRoleMenu,
  roleRouteConfig,
} from "@/shared/lib/auth/rbac";
import { useCRMStore } from "@/shared/store/useCRMStore";

const STORAGE_TOKEN_KEY = "orbit_token";
const STORAGE_USER_KEY = "orbit_user";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleName?: string;
  displayName?: string;
  avatar?: string;
  status?: string;
  permissions?: string[];
  routes?: string[];
  dashboardWidgets?: string[];
  analyticsVisibility?: RoleAccess["analyticsVisibility"];
  description?: string;
};

type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

type AuthContextState = {
  user: AuthUser | null;
  access: RoleAccess;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextState | null>(null);

const WIDGETS_BY_ROLE: Record<string, string[]> = {
  [CRM_ROLES.ADMIN]: ["salesChart", "upcomingMeetings", "hotLeads", "teamPerformance", "leadFunnel", "revenueTracker", "recentActivities", "pendingFollowups", "aiInsights", "calendarWidget"],
  [CRM_ROLES.MANAGER]: ["salesChart", "upcomingMeetings", "hotLeads", "teamPerformance", "leadFunnel", "recentActivities", "pendingFollowups", "calendarWidget"],
  [CRM_ROLES.SALES]: ["salesChart", "upcomingMeetings", "hotLeads", "leadFunnel", "recentActivities", "pendingFollowups", "calendarWidget"],
  [CRM_ROLES.SUPPORT]: ["upcomingMeetings", "recentActivities", "pendingFollowups", "calendarWidget"],
  [CRM_ROLES.EMPLOYEE]: ["upcomingMeetings", "recentActivities", "pendingFollowups", "calendarWidget"],
};

function buildAccess(user: AuthUser | null): RoleAccess {
  if (!user) {
    return defaultRoleAccess;
  }

  const roleKey = normalizeRole(user.role);
  const allowedRoutes = roleRouteConfig[roleKey] || ["/dashboard"];

  return {
    roleName:
      user.roleName ||
      roleKey
        .split("_")
        .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
        .join(" "),
    description: user.description || defaultRoleAccess.description,
    permissions: user.permissions || [],
    routes: allowedRoutes,
    dashboardWidgets: WIDGETS_BY_ROLE[roleKey] || WIDGETS_BY_ROLE[CRM_ROLES.EMPLOYEE],
    analyticsVisibility: user.analyticsVisibility || "self",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const isInitializing = status === "initializing";

  const logout = useCallback(async () => {
    await clearSessionToken(); // hits /api/auth/logout
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear(); // Clear all cached data on logout
    useCRMStore.getState().reset(); // Reset CRM store
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error: unknown) {
      setStatus("unauthenticated");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsHydrated(true));
  }, [refreshUser]);

  useEffect(() => {
    const handleAuthExpired = () => logout();
    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await loginUser({ email, password });
      
      setUser(response.user);
      setStatus("authenticated");
      
      // Clear cache to ensure fresh data for the new user
      await queryClient.clear();
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  const value = useMemo<AuthContextState>(
    () => ({
      user,
      access: buildAccess(user),
      token: null, // Token is no longer exposed to frontend
      loading: loading || status === "initializing",
      isAuthenticated: status === "authenticated",
      isInitializing: status === "initializing",
      isHydrated,
      login,
      logout,
      refreshUser,
      hasPermission: (permission: string) => {
        if (!user) return false;
        if (user.role === CRM_ROLES.ADMIN) return true;
        return Boolean(user.permissions?.includes(permission));
      },
    }),
    [status, user, login, logout, refreshUser, loading, isHydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
