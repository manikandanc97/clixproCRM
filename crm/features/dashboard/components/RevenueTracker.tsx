"use client";

import React from "react";
import { CRMCard } from "@/shared/components/crm/CRMCard";
import { CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { Target, TrendingUp, TrendingDown, ArrowUpRight, DollarSign, IndianRupee, ChevronRight, AlertCircle } from "lucide-react";
import { useRevenueTarget } from "@/shared/hooks/use-revenue-target";
import { ChartContainer } from "@/shared/components/charts/ChartContainer";
import { useCurrency } from "@/shared/hooks/use-currency";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RevenueTracker() {
  const { data: targetData, isLoading: loading } = useRevenueTarget();
  const { currencySymbol, currency } = useCurrency();
  const router = useRouter();
  const CurrencyIcon = currency === "INR" ? IndianRupee : DollarSign;

  const currentRevenue = targetData?.currentRevenue ?? 0;
  const targetRevenue = targetData?.targetValue ?? 0;
  const percentage = targetData?.achievementPercentage ?? 0;
  const hasTarget = targetData?.hasTarget ?? false;
  
  // Cap percentage for chart display, but keep original for text
  const chartPercentage = Math.min(percentage, 100);

  const chartData = [
    {
      name: "Revenue",
      value: chartPercentage,
      fill: "url(#colorRevenue)",
    },
  ];

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) return `${currencySymbol}${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${currencySymbol}${(num / 1000).toFixed(1)}k`;
    return `${currencySymbol}${num}`;
  };

  const trend = targetData?.trend;

  if (!hasTarget && !loading) {
    return (
      <CRMCard animate={false} className="h-full bg-gradient-to-br from-card to-background/50 flex flex-col justify-center items-center text-center">
        <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-bold text-lg mb-2">No Target Configured</h3>
        <p className="text-sm text-muted-foreground mb-4">Set up a revenue target to start tracking progress.</p>
        <Link href="/settings?section=targets" className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
          Configure Target
        </Link>
      </CRMCard>
    );
  }

  return (
    <CRMCard 
      animate={false}
      accentSeed="Revenue Tracker"
      noPadding
      className="h-full bg-gradient-to-br from-card to-background/50 relative overflow-hidden group flex flex-col min-w-0"
    >
      <CardHeader className="flex flex-row items-start justify-between z-10 relative pb-2 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl dark:bg-emerald-500/10">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Revenue Target</CardTitle>
            <div className="flex items-center gap-1 mt-0.5">
              {trend?.direction === "up" ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : trend?.direction === "down" ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className={`text-xs font-bold ${
                trend?.direction === "up" ? "text-emerald-500" : 
                trend?.direction === "down" ? "text-rose-500" : 
                "text-muted-foreground"
              }`}>
                {trend?.direction === "up" ? "▲" : trend?.direction === "down" ? "▼" : ""} {trend?.value ?? 0}%
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                vs last period
              </span>
            </div>
          </div>
        </div>
        <Link 
          href="/settings?section=targets"
          className="text-muted-foreground hover:text-muted-foreground transition-colors p-2 hover:bg-muted rounded-xl flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2 flex flex-col flex-1 relative z-10 min-w-0">
        <div className="flex-1 flex items-center justify-between w-full py-2 min-w-0">
          {/* Left Stat - Current */}
          <div className="flex flex-col items-start space-y-0.5 z-10 relative min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Current
            </p>
            <p className="text-lg md:text-xl font-black text-foreground dark:text-white tracking-tight">
              {formatLargeNumber(currentRevenue)}
            </p>
          </div>

          <div className="w-full max-w-[160px] aspect-square relative shrink-0 min-h-[160px] min-w-0">
            <ChartContainer 
              height="100%" 
              loading={loading}
              className="w-full h-full"
            >
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="75%"
                outerRadius="100%"
                barSize={14}
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <defs>
                  <linearGradient
                    id="colorRevenue"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: "#ecfdf5" }}
                  dataKey="value"
                  cornerRadius={30}
                  animationDuration={1500}
                  className="drop-shadow-[0_6px_12px_rgba(34,197,94,0.3)] opacity-100"
                />
              </RadialBarChart>
            </ChartContainer>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl leading-none font-black text-foreground dark:text-white tracking-tight">
                {percentage}%
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                Achieved
              </span>
            </div>
          </div>

          {/* Right Stat - Target */}
          <div className="flex flex-col items-end space-y-0.5 text-right z-10 relative min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Target
            </p>
            <p className="text-lg md:text-xl font-black text-foreground dark:text-white tracking-tight">
              {formatLargeNumber(targetRevenue)}
            </p>
          </div>
        </div>

        {hasTarget && targetRevenue > 0 && currentRevenue === 0 && (
          <p className="text-center text-xs text-muted-foreground mb-3 font-medium">
            Start closing deals to achieve your revenue goal.
          </p>
        )}

        <button 
          onClick={() => router.push("/reports")}
          className="mt-3 w-full py-3 bg-slate-950 dark:bg-muted text-white dark:text-slate-950 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all group/btn"
        >
          View Analytics
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </button>
      </CardContent>

      {/* Subtle background pattern */}
      <div className="absolute -bottom-6 -left-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none z-0">
        <CurrencyIcon className="w-64 h-64 text-emerald-500 stroke-[3]" />
      </div>
    </CRMCard>
  );
}
