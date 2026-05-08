"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { Target, TrendingUp, ArrowUpRight, DollarSign } from "lucide-react";

const data = [
  {
    name: "Revenue",
    value: 85,
    fill: "url(#colorRevenue)",
  },
];

export default function RevenueTracker() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="w-full h-full"
    >
      <Card className="h-full border-none shadow-premium bg-gradient-to-br from-card to-background/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 z-10">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm border border-primary/20 group-hover:scale-110 transition-transform duration-500">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <CardContent className="p-7 flex flex-col h-full relative z-10">
          <div className="flex flex-col mb-5">
            <h3 className="font-bold text-foreground text-xl tracking-tight">
              Revenue Target
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-success flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +12.5%
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                vs last month
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full aspect-square max-h-[190px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="75%"
                  outerRadius="100%"
                  barSize={20}
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
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="100%" stopColor="oklch(0.6 0.18 160)" />
                    </linearGradient>
                  </defs>
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: "var(--color-muted)" }}
                    dataKey="value"
                    cornerRadius={30}
                    animationDuration={1500}
                    className="drop-shadow-[0_4px_10px_var(--color-primary)] opacity-40"
                  />
                </RadialBarChart>
              </ResponsiveContainer>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-foreground tracking-tighter">
                  85%
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                  Achieved
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Current
              </p>
              <p className="text-lg font-bold text-foreground tracking-tight">
                $85,240
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Target
              </p>
              <p className="text-lg font-bold text-foreground tracking-tight">
                $100,000
              </p>
            </div>
          </div>

          <button className="mt-4 w-full py-3 bg-foreground text-background rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 group/btn">
            View Analytics
            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </CardContent>

        {/* Subtle background pattern */}
        <div className="absolute -bottom-12 -left-12 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none z-0">
          <DollarSign className="w-56 h-56 text-primary" />
        </div>
      </Card>
    </motion.div>
  );
}
