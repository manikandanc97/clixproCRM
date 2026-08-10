"use client";

/**
 * PublicRoute
 *
 * Wraps login/register pages. If user is already authenticated,
 * redirect them to /dashboard.
 *
 * During "initializing" phase we show nothing (blank) to avoid
 * flashing the login form to users who are already logged in.
 * The auth loading screen is shown by ProtectedRoute on the dashboard
 * side; public routes just render null during init to stay invisible.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import AuthLoadingScreen from "./auth-loading-screen";

type PublicRouteProps = {
  children: React.ReactNode;
};

export default function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitializing, router]);

  // During init or when redirecting authenticated user, show loading screen instead of blank null
  if (isInitializing || isAuthenticated) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
