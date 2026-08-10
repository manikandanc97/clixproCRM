"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SettingsProvider } from "@/features/dashboard/components/SettingsContext";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { Toaster } from "@/shared/ui/sonner";

// Hack to suppress the React 19 "Encountered a script tag" error from next-themes
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    origError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000,   // 2 minutes — reduces unnecessary refetches
            gcTime: 10 * 60 * 1000,     // 10 minutes — keeps cache alive during navigation
            refetchOnWindowFocus: false, // Avoid noise-driven refetches
            retry: 1,                   // Don't hammer failing endpoints
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}











