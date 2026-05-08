"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
          <Card className="bg-card/60 dark:bg-card/40 border-transparent rounded-xl h-[320px] skeleton" />
          <Card className="bg-card/60 dark:bg-card/40 border-transparent rounded-xl h-[520px]">
            <CardHeader className="px-6 pt-6"><div className="w-32 h-6 skeleton rounded" /></CardHeader>
            <CardContent className="px-6 pb-6"><div className="w-full h-full skeleton rounded-xl" /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
