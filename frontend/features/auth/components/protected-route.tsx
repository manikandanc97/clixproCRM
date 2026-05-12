"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { isRouteAllowed } from "@/shared/lib/auth/rbac";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, access } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!loading && isAuthenticated && !isRouteAllowed(pathname, access.routes)) {
      router.replace("/unauthorized");
    }
  }, [access.routes, isAuthenticated, loading, pathname, router]);

  if (loading || !isAuthenticated) {
    return null;
  }

  if (!isRouteAllowed(pathname, access.routes)) {
    return null;
  }

  return <>{children}</>;
}












