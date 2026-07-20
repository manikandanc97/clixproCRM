"use client";

import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface LoadingStateProps {
  label: string;
}

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void | Promise<void>;
}

interface EmptyStateProps {
  title: string;
  message: string;
}

export function PageLoadingState({ label }: LoadingStateProps) {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-8 py-10 text-center shadow-card">
        <LoaderCircle className="h-10 w-10 animate-spin text-emerald-600" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Loading live data</h2>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function PageErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-destructive/20 bg-card px-8 py-10 text-center shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <Button
          onClick={() => void onRetry()}
          className="mt-6 px-6"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

export function EmptyStateCard({ title, message }: EmptyStateProps) {
  return (
    <div className="crm-empty-state">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>
    </div>
  );
}











