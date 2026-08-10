"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 xl:space-y-8 pb-10 w-full">
      {/* Hero Skeleton */}
      <div className="w-full h-[240px] md:h-[280px] skeleton rounded-xl mb-8" />

      {/* Stats Cards Skeleton */}
      <div className="gap-4 lg:gap-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/60 dark:bg-card/40 border-transparent rounded-xl h-40">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 skeleton rounded-xl" />
                <div className="w-16 h-6 skeleton rounded-full" />
              </div>
              <div className="w-24 h-4 skeleton rounded mb-2 mt-4" />
              <div className="w-32 h-8 skeleton rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="gap-6 xl:gap-8 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        {/* Main Chart Column Skeleton */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6 xl:space-y-8">
          <Card className="bg-card/60 dark:bg-card/40 border-transparent rounded-xl h-[450px]">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="w-48 h-6 skeleton rounded" />
              <div className="w-64 h-4 skeleton rounded mt-2" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="w-full h-[320px] skeleton rounded-xl" />
            </CardContent>
          </Card>
          
          <div className="gap-6 xl:gap-8 grid grid-cols-1 md:grid-cols-2">
            <Card className="bg-card/60 dark:bg-card/40 border-transparent rounded-xl h-[400px]">
              <CardHeader className="px-6 pt-6"><div className="w-32 h-6 skeleton rounded" /></CardHeader>
              <CardContent className="px-6 pb-6"><div className="w-full h-full skeleton rounded-xl" /></CardContent>
            </Card>
            <Card className="bg-card/60 dark:bg-card/40 border-transparent rounded-xl h-[400px]">
              <CardHeader className="px-6 pt-6"><div className="w-32 h-6 skeleton rounded" /></CardHeader>
              <CardContent className="px-6 pb-6"><div className="w-full h-full skeleton rounded-xl" /></CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar Column Skeleton */}
        <div className="space-y-6 xl:space-y-8">
          {/* Revenue Tracker Skeleton */}
          <Card className="bg-card/60 dark:bg-card/40 border-transparent rounded-xl flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between pb-2 px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted/60 dark:bg-muted/40 rounded-xl">
                  <div className="w-5 h-5 skeleton rounded-sm opacity-50" />
                </div>
                <div>
                  <div className="w-32 h-5 skeleton rounded mb-1.5" />
                  <div className="w-24 h-3 skeleton rounded" />
                </div>
              </div>
              <div className="w-9 h-9 skeleton rounded-xl opacity-50" />
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2 flex flex-col flex-1">
              <div className="flex-1 flex items-center justify-between w-full py-2">
                <div className="flex flex-col items-start space-y-2">
                  <div className="w-14 h-2.5 skeleton rounded" />
                  <div className="w-12 h-6 md:h-7 skeleton rounded" />
                </div>

                <div className="w-full max-w-[160px] aspect-square relative shrink-0 min-h-[160px] flex items-center justify-center">
                  <div className="w-[140px] h-[140px] rounded-full border-[14px] border-muted/40 dark:border-muted/20 flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full animate-pulse bg-muted/5 dark:bg-muted/10" />
                    <div className="w-16 h-8 skeleton rounded mb-1.5 z-10" />
                    <div className="w-12 h-2.5 skeleton rounded z-10" />
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="w-14 h-2.5 skeleton rounded" />
                  <div className="w-20 h-6 md:h-7 skeleton rounded" />
                </div>
              </div>

              <div className="w-56 h-3 skeleton rounded mx-auto mb-3 mt-1 opacity-50" />
              <div className="mt-3 w-full py-3 h-[44px] skeleton rounded-xl" />
            </CardContent>
          </Card>
          <Card className="bg-card/60 dark:bg-card/40 border-transparent rounded-xl h-[520px]">
            <CardHeader className="px-6 pt-6"><div className="w-32 h-6 skeleton rounded" /></CardHeader>
            <CardContent className="px-6 pb-6"><div className="w-full h-full skeleton rounded-xl" /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}












