"use client";

import React from "react";
import { 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
} from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { CRM_ROLES } from "@/shared/lib/auth/rbac/roles";
import { CRMMetricCard, CRMMetricsGrid } from "@/shared/components/crm";
import { useDashboardInitializer } from "@/shared/hooks/use-dashboard";
import { useCurrency } from "@/shared/hooks/use-currency";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

export default function DashboardKPIs() {
  const { access, user } = useAuth();
  const { queries } = useDashboardInitializer();
  const { formatCurrency } = useCurrency();

  // Extract query data safely
  const dashboardData = queries.dashboard.data;
  const leadsData = queries.leads.data;
  const pipelineData = queries.pipeline.data;

  // Retrieve metrics returned by the dashboard API
  const dashboardStats = dashboardData?.stats || [];
  const dashboardRevenue = dashboardStats.find(s => s.title === "Revenue");
  const dashboardLeads = dashboardStats.find(s => s.title === "Total Leads");
  
  // Retrieve metrics returned by the pipeline API
  const pipelineActiveDeals = pipelineData?.stats?.find(s => s.title === "Active Deals");
  const pipelineWinRate = pipelineData?.stats?.find(s => s.title === "Win Rate");

  // Helper to check if a card's underlying query has errored
  const hasError = (query: { isError?: boolean } | null | undefined) => query?.isError;

  // Streamlined 4 Core Premium KPI Cards System
  const kpiConfigs = [
    {
      id: "revenue",
      title: "Revenue",
      getValue: () => {
        if (hasError(queries.dashboard)) return "Error";
        return formatCurrency(dashboardRevenue?.valueAmount || 0);
      },
      getChange: () => dashboardRevenue?.change || "+0.0%",
      getTrend: () => {
        if (!dashboardRevenue) return "neutral" as const;
        return dashboardRevenue.positive ? ("up" as const) : ("down" as const);
      },
      icon: DollarSign,
      color: "emerald" as const,
      loading: queries.dashboard.isLoading,
      sparklineData: dashboardRevenue?.sparklineData,
      comparisonText: "vs last month",
      href: "/analytics",
      tooltip: "Total recognized revenue generated across all closed deals.",
    },
    {
      id: "newLeads",
      title: "Total Leads",
      getValue: () => {
        if (hasError(queries.dashboard) && hasError(queries.leads)) return "Error";
        return dashboardLeads?.value || leadsData?.summary?.total?.toLocaleString("en-US") || "0";
      },
      getChange: () => dashboardLeads?.change || "+0.0%",
      getTrend: () => {
        if (!dashboardLeads) return "neutral" as const;
        return dashboardLeads.positive ? ("up" as const) : ("down" as const);
      },
      icon: Users,
      color: "indigo" as const,
      loading: queries.dashboard.isLoading || queries.leads.isLoading,
      sparklineData: dashboardLeads?.sparklineData || [],
      comparisonText: "vs last week",
      href: "/leads",
      tooltip: "Total number of leads accumulated.",
    },
    {
      id: "activeDeals",
      title: "Active Deals",
      getValue: () => {
        if (hasError(queries.pipeline) && hasError(queries.leads)) return "Error";
        return pipelineActiveDeals?.value || "0 Deals";
      },
      getChange: () => (pipelineActiveDeals as any)?.change || "+0.0%",
      getTrend: () => {
        if (!pipelineActiveDeals) return "neutral" as const;
        return (pipelineActiveDeals as any).positive ? ("up" as const) : ("down" as const);
      },
      icon: Target,
      color: "cyan" as const,
      loading: queries.pipeline.isLoading || queries.leads.isLoading,
      sparklineData: (pipelineActiveDeals as any)?.sparklineData || [],
      comparisonText: "vs last week",
      href: "/pipeline",
      tooltip: "Number of active deals currently in the pipeline.",
    },
    {
      id: "winRate",
      title: "Conversion Rate",
      getValue: () => {
        if (hasError(queries.pipeline) && hasError(queries.leads)) return "Error";
        return pipelineWinRate?.value || "0%";
      },
      getChange: () => (pipelineWinRate as any)?.change || "+0.0%",
      getTrend: () => {
        if (!pipelineWinRate) return "neutral" as const;
        return (pipelineWinRate as any).positive ? ("up" as const) : ("down" as const);
      },
      icon: TrendingUp,
      color: "violet" as const,
      loading: queries.pipeline.isLoading || queries.leads.isLoading,
      sparklineData: (pipelineWinRate as any)?.sparklineData || [],
      comparisonText: "vs last week",
      href: "/analytics",
      tooltip: "Percentage of leads successfully converted to closed deals.",
    },
  ];

  // RBAC & KPI Layout Protection: Limit to the 4 primary cards while honoring user allowed dashboardWidgets
  // Admin role ALWAYS bypasses widget permission checks
  const TOP_KPI_IDS = ["revenue", "newLeads", "activeDeals", "winRate"];
  const accessibleKpis = kpiConfigs
    .filter(kpi => TOP_KPI_IDS.includes(kpi.id))
    .filter(kpi => access.roleName === "Admin" || user?.role === CRM_ROLES.ADMIN || access.dashboardWidgets.includes(kpi.id));

  // Handle empty state gracefully if no metrics are allowed for the role
  if (accessibleKpis.length === 0) {
    return (
      <div className="py-10 text-center border border-dashed border-border rounded-2xl bg-card">
        <p className="text-sm text-muted-foreground font-medium">No dashboard metrics authorized for your account role.</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <CRMMetricsGrid>
        {accessibleKpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Tooltip key={kpi.title}>
              <TooltipTrigger asChild>
                <Link href={kpi.href} className="block group">
                  <CRMMetricCard
                    title={kpi.title}
                    value={kpi.getValue()}
                    change={kpi.getChange()}
                    trend={kpi.getTrend()}
                    icon={Icon}
                    color={kpi.color}
                    sparklineData={kpi.sparklineData}
                    delay={0.08 * (index + 1)}
                    loading={kpi.loading}
                    comparisonText={kpi.comparisonText}
                    className="group-hover:ring-2 ring-primary/20 transition-all"
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-slate-950 text-white border-white/10 rounded-xl px-3 py-2 max-w-[200px] text-center shadow-2xl">
                {kpi.tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </CRMMetricsGrid>
    </TooltipProvider>
  );
}
