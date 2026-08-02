"use client";

import React from "react";
import { CRMPageContainer, CRMMetricCard, CRMMetricsGrid } from "@/shared/components/crm";
import { Skeleton } from "@/shared/ui/skeleton";
import { CalendarDays, Users, Phone, CheckSquare } from "lucide-react";

export function CalendarSkeleton() {
  return (
    <CRMPageContainer className="min-h-full bg-background/50">
      {/* ── HEADER SKELETON ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24 hidden sm:block" />
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="w-12 h-7 rounded-md" />
            <Skeleton className="w-7 h-7 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-44 h-8 rounded-md hidden md:block" />
          <Skeleton className="w-40 h-8 rounded-md" />
          <Skeleton className="w-24 h-8 rounded-md" />
        </div>
      </div>

      {/* ── METRIC CARDS SKELETON ── */}
      <div>
        <CRMMetricsGrid className="gap-3 md:gap-4">
          <CRMMetricCard
            title="Today's Meetings"
            value={0}
            loading={true}
            hideBottomSkeletons={true}
            icon={Users}
            color="emerald"
            trend="neutral"
            delay={0}
          />
          <CRMMetricCard
            title="Calls Today"
            value={0}
            loading={true}
            hideBottomSkeletons={true}
            icon={Phone}
            color="orange"
            trend="neutral"
            delay={0.05}
          />
          <CRMMetricCard
            title="Tasks Due"
            value={0}
            loading={true}
            hideBottomSkeletons={true}
            icon={CheckSquare}
            color="indigo"
            trend="neutral"
            delay={0.1}
          />
          <CRMMetricCard
            title="Total Events"
            value={0}
            loading={true}
            hideBottomSkeletons={true}
            icon={CalendarDays}
            color="violet"
            trend="neutral"
            delay={0.15}
          />
        </CRMMetricsGrid>
      </div>

      {/* ── MAIN: Sidebar + Grid SKELETON ── */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Sidebar */}
        <div className="hidden lg:flex w-[300px] xl:w-[320px] flex-shrink-0 flex-col bg-card rounded-2xl shadow-sm border border-border/50 p-6 space-y-6">
          <Skeleton className="w-full h-56 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 min-w-0 w-full h-[800px] bg-card rounded-2xl shadow-sm border border-border/50 p-4 lg:p-6 flex flex-col">
          <div className="grid grid-cols-7 gap-2 mb-4 border-b border-border/30 pb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-4 w-8 mx-auto" />
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-full min-h-[100px] rounded-xl opacity-50" />
            ))}
          </div>
        </div>
      </div>
    </CRMPageContainer>
  );
}
