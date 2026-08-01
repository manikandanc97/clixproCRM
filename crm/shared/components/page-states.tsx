"use client";

import { AlertCircle,  RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

interface LoadingStateProps {
  label?: string;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PageLoadingState(_props: LoadingStateProps) {
  return (
    <div className="flex flex-col space-y-6 w-full p-2">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px] sm:w-[250px]" />
          <Skeleton className="h-4 w-[250px] sm:w-[350px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[140px]" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-[120px] rounded-xl w-full" />
        <Skeleton className="h-[120px] rounded-xl w-full" />
        <Skeleton className="h-[120px] rounded-xl w-full hidden md:block" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Table/List Skeleton */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg hidden sm:block" />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ComponentLoadingState(_props: LoadingStateProps) {
  return (
    <div className="flex flex-col space-y-6 w-full">
      <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
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











