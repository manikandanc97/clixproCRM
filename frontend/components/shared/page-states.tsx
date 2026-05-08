"use client";

import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200/70 bg-white px-8 py-10 text-center shadow-sm">
        <LoaderCircle className="h-10 w-10 animate-spin text-emerald-600" />
        <div>
          <h2 className="text-lg font-bold text-slate-900">Loading live data</h2>
          <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function PageErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-rose-200/70 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
        <Button
          onClick={() => void onRetry()}
          className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 font-bold text-white shadow-lg shadow-emerald-100 hover:from-emerald-700 hover:to-teal-700"
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
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">{message}</p>
    </div>
  );
}
