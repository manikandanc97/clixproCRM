"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { CRMCard } from "./CRMCard";
import { Area, AreaChart } from "recharts";
import { cn } from "@/shared/lib/utils";

import { Skeleton } from "@/shared/ui/skeleton";

export type MetricColor = 'emerald' | 'blue' | 'cyan' | 'orange' | 'purple' | 'pink' | 'indigo' | 'slate' | 'primary';

type SparklineDotProps = {
  cx?: number;
  cy?: number;
  index?: number;
};

interface CRMMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  iconColor?: string;
  sparklineData?: { value: number }[];
  delay?: number;
  color?: MetricColor;
  loading?: boolean;
}

import { ChartContainer } from "../charts/ChartContainer";

export const CRMMetricCard = ({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  iconColor,
  sparklineData,
  delay = 0,
  color = "slate",
  loading = false,
}: CRMMetricCardProps) => {
  const isUp = trend === "up";
  const isDown = trend === "down";

  const colorMap: Record<string, { stroke: string; fill: string; icon: string; badge: string }> = {
    emerald: { 
      stroke: "#10b981", 
      fill: "url(#gradient-emerald)", 
      icon: "text-emerald-600 dark:text-emerald-400 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
      badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    },
    blue: { 
      stroke: "#3b82f6", 
      fill: "url(#gradient-blue)", 
      icon: "text-blue-600 dark:text-blue-400 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20",
      badge: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    },
    cyan: { 
      stroke: "#06b6d4", 
      fill: "url(#gradient-cyan)", 
      icon: "text-cyan-600 dark:text-cyan-400 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
      badge: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
    },
    orange: { 
      stroke: "#f97316", 
      fill: "url(#gradient-orange)", 
      icon: "text-orange-600 dark:text-orange-400 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20",
      badge: "bg-orange-500/10 text-orange-500 border-orange-500/20"
    },
    purple: { 
      stroke: "#a855f7", 
      fill: "url(#gradient-purple)", 
      icon: "text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20",
      badge: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    },
    pink: { 
      stroke: "#ec4899", 
      fill: "url(#gradient-pink)", 
      icon: "text-pink-600 dark:text-pink-400 bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-pink-500/20",
      badge: "bg-pink-500/10 text-pink-500 border-pink-500/20"
    },
    indigo: { 
      stroke: "#6366f1", 
      fill: "url(#gradient-indigo)", 
      icon: "text-indigo-600 dark:text-indigo-400 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-indigo-500/20",
      badge: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
    },
    primary: { 
      stroke: "#6366f1", 
      fill: "url(#gradient-indigo)", 
      icon: "text-indigo-600 dark:text-indigo-400 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-indigo-500/20",
      badge: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
    },
    slate: { 
      stroke: "#64748b", 
      fill: "url(#gradient-slate)", 
      icon: "text-slate-600 dark:text-slate-400 bg-gradient-to-br from-slate-500/20 to-slate-500/5 border-slate-500/20",
      badge: "bg-muted/10 text-muted-foreground border-slate-500/20"
    },
  };

  const theme = colorMap[color] || colorMap.slate;

  const borderColors: Record<string, string> = {
    emerald: "border-l-emerald-500",
    blue: "border-l-blue-500",
    cyan: "border-l-cyan-500",
    orange: "border-l-orange-500",
    purple: "border-l-purple-500",
    pink: "border-l-pink-500",
    indigo: "border-l-indigo-500",
    primary: "border-l-indigo-500",
    slate: "border-l-slate-400",
  };

  return (
    <CRMCard 
      delay={delay} 
      className="group relative overflow-hidden min-w-0"
      withAccent={true}
      accentColor={borderColors[color]}
    >
      {/* Subtle metric accent */}
      <div className={cn(
        "absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-15",
        color === 'emerald' ? "bg-emerald-500" : 
        color === 'blue' ? "bg-blue-500" :
        color === 'cyan' ? "bg-cyan-500" :
        color === 'orange' ? "bg-orange-500" :
        color === 'purple' ? "bg-purple-500" :
        color === 'pink' ? "bg-pink-500" :
        color === 'indigo' ? "bg-indigo-500" : "bg-muted0"
      )} />

      <div className="flex justify-between items-start mb-3 min-w-0">
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="crm-label truncate">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-10 w-24 mt-2" />
          ) : (
            <h3 className="text-4xl font-bold tracking-normal tabular-nums truncate">
              {value}
            </h3>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "crm-icon-box shrink-0", 
            theme.icon,
            iconColor // Allow override if needed
          )}>
            <Icon className="h-5 w-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 mt-auto min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          {loading ? (
            <Skeleton className="h-6 w-16 rounded-full" />
          ) : change && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider",
              isUp ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
              isDown ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : 
              "bg-muted0/10 text-muted-foreground border-slate-500/20"
            )}>
              {isUp && <TrendingUp className="w-3 h-3" />}
              {isDown && <TrendingDown className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>

        {(sparklineData || loading) && (
          <div className="h-12 w-24 -mr-2 -mb-1 min-h-[48px] min-w-0">
            <ChartContainer 
              height="100%" 
              loading={loading}
              hasData={!!sparklineData && sparklineData.length > 0}
              className="w-full h-full"
            >
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.stroke} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={theme.stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={theme.stroke}
                  strokeWidth={2.5}
                  fill={theme.fill}
                  isAnimationActive={true}
                  animationDuration={1500}
                  dot={({ cx, cy, index }: SparklineDotProps) => {
                    // Only show dot on the last point for that "premium" look
                    if (sparklineData && index === sparklineData.length - 1) {
                      return (
                        <g key={`dot-${index}`}>
                          <circle cx={cx} cy={cy} r={6} fill={theme.stroke} fillOpacity={0.2} />
                          <circle cx={cx} cy={cy} r={3} fill={theme.stroke} stroke="white" strokeWidth={1.5} className="animate-pulse" />
                        </g>
                      );
                    }
                    return null;
                  }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </CRMCard>
  );
};
