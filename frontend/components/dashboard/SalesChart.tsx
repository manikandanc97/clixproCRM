"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MoreHorizontal } from "lucide-react";
import { SalesChartPointType } from "@/types/dashboard";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SalesChartProps {
  data: SalesChartPointType[];
}

const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card className="overflow-visible border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-bold tracking-tight">Sales Overview</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Monthly performance tracking across all revenue streams
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl transition-all duration-300 hover:bg-muted"
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </Button>
        </CardHeader>

        <CardContent>
          <div className="h-[350px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--color-border)"
                  strokeOpacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontWeight: 800 }}
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip
                  cursor={{
                    stroke: "#10b981",
                    strokeWidth: 2,
                    strokeDasharray: "6 6",
                  }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    padding: "16px 20px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    backdropFilter: "blur(12px)",
                    color: "white",
                  }}
                  itemStyle={{
                    color: "#10b981",
                    fontWeight: 900,
                    fontSize: "16px",
                  }}
                  labelStyle={{
                    color: "rgba(255, 255, 255, 0.5)",
                    fontWeight: 800,
                    fontSize: "10px",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                  activeDot={{ 
                    r: 6, 
                    fill: "#10b981", 
                    stroke: "white", 
                    strokeWidth: 2.5,
                    className: "shadow-xl pulse-dot"
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SalesChart;
