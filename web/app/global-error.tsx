"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global runtime error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background px-4 font-sans">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-card rounded-2xl shadow-xl border border-border">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              Application Error
            </h2>
            <p className="text-sm text-muted-foreground">
              A critical error occurred. Click below to reload the application.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => reset()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
