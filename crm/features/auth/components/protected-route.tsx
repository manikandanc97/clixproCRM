"use client";

/**
 * ProtectedRoute
 *
 * Guards dashboard pages. Three phases:
 * 1. isInitializing — show loading screen (auth not yet hydrated from localStorage)
 * 2. !isAuthenticated — redirect to /login
 * 3. Route not in access.routes — redirect to /unauthorized
 *
 * Critical: NEVER redirect during "initializing" phase. The auth state hasn't
 * been read from localStorage yet. Any redirect here would cause the
 * "refresh → back to login" bug.
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { isRouteAllowed } from "@/shared/lib/auth/rbac";
import AuthLoadingScreen from "./auth-loading-screen";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitializing, access, user } = useAuth();

  useEffect(() => {
    // Do NOT redirect during initialization — auth state not resolved yet.
    if (isInitializing) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isRouteAllowed(pathname, access.routes)) {
      router.replace("/unauthorized");
    }
  }, [access.routes, isAuthenticated, isInitializing, pathname, router]);

  // Show branded loading screen while auth is being hydrated from localStorage.
  // This prevents the blank screen and the false redirect to /login.
  // Show branded loading screen while auth is being hydrated or transitioning.
  // This prevents blank states and premature rendering of protected content.
  if (isInitializing || (isAuthenticated && !user)) {
    return <AuthLoadingScreen />;
  }

  // Not authenticated — render nothing while redirect happens
  if (!isAuthenticated) {
    return null;
  }

  // Route not allowed — render nothing while redirect happens
  if (!isRouteAllowed(pathname, access.routes)) {
    return null;
  }

  return <>{children}</>;
}
