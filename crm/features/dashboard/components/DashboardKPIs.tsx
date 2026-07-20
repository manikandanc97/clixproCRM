"use client";

import React from "react";
import { 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
} from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { CRMMetricCard, CRMMetricsGrid } from "@/shared/components/crm";
import { useDashboardInitializer } from "@/shared/hooks/use-dashboard";

export default function DashboardKPIs() {
  const { access } = useAuth();
  const { queries } = useDashboardInitializer();

  // Extract query data safely
  const dashboardData = queries.dashboard.data;
  const leadsData = queries.leads.data;
  const pipelineData = queries.pipeline.data;

  // Retrieve metrics returned by the dashboard API
  const dashboardStats = dashboardData?.stats || [];
  const dashboardRevenue = dashboardStats.find(s => s.title === "Revenue");
  const dashboardLeads = dashboardStats.find(s => s.title === "Total Leads");

  // Helper to check if a card's underlying query has errored
  const hasError = (query: { isError?: boolean } | null | undefined) => query?.isError;

  // Streamlined 4 Core Premium KPI Cards System
  const kpiConfigs = [
    {
      id: "revenue",
      title: "Revenue",
      getValue: () => {
        if (hasError(queries.dashboard)) return "Error";
        return dashboardRevenue?.value || "$0";
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
      sparklineData: dashboardLeads?.sparklineData || [{ value: 780 }, { value: 800 }, { value: 820 }, { value: 810 }, { value: 830 }, { value: 840 }, { value: 842 }],
      comparisonText: "vs last week",
    },
    {
      id: "activeDeals",
      title: "Active Deals",
      getValue: () => {
        if (hasError(queries.pipeline) && hasError(queries.leads)) return "Error";
        const pipelineActive = pipelineData?.stats?.find(s => s.title === "Active Deals")?.value;
        if (pipelineActive) return pipelineActive;
        const fallbackCount = leadsData?.leads?.filter(l => !["Won", "Lost", "WON", "LOST"].includes(l.status)).length;
        return fallbackCount != null ? fallbackCount.toLocaleString("en-US") : "0";
      },
      getChange: () => "+4.8%",
      getTrend: () => "up" as const,
      icon: Target,
      color: "cyan" as const,
      loading: queries.pipeline.isLoading || queries.leads.isLoading,
      sparklineData: [{ value: 30 }, { value: 35 }, { value: 32 }, { value: 38 }, { value: 42 }, { value: 40 }, { value: 45 }],
      comparisonText: "vs last week",
    },
    {
      id: "winRate",
      title: "Conversion Rate",
      getValue: () => {
        if (hasError(queries.pipeline) && hasError(queries.leads)) return "Error";
        const pipelineRate = pipelineData?.stats?.find(s => s.title === "Win Rate")?.value;
        if (pipelineRate) return pipelineRate;
        
        const total = leadsData?.leads?.length || 0;
        const won = leadsData?.leads?.filter(l => ["Won", "WON"].includes(l.status)).length || 0;
        return total ? `${Math.round((won / total) * 100)}%` : "0%";
      },
      getChange: () => "+1.5%",
      getTrend: () => "up" as const,
      icon: TrendingUp,
      color: "violet" as const,
      loading: queries.pipeline.isLoading || queries.leads.isLoading,
      sparklineData: [{ value: 12 }, { value: 14 }, { value: 15 }, { value: 13 }, { value: 16 }, { value: 18 }, { value: 17 }],
      comparisonText: "vs last week",
    },
  ];

  // RBAC & KPI Layout Protection: Limit to the 4 primary cards while honoring user allowed dashboardWidgets
  const TOP_KPI_IDS = ["revenue", "newLeads", "activeDeals", "winRate"];
  const accessibleKpis = kpiConfigs
    .filter(kpi => TOP_KPI_IDS.includes(kpi.id))
    .filter(kpi => access.dashboardWidgets.includes(kpi.id));

  // Handle empty state gracefully if no metrics are allowed for the role
  if (accessibleKpis.length === 0) {
    return (
      <div className="py-10 text-center border border-dashed border-border rounded-2xl bg-card">
        <p className="text-sm text-muted-foreground font-medium">No dashboard metrics authorized for your account role.</p>
      </div>
    );
  }

  return (
    <CRMMetricsGrid>
      {accessibleKpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <CRMMetricCard
            key={kpi.title}
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
          />
        );
      })}
    </CRMMetricsGrid>
  );
}
