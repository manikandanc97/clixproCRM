"use client";

import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Download, RefreshCw, BarChart3, MoreHorizontal, Calendar, Award, Target, Activity } from "lucide-react";

import { CRMCard } from "@/shared/components/crm/CRMCard";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/shared/ui/dropdown-menu";

import { useRevenueGrowth } from "@/shared/hooks/use-dashboard";
import { ChartContainer } from "@/shared/components/charts/ChartContainer";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/crm-formatters";
import { Skeleton } from "@/shared/ui/skeleton";

const DATE_FILTERS = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "Last Month",
  "Quarter",
  "Year"
];

const SalesChart = () => {
  const [chartType, setChartType] = useState<"revenue" | "deals">("revenue");
  const [dateFilter, setDateFilter] = useState("Year");
  const { data: revenueData, isLoading, refetch, isFetching } = useRevenueGrowth(dateFilter);

  const handleRefresh = async () => {
    toast.info("Refreshing sales data...");
    await refetch();
    toast.success("Sales data updated successfully.");
  };

  const handleExport = () => {
    toast.success("Sales report exported", {
      description: `Format: PDF, Metric: ${chartType === 'revenue' ? 'Revenue' : 'Deals'}, Period: ${dateFilter}`,
    });
  };

  const currentColor = chartType === "revenue" ? "#10b981" : "#6366f1";
  
  const chartData = useMemo(() => {
    if (!revenueData?.monthlyRevenue) return [];
    return chartType === "revenue" 
      ? revenueData.monthlyRevenue 
      : revenueData.monthlyDeals;
  }, [revenueData, chartType]);

  const hasData = chartData.length > 0;

  const isPositiveGrowth = (revenueData?.growth || 0) >= 0;
  const GrowthIcon = isPositiveGrowth ? TrendingUp : TrendingDown;
  const growthColor = isPositiveGrowth ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10";

  return (
    <div className="min-w-0">
      <CRMCard animate={false} accentSeed="Sales Chart" noPadding className="overflow-visible bg-card min-w-0">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 px-6 pt-6 gap-4 min-w-0">
          <div className="space-y-4 min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-colors duration-500 ${
                chartType === 'revenue' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-indigo-500/10 text-indigo-500'
              }`}>
                {chartType === 'revenue' ? <TrendingUp className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <CardTitle>
                  {chartType === "revenue" ? "Revenue Growth" : "Deal Volume"}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
                  Monthly revenue performance across all sales channels
                </CardDescription>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl border-border/50 font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {dateFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time Period</DropdownMenuLabel>
                {DATE_FILTERS.map(filter => (
                  <DropdownMenuItem 
                    key={filter} 
                    onClick={() => setDateFilter(filter)}
                    className={`rounded-xl font-medium ${dateFilter === filter ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    {filter}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Segment Switch */}
            <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType("revenue")}
                className={`h-7 px-4 rounded-lg text-xs font-bold transition-all duration-300 ${
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
                className={`h-7 px-4 rounded-lg text-xs font-bold transition-all duration-300 ${
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
              className="rounded-xl h-9 w-9 transition-all duration-300 border-border/50"
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching ? "animate-spin" : ""}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-9 w-9 transition-all duration-300 hover:bg-muted"
                >
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                <DropdownMenuItem onClick={handleExport} className="rounded-xl gap-2 font-semibold">
                  <Download className="w-4 h-4" /> Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="min-w-0 pt-0 px-6 pb-6">
          <ChartContainer 
            height={280}
            loading={isLoading}
            hasData={hasData}
            className="w-full mt-4"
            emptyMessage="No revenue data available for the selected period."
          >
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--color-border)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontWeight: 600 }}
                dy={10}
                minTickGap={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontWeight: 600 }}
                tickFormatter={(value) => {
                  const num = Number(value) || 0;
                  if (chartType === "deals") return String(num);
                  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
                  if (num >= 1000) return `$${Math.round(num / 1000)}k`;
                  return `$${num}`;
                }}
                dx={-10}
              />
              <RechartsTooltip
                cursor={{
                  stroke: currentColor,
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const value = chartType === "revenue" ? data.value : data.deals;
                    
                    return (
                      <div className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 min-w-[160px]">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          {label}
                        </p>
                        
                        <div className="space-y-3">
                          {chartType === "revenue" ? (
                            <>
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                                <span className="text-sm font-bold text-emerald-500">{formatCurrency(data.value || 0, "USD")}</span>
                              </div>
                              {data.deals !== undefined && (
                                <div className="flex justify-between items-center gap-4">
                                  <span className="text-sm font-medium text-muted-foreground">Deals</span>
                                  <span className="text-sm font-bold text-foreground">{data.deals}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-sm font-medium text-muted-foreground">Deals</span>
                              <span className="text-sm font-bold text-indigo-500">{data.deals}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
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
                  stroke: "var(--color-background)", 
                  strokeWidth: 2.5,
                  className: "drop-shadow-md"
                }}
              />
            </AreaChart>
          </ChartContainer>

          {/* Compact Chart Footer for specific analytical stats */}
          {!isLoading && hasData && (
            <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-muted-foreground font-medium">Highest Revenue:</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(revenueData?.highestRevenue || 0, "USD").replace(".00", "")}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-muted-foreground font-medium">Average Monthly:</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(revenueData?.averageMonthlyRevenue || 0, "USD").replace(".00", "")}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-muted-foreground font-medium">Best Month:</span>
                  <span className="font-bold text-foreground">
                    {revenueData?.bestPerformingMonth || "N/A"}
                  </span>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${growthColor}`}>
                <GrowthIcon className="w-3.5 h-3.5" />
                <span>{Math.abs(revenueData?.growth || 0)}% Growth</span>
              </div>
            </div>
          )}
          {isLoading && (
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-6">
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-6 w-36 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
          )}
        </CardContent>
      </CRMCard>
    </div>
  );
};

export default SalesChart;
