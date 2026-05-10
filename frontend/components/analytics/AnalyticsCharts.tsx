"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CalendarDays,
  Filter,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Zap,
} from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CRMCard, CRMCardHeader } from "../shared/crm";
import { Skeleton } from "@/components/ui/skeleton";

import { ChartContainer } from "../shared/charts/ChartContainer";

const PIPELINE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"];
const axisTickStyle = { fill: "#94a3b8", fontSize: 11, fontWeight: 500 };
const gridStyle = "3 3";
const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--card))",
  boxShadow: "0 14px 24px rgba(15,23,42,0.12)",
};

export const RevenueOverviewChart = ({ data, loading }: { data?: any[], loading?: boolean }) => {
  const mounted = useMounted();
  const latest = data?.[data.length - 1] || { revenue: 0, target: 0 };
  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <CRMCard className="h-[420px]" noPadding accentSeed="revenue">
      <CRMCardHeader
        title="Revenue Overview"
        subtitle={
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">{formatCurrency(latest.revenue)}</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              +14%
            </span>
          </div>
        }
        icon={TrendingUp}
        iconBg="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
        iconColor="text-emerald-600 dark:text-emerald-400"
        actions={
          <div className="flex gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="text-muted-foreground">Target</span>
            </div>
          </div>
        }
      />
      <CardContent className="px-6 pb-6 pt-0 min-w-0">
        <ChartContainer 
          height={280} 
          loading={loading}
          hasData={data && data.length > 0}
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray={gridStyle} vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={axisTickStyle}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={axisTickStyle}
              tickFormatter={(value) => `$${value >= 1000 ? value/1000 + 'k' : value}`}
            />
            <RechartsTooltip
              cursor={false}
              content={(props) => <ChartTooltipContent {...props} valuePrefix="$" />}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRev)"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </CRMCard>
  );
};

export const LeadsGrowthChart = ({ data, loading }: { data?: any[], loading?: boolean }) => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[420px]" noPadding accentSeed="leads">
      <CRMCardHeader
        title="Leads Growth"
        subtitle="Weekly sources distribution"
        icon={BarChart3}
        iconBg="bg-gradient-to-br from-blue-500/20 to-blue-500/5"
        iconColor="text-blue-600 dark:text-blue-400"
        actions={
          <Badge variant="outline" className="border-border/70 bg-background text-[10px] font-medium">
            Last 30 days
          </Badge>
        }
      />
      <CardContent className="px-6 pb-6 pt-0 min-w-0">
        <ChartContainer 
          height={280} 
          loading={loading}
          hasData={data && data.length > 0}
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray={gridStyle} vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={axisTickStyle}
            />
            <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
            <RechartsTooltip
              cursor={false}
              content={(props) => <ChartTooltipContent {...props} />}
            />
            <Legend wrapperStyle={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }} />
            <Bar dataKey="direct" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
            <Bar dataKey="social" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="referral" stackId="a" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </CRMCard>
  );
};

export const PipelineOverviewChart = ({ data, loading }: { data?: any[], loading?: boolean }) => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[420px]" noPadding accentSeed="pipeline">
      <CRMCardHeader
        title="Sales Pipeline"
        subtitle="Stage distribution funnel"
        icon={Filter}
        iconBg="bg-gradient-to-br from-violet-500/20 to-violet-500/5"
        iconColor="text-violet-600 dark:text-violet-400"
        actions={
          <Badge className="border border-violet-500/20 bg-violet-500/10 text-[10px] font-semibold text-violet-700">
            Live Data
          </Badge>
        }
      />
      <CardContent className="px-6 pb-6 pt-0 min-w-0">
        <ChartContainer 
          height={280} 
          loading={loading}
          hasData={data && data.length > 0}
        >
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={96}
              paddingAngle={3}
              dataKey="count"
              nameKey="stage"
            >
              {data?.map((entry: any, index: number) => (
                <Cell key={`cell-${entry.stage}`} fill={PIPELINE_COLORS[index % PIPELINE_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip content={(props) => <ChartTooltipContent {...props} />} />
            <Legend
              verticalAlign="bottom"
              height={42}
              wrapperStyle={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </CRMCard>
  );
};

export const CustomerGrowthChart = ({ data, loading }: { data?: any[], loading?: boolean }) => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[420px]" noPadding accentSeed="customers">
      <CRMCardHeader
        title="Customer Growth"
        subtitle="Retention & churn analysis"
        icon={UserPlus}
        iconBg="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5"
        iconColor="text-cyan-600 dark:text-cyan-400"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>New</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Churned</span>
            </div>
          </div>
        }
      />
      <CardContent className="px-6 pb-6 pt-0 min-w-0">
        <ChartContainer 
          height={280} 
          loading={loading}
          hasData={data && data.length > 0}
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray={gridStyle} vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={axisTickStyle}
            />
            <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
            <RechartsTooltip content={(props) => <ChartTooltipContent {...props} />} />
            <Line
              type="monotone"
              dataKey="new"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="churned"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </CRMCard>
  );
};

export const MonthlyPerformanceChart = ({ data, loading }: { data?: any[], loading?: boolean }) => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[420px]" noPadding accentSeed="monthly">
      <CRMCardHeader
        title="Monthly Performance"
        subtitle="Total deals vs targets"
        icon={CalendarDays}
        iconBg="bg-gradient-to-br from-rose-500/20 to-rose-500/5"
        iconColor="text-rose-600 dark:text-rose-400"
        actions={
          <Badge variant="outline" className="border-border/70 bg-background text-[10px] font-medium">
            Last 6 months
          </Badge>
        }
      />
      <CardContent className="px-6 pb-6 pt-0 min-w-0">
        <ChartContainer 
          height={280} 
          loading={loading}
          hasData={data && data.length > 0}
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray={gridStyle} vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={axisTickStyle}
            />
            <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
            <RechartsTooltip
              cursor={false}
              content={(props) => <ChartTooltipContent {...props} valuePrefix="$" />}
            />
            <Bar dataKey="revenue" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </CRMCard>
  );
};

export const ConversionAnalyticsChart = ({ data, loading }: { data?: any, loading?: boolean }) => {
  return (
    <CRMCard className="h-[420px]" noPadding accentSeed="conversion">
      <CRMCardHeader
        title="Conversion Analytics"
        subtitle="Lead to customer conversion rate"
        icon={Target}
        iconBg="bg-gradient-to-br from-pink-500/20 to-pink-500/5"
        iconColor="text-pink-600 dark:text-pink-400"
        actions={
          <div className="flex items-center gap-1.5 rounded-md bg-pink-500/10 px-2 py-1 text-[10px] font-semibold text-pink-700">
            <Zap className="h-3 w-3" />
            High Performance
          </div>
        }
      />
      <CardContent className="px-6 pb-6 pt-0">
        <div className="flex h-[280px] min-h-[280px] w-full items-center justify-center">
          {loading ? <ChartSkeleton /> : (
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex size-32 items-center justify-center rounded-full border-8 border-pink-500/15 border-t-pink-500">
                <span className="text-3xl font-bold text-foreground">{data?.averageRate || "24.5"}%</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Average conversion rate</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <MetricPill label="Qualified" value={data?.qualified || "0"} />
                <MetricPill label="Won" value={data?.won || "0"} />
                <MetricPill label="Target" value={data?.target || "15%"} />
              </div>
              <Button variant="outline" size="sm" className="mt-4 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                View breakdown
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

const MetricPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-center">
    <p className="text-base font-semibold text-foreground">{value}</p>
    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
  </div>
);

