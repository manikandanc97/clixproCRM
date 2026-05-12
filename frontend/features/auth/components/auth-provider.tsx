"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type React from "react";
import { fetchCurrentUser, loginUser, logoutUser as clearSessionToken } from "@/shared/lib/api/auth";
import { defaultRoleAccess, normalizeRole, type RoleAccess } from "@/shared/lib/auth/rbac";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleName?: string;
  permissions?: string[];
  routes?: string[];
  dashboardWidgets?: string[];
  analyticsVisibility?: RoleAccess["analyticsVisibility"];
  description?: string;
};

type AuthContextState = {
  user: AuthUser | null;
  access: RoleAccess;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextState | null>(null);

function buildAccess(user: AuthUser | null): RoleAccess {
  if (!user) {
    return defaultRoleAccess;
  }

  return {
    roleName:
      user.roleName ||
      normalizeRole(user.role)
        .split("_")
        .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
        .join(" "),
    description: user.description || defaultRoleAccess.description,
    permissions: user.permissions || [],
    routes: user.routes || ["/dashboard"],
    dashboardWidgets: user.dashboardWidgets || [],
    analyticsVisibility: user.analyticsVisibility || "self",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const loading = Boolean(token) && !user;

  const logout = useCallback(() => {
    clearSessionToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (!token) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshUser();
  }, [refreshUser, token]);

  useEffect(() => {
    const handleAuthExpired = () => logout();
    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginUser({ email, password });
    localStorage.setItem("token", response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const value = useMemo<AuthContextState>(
    () => ({
      user,
      access: buildAccess(user),
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshUser,
      hasPermission: (permission: string) => Boolean(user?.permissions?.includes(permission)),
    }),
    [loading, login, logout, refreshUser, token, user],
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












