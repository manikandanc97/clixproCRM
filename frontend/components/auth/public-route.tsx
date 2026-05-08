"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PublicRouteProps = {
  children: React.ReactNode;
};

export default function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const [hasToken] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(localStorage.getItem("token"));
  });

  useEffect(() => {
    if (hasToken) {
      router.replace("/dashboard");
    }
  }, [hasToken, router]);

  if (hasToken) {
    return null;
  }

  return <>{children}</>;
}
