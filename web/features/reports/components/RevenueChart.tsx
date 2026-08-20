"use client";

import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { RevenueChartPointType } from "@/shared/types/report";
import { motion } from "framer-motion";

import { ChartContainer } from "@/shared/components/charts/ChartContainer";
import { useCurrency } from "@/shared/hooks/use-currency";
import { useRouter } from "next/navigation";

interface RevenueChartProps {
  data: RevenueChartPointType[];
  loading?: boolean;
}

const RevenueChart = ({ data, loading }: RevenueChartProps) => {
  const { formatCurrency, currencySymbol } = useCurrency();
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="min-w-0 h-full flex flex-col"
    >
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden group min-w-0 h-full flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl shadow-sm border border-blue-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="font-bold text-foreground tracking-tight">Revenue Analysis</CardTitle>
                <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5%
                </div>
              </div>
              <CardDescription className="text-muted-foreground text-sm mt-1">Monthly revenue trends from live CRM data</CardDescription>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.push("/reports")} className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 rounded-xl px-4 h-9">View All</Button>
        </CardHeader>

        <CardContent className="p-8 pt-0 min-w-0 flex-1 flex flex-col">
          <ChartContainer 
            height="100%" 
            loading={loading}
            hasData={Boolean(data && data.some((d) => (d.total || 0) > 0))}
            emptyMessage="No revenue recorded for this period"
            className="mt-4 flex-1"
          >
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                tickFormatter={(value) => `${currencySymbol}${value/1000}k`}
              />
              <Tooltip 
                cursor={{ 
                  stroke: '#3b82f6', 
                  strokeWidth: 2, 
                  strokeDasharray: '6 6' 
                }} 
                contentStyle={{
                  borderRadius: "20px",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  padding: "16px 20px",
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  backdropFilter: "blur(12px)",
                  color: "white",
                }}
                itemStyle={{
                  color: "#3b82f6",
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
                formatter={(value) => [formatCurrency(value as number), "Revenue"]}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                animationDuration={2000}
                animationBegin={500}
                activeDot={{ 
                  r: 6, 
                  fill: "#3b82f6", 
                  stroke: "white", 
                  strokeWidth: 2.5,
                  className: "shadow-elevated pulse-dot"
                }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(RevenueChart);
