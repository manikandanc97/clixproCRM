import React from "react";
import AuthLayout from "@/features/auth/components/auth-layout";
import PublicRoute from "@/features/auth/components/public-route";

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicRoute>
      <AuthLayout>
        {children}
      </AuthLayout>
    </PublicRoute>
  );
}
