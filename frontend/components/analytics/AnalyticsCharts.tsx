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
import { ANALYTICS_DATA } from "@/data/analytics-mock";
import { CRMCard, CRMCardHeader } from "../shared/crm";

const PIPELINE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"];
const axisTickStyle = { fill: "#94a3b8", fontSize: 11, fontWeight: 500 };
const gridStyle = "3 3";
const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--card))",
  boxShadow: "0 14px 24px rgba(15,23,42,0.12)",
};

const ChartTooltipContent = ({
  active,
  payload,
  label,
  valuePrefix = "",
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[160px] rounded-xl border border-border bg-popover px-3 py-2.5 shadow-premium">
      {label && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={`${entry.name ?? "item"}-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs text-foreground/90">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? "#94a3b8" }} />
              {entry.name ?? "Value"}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {valuePrefix}
              {entry.value ?? 0}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const useMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};

export const RevenueOverviewChart = () => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[420px]" noPadding accentSeed="revenue">
      <CRMCardHeader
        title="Revenue Overview"
        subtitle={
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">$428,500</span>
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
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[280px] w-full min-h-[280px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_DATA.revenueOverview}>
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
                  tickFormatter={(value) => `$${value/1000}k`}
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
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const LeadsGrowthChart = () => {
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
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[280px] w-full min-h-[280px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.leadsGrowth}>
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
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const PipelineOverviewChart = () => {
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
      <CardContent className="px-6 pb-6 pt-0">
        <div className="flex h-[280px] w-full min-h-[280px] items-center justify-center">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ANALYTICS_DATA.pipelineStages}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={96}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="stage"
                >
                  {ANALYTICS_DATA.pipelineStages.map((entry, index) => (
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
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const CustomerGrowthChart = () => {
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
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[280px] w-full min-h-[280px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ANALYTICS_DATA.customerGrowth}>
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
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const MonthlyPerformanceChart = () => {
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
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[280px] w-full min-h-[280px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.revenueOverview}>
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
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const ConversionAnalyticsChart = () => {
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
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex size-32 items-center justify-center rounded-full border-8 border-pink-500/15 border-t-pink-500">
              <span className="text-3xl font-bold text-foreground">24.5%</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Average conversion rate</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <MetricPill label="Qualified" value="1.2k" />
              <MetricPill label="Won" value="312" />
              <MetricPill label="Target" value="15%" />
            </div>
            <Button variant="outline" size="sm" className="mt-4 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              View breakdown
            </Button>
          </div>
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

