"use client";

import React from "react";
import { motion } from "framer-motion";
import { CRMCard } from "@/components/shared/crm/CRMCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { Target, TrendingUp, ArrowUpRight, DollarSign, ChevronRight } from "lucide-react";

const data = [
  {
    name: "Revenue",
    value: 85,
    fill: "url(#colorRevenue)",
  },
];

export default function RevenueTracker() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="w-full h-full"
    >
      <CRMCard 
        accentSeed="Revenue Tracker"
        noPadding
        className="h-full bg-gradient-to-br from-card to-background/50 relative overflow-hidden group flex flex-col"
      >
        <CardHeader className="flex flex-row items-start justify-between z-10 relative pb-2 px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl dark:bg-emerald-500/10">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Revenue Target</CardTitle>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500">
                  +12.5%
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  vs last month
                </span>
              </div>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-muted-foreground transition-colors p-2 hover:bg-muted rounded-xl">
            <ChevronRight className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2 flex flex-col flex-1 relative z-10">
          <div className="flex-1 flex items-center justify-between w-full py-2">
            {/* Left Stat - Current */}
            <div className="flex flex-col items-start space-y-0.5 z-10 relative">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Current
              </p>
              <p className="text-lg md:text-xl font-black text-foreground dark:text-white tracking-tight">
                $85.2k
              </p>
            </div>

            <div className="w-full max-w-[160px] aspect-square relative shrink-0 min-h-[160px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="75%"
                    outerRadius="100%"
                    barSize={14}
                    data={data}
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
                </ResponsiveContainer>
              )}

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl leading-none font-black text-foreground dark:text-white tracking-tight">
                  85%
                </span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                  Achieved
                </span>
              </div>
            </div>

            {/* Right Stat - Target */}
            <div className="flex flex-col items-end space-y-0.5 text-right z-10 relative">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Target
              </p>
              <p className="text-lg md:text-xl font-black text-foreground dark:text-white tracking-tight">
                $100k
              </p>
            </div>
          </div>

          <button className="mt-3 w-full py-3 bg-slate-950 dark:bg-muted text-white dark:text-slate-950 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all group/btn">
            View Analytics
            <ArrowUpRight className="w-4 h-4 transition-transform" />
          </button>
        </CardContent>

        {/* Subtle background pattern */}
        <div className="absolute -bottom-6 -left-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none z-0">
          <DollarSign className="w-64 h-64 text-emerald-500 stroke-[3]" />
        </div>
      </CRMCard>
    </motion.div>
  );
}
