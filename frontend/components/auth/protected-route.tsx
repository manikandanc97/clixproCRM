"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const subscribe = () => () => {};
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;
const getTokenSnapshot = () => Boolean(localStorage.getItem("token"));

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const isMounted = useSyncExternalStore(subscribe, getMountedSnapshot, getServerSnapshot);
  const hasToken = useSyncExternalStore(subscribe, getTokenSnapshot, getServerSnapshot);

  useEffect(() => {
    if (isMounted && !hasToken) {
      router.replace("/login");
    }
  }, [hasToken, isMounted, router]);

  if (!isMounted || !hasToken) {
    return null;
  }

  return <>{children}</>;
}
