"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from "react";
import type React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCurrentUser, loginUser, logoutUser as clearSessionToken } from "@/shared/lib/api/auth";
import { createClient } from "@/lib/supabase/client";
import { 
  defaultRoleAccess, 
  normalizeRole, 
  type RoleAccess, 
  CRM_ROLES, 
  roleRouteConfig,
  getRolePermissions,
} from "@/shared/lib/auth/rbac";
import { useCRMStore } from "@/shared/store/useCRMStore";

 
const _STORAGE_TOKEN_KEY = "orbit_token";
 
const _STORAGE_USER_KEY = "orbit_user";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  login: (email: string, password: string, staySignedIn?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextState | null>(null);

const WIDGETS_BY_ROLE: Record<string, string[]> = {
  [CRM_ROLES.ADMIN]: ["revenue", "newLeads", "activeDeals", "winRate", "salesChart", "upcomingMeetings", "hotLeads", "teamPerformance", "leadFunnel", "revenueTracker", "recentActivities", "pendingFollowups", "aiInsights", "calendarWidget"],
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
  const allowedRoutes = roleRouteConfig[roleKey] ? [...roleRouteConfig[roleKey]] : ["/dashboard"];

  const resolvedPermissions = user.permissions && user.permissions.length > 0 
    ? user.permissions 
    : getRolePermissions(roleKey);
    
  if (resolvedPermissions.includes("Help Center") || roleKey === CRM_ROLES.ADMIN) {
    if (!allowedRoutes.includes("/help")) {
      allowedRoutes.push("/help");
    }
  }

  return {
    roleName:
      user.roleName ||
      roleKey
        .split("_")
        .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
        .join(" "),
    description: user.description || defaultRoleAccess.description,
    permissions: resolvedPermissions,
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

  useEffect(() => {
    return () => {};
  }, []);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("has_session");
    }
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear(); // Clear all cached data on logout
    useCRMStore.getState().reset(); // Reset CRM store

    try {
      await clearSessionToken(); // hits /api/auth/logout
    } catch (error) {
      console.error("Logout API failed", error);
    }
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem("has_session")) {
        setStatus("unauthenticated");
        return;
      }
      setLoading(true);
      const currentUser = await fetchCurrentUser();
      if (!currentUser) {
        if (typeof window !== "undefined") localStorage.removeItem("has_session");
        setStatus("unauthenticated");
        return;
      }
      setUser(currentUser);
      setStatus("authenticated");
     
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message === "NEEDS_ONBOARDING") {
        if (typeof window !== "undefined" && window.location.pathname !== "/onboarding") {
          window.location.href = "/onboarding";
          return;
        }
        setStatus("unauthenticated");
        return;
      }
      if (typeof window !== "undefined") localStorage.removeItem("has_session");
      setStatus("unauthenticated");
    } finally {
      setLoading(false);
    }
  }, []);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
     
    refreshUser().finally(() => setIsHydrated(true));
  }, [refreshUser]);

  useEffect(() => {
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGNED_OUT') {
        logout();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!hasFetched.current) {
          refreshUser().finally(() => setIsHydrated(true));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [logout, refreshUser]);

  const login = useCallback(async (email: string, password: string, staySignedIn?: boolean) => {
    try {
      setLoading(true);
      const response = await loginUser({ email, password, staySignedIn });
      
      if (typeof window !== "undefined") {
        localStorage.setItem("has_session", "1");
      }
      setUser(response.data.user);
      setStatus("authenticated");
      
      // Clear cache to ensure fresh data for the new user
      await queryClient.clear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message === "NEEDS_ONBOARDING") {
        if (typeof window !== "undefined" && window.location.pathname !== "/onboarding") {
          window.location.href = "/onboarding";
          return;
        }
        setStatus("unauthenticated");
        return;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  const value = useMemo<AuthContextState>(() => {
    const access = buildAccess(user);
    return {
      user,
      access,
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
        return Boolean(access.permissions.includes(permission));
      },
    };
  }, [status, user, login, logout, refreshUser, loading, isHydrated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
