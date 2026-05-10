"use client";

import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MoreHorizontal, RefreshCw, Download, Filter, TrendingUp, BarChart3 } from "lucide-react";
import { SalesChartPointType } from "@/types/dashboard";

import { CRMCard } from "@/components/shared/crm/CRMCard";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SalesChartProps {
  data: SalesChartPointType[];
}

import { ChartContainer } from "../shared/charts/ChartContainer";

const SalesChart = ({ data }: SalesChartProps) => {
  const [chartType, setChartType] = useState<"revenue" | "deals">("revenue");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info("Refreshing sales data...");
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Sales data updated successfully.");
    }, 1500);
  };

  const handleExport = () => {
    toast.success("Sales report exported", {
      description: `Format: PDF, Metric: ${chartType === 'revenue' ? 'Revenue' : 'Deals'}`,
    });
  };

  // Simulate deal count data based on revenue
  const chartData = useMemo(
    () =>
      data.map((point, index) => ({
        ...point,
        deals: Math.round(point.value / 5000) + ((index * 3) % 5),
      })),
    [data]
  );

  const currentColor = chartType === "revenue" ? "#10b981" : "#6366f1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="min-w-0"
    >
      <CRMCard accentSeed="Sales Chart" noPadding className="overflow-visible bg-card min-w-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6 min-w-0">
          <div className="space-y-4 min-w-0">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-colors duration-500 ${
                chartType === 'revenue' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-indigo-500/10 text-indigo-500'
              }`}>
                {chartType === 'revenue' ? <TrendingUp className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl font-bold tracking-tight truncate">
                  {chartType === "revenue" ? "Revenue Growth" : "Deal Volume"}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
                  {chartType === "revenue" 
                    ? "Monthly revenue performance tracking across all channels"
                    : "Volume of active and closed deals over the past 12 months"
                  }
                </CardDescription>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-muted/50 p-1 rounded-xl hidden sm:flex items-center gap-1 border border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType("revenue")}
                className={`h-8 px-4 rounded-lg text-xs font-bold transition-all duration-300 ${
                  chartType === "revenue" 
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
              >
                Revenue
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType("deals")}
                className={`h-8 px-4 rounded-lg text-xs font-bold transition-all duration-300 ${
                  chartType === "deals" 
                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
              >
                Deals
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className="rounded-xl h-10 w-10 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-10 w-10 transition-all duration-300 hover:bg-muted"
                >
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                <DropdownMenuItem onClick={handleExport} className="rounded-xl gap-2 font-semibold">
                  <Download className="w-4 h-4" /> Export Data
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl gap-2 font-semibold">
                  <Filter className="w-4 h-4" /> Advanced Filter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl gap-2 font-semibold text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-500/10 dark:focus:text-rose-400">
                  Reset View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="min-w-0">
          <ChartContainer 
            height={300}
            hasData={chartData && chartData.length > 0}
            className="mt-3"
          >
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={currentColor} stopOpacity={0} />
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
                tickFormatter={(value) => chartType === "revenue" ? `$${value/1000}k` : value}
              />
              <Tooltip
                cursor={{
                  stroke: currentColor,
                  strokeWidth: 2,
                  strokeDasharray: "6 6",
                }}
                contentStyle={{
                  borderRadius: "20px",
                  border: `1px solid ${currentColor}33`,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  padding: "16px 20px",
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  backdropFilter: "blur(12px)",
                  color: "white",
                }}
                itemStyle={{
                  color: currentColor,
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
                formatter={(value) => {
                  const numericValue = Number(value ?? 0);
                  return [
                    chartType === "revenue" ? `$${numericValue.toLocaleString()}` : numericValue,
                    chartType === "revenue" ? "Revenue" : "Deals"
                  ];
                }}
              />
              <Area
                type="monotone"
                dataKey={chartType === "revenue" ? "value" : "deals"}
                stroke={currentColor}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
                animationDuration={1500}
                animationEasing="ease-in-out"
                activeDot={{ 
                  r: 6, 
                  fill: currentColor, 
                  stroke: "white", 
                  strokeWidth: 2.5,
                  className: "shadow-elevated"
                }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </CRMCard>
    </motion.div>
  );
};

export default SalesChart;
