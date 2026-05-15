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

  // During init, show the loading screen to prevent login form flash
  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  // Already authenticated — render nothing while redirect happens
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
