"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { CRMCard } from "./CRMCard";
import { Area, AreaChart, ResponsiveContainer, Dot } from "recharts";
import { cn } from "@/lib/utils";

export type MetricColor = 'emerald' | 'blue' | 'cyan' | 'orange' | 'purple' | 'pink' | 'indigo' | 'slate';

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
}

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
}: CRMMetricCardProps) => {
  const isUp = trend === "up";
  const isDown = trend === "down";

  const colorMap: Record<MetricColor, { stroke: string; fill: string; icon: string; badge: string }> = {
    emerald: { 
      stroke: "#10b981", 
      fill: "url(#gradient-emerald)", 
      icon: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    },
    blue: { 
      stroke: "#3b82f6", 
      fill: "url(#gradient-blue)", 
      icon: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      badge: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    },
    cyan: { 
      stroke: "#06b6d4", 
      fill: "url(#gradient-cyan)", 
      icon: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      badge: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
    },
    orange: { 
      stroke: "#f97316", 
      fill: "url(#gradient-orange)", 
      icon: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      badge: "bg-orange-500/10 text-orange-500 border-orange-500/20"
    },
    purple: { 
      stroke: "#a855f7", 
      fill: "url(#gradient-purple)", 
      icon: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      badge: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    },
    pink: { 
      stroke: "#ec4899", 
      fill: "url(#gradient-pink)", 
      icon: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      badge: "bg-pink-500/10 text-pink-500 border-pink-500/20"
    },
    indigo: { 
      stroke: "#6366f1", 
      fill: "url(#gradient-indigo)", 
      icon: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      badge: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
    },
    slate: { 
      stroke: "#64748b", 
      fill: "url(#gradient-slate)", 
      icon: "text-slate-500 bg-slate-500/10 border-slate-500/20",
      badge: "bg-slate-500/10 text-slate-500 border-slate-500/20"
    },
  };

  const theme = colorMap[color];

  return (
    <CRMCard 
      delay={delay} 
      className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Background Glow Effect */}
      <div className={cn(
        "absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full",
        color === 'emerald' ? "bg-emerald-500" : 
        color === 'blue' ? "bg-blue-500" :
        color === 'cyan' ? "bg-cyan-500" :
        color === 'orange' ? "bg-orange-500" :
        color === 'purple' ? "bg-purple-500" :
        color === 'pink' ? "bg-pink-500" :
        color === 'indigo' ? "bg-indigo-500" : "bg-slate-500"
      )} />

      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            {title}
          </p>
          <h3 className="text-3xl font-black tracking-tighter tabular-nums">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={cn(
            "p-3 rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm", 
            theme.icon,
            iconColor // Allow override if needed
          )}>
            <Icon className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 mt-auto">
        <div className="flex items-center gap-1.5">
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider",
              isUp ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
              isDown ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : 
              "bg-slate-500/10 text-slate-600 border-slate-500/20"
            )}>
              {isUp && <TrendingUp className="w-3 h-3" />}
              {isDown && <TrendingDown className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>

        {sparklineData && (
          <div className="h-14 w-28 -mr-2 -mb-1">
            <ResponsiveContainer width="100%" height="100%">
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
                  dot={(props: any) => {
                    const { cx, cy, index, payload } = props;
                    // Only show dot on the last point for that "premium" look
                    if (index === sparklineData.length - 1) {
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
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </CRMCard>
  );
};
