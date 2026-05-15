"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { LayoutDashboard, Download, Filter, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { PageErrorState } from "@/shared/components/page-states";
import { useDashboardInitializer } from "@/shared/hooks/use-dashboard";
import { Button } from "@/shared/ui/button";
import { 
  CRMMetricCard,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/components/auth-provider";
import { MetricCardType } from "@/shared/types/common";

// Dynamic imports for heavy dashboard components
const SalesChart = dynamic(() => import("@/features/dashboard/components/SalesChart"), { ssr: false, loading: () => <div className="h-[350px] animate-pulse bg-muted/50 rounded-xl" /> });
const RevenueTracker = dynamic(() => import("@/features/dashboard/components/RevenueTracker"), { ssr: false, loading: () => <div className="h-[350px] animate-pulse bg-muted/50 rounded-xl" /> });
const TeamPerformance = dynamic(() => import("@/features/dashboard/components/TeamPerformance"), { ssr: false, loading: () => <div className="h-[350px] animate-pulse bg-muted/50 rounded-xl" /> });
const LeadFunnel = dynamic(() => import("@/features/dashboard/components/LeadFunnel"), { ssr: false, loading: () => <div className="h-[350px] animate-pulse bg-muted/50 rounded-xl" /> });

// Standard dynamic imports
const RecentActivities = dynamic(() => import("@/features/dashboard/components/RecentActivities"));
const UpcomingMeetings = dynamic(() => import("@/features/dashboard/components/UpcomingMeetings"));
const HotLeads = dynamic(() => import("@/features/dashboard/components/HotLeads"));
const AIInsights = dynamic(() => import("@/features/dashboard/components/AIInsights"));
const PendingFollowups = dynamic(() => import("@/features/dashboard/components/PendingFollowups"));
const CalendarWidget = dynamic(() => import("@/features/dashboard/components/CalendarWidget"));
import WelcomeBanner from "@/features/dashboard/components/WelcomeBanner";
import { DashboardWidgetWrapper } from "@/features/dashboard/components/DashboardWidgetWrapper";
import CreateNewMenu from "@/features/dashboard/components/CreateNewMenu";

const DashboardPage = () => {
  const { 
    queries, 
    isInitializing, 
    isAuthInitializing,
    isAuthenticated,
  } = useDashboardInitializer();

  const { 
    setLeads, 
    setTasks, 
    setPipelineItems,
    setCustomers,
    activeTimeframe, setActiveTimeframe 
  } = useCRMStore();

  const { access } = useAuth();

  // Optimized store synchronization - only update if data is actually present and different
  useEffect(() => {
    if (queries.leads.data?.leads) {
      setLeads(queries.leads.data.leads);
    }
  }, [queries.leads.data?.leads, setLeads]);

  useEffect(() => {
    if (queries.tasks.data?.tasks) {
      setTasks(queries.tasks.data.tasks);
    }
  }, [queries.tasks.data?.tasks, setTasks]);

  useEffect(() => {
    if (queries.pipeline.data?.items) {
      setPipelineItems(queries.pipeline.data.items);
    }
  }, [queries.pipeline.data?.items, setPipelineItems]);

  useEffect(() => {
    if (queries.customers.data?.customers) {
      setCustomers(queries.customers.data.customers);
    }
  }, [queries.customers.data?.customers, setCustomers]);

  const statsData = queries.dashboard.data?.stats;

  // CRITICAL STABILITY CHECK:
  // We show the global skeleton if:
  // 1. Auth is still initializing from localStorage.
  // 2. We are authenticated but we haven't even started fetching yet.
  if (isAuthInitializing || (isAuthenticated && isInitializing && !statsData && queries.dashboard.isLoading)) {
    return <DashboardSkeleton />;
  }

  const WIDGET_ID_MAP: Record<string, string> = {
    "Total Revenue": "revenue",
    "Active Deals": "activeDeals",
    "New Leads": "newLeads",
    "Win Rate": "winRate"
  };

  const handleExport = () => {
    toast.success("Preparing PDF export...", {
      description: "Your dashboard report will be ready in a moment.",
    });
    setTimeout(() => {
      toast.success("Export complete!", {
        description: "Dashboard_Report_May_2026.pdf has been downloaded.",
      });
    }, 2000);
  };

  const handleFilterClick = () => {
    toast.info("Global filters opened", {
      description: "You can now filter the entire dashboard by region or agent.",
    });
  };

  return (
    <CRMPageContainer>
      <div className="flex flex-col gap-8">
        <WelcomeBanner />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['today', 'week', 'month', 'year'] as const).map((t) => (
              <Button
                key={t}
                variant={activeTimeframe === t ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTimeframe(t)}
                className="capitalize h-8 px-4 rounded-full text-xs font-semibold tracking-wide shadow-sm transition-all"
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleFilterClick} className="rounded-full h-9 px-4 text-xs font-bold gap-2">
              <Filter className="w-3.5 h-3.5" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="rounded-full h-9 px-4 text-xs font-bold gap-2">
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <CreateNewMenu />
          </div>
        </div>
      </div>

      <CRMMetricsGrid>
        {statsData?.map((stat: MetricCardType, index: number) => {
          const Icon = stat.title === "Total Revenue" ? DollarSign :
                       stat.title === "Active Deals" ? Target :
                       stat.title === "New Leads" ? Users :
                       TrendingUp;
          
          const widgetId = WIDGET_ID_MAP[stat.title] || (stat as any).id || stat.title.toLowerCase().replace(" ", "");
          const hasAccess = access.dashboardWidgets.includes(widgetId);

          if (!hasAccess) return null;
          
          return (
            <CRMMetricCard 
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.positive ? "up" : "down"}
              icon={Icon}
              color={stat.color || "primary"}
              sparklineData={(stat as any).sparklineData}
              delay={0.1 * (index + 1)}
              loading={queries.dashboard.isLoading}
              isError={queries.dashboard.isError}
            />
          );
        }) || (
          // Fallback skeletons if data is not yet available and we are loading
          queries.dashboard.isLoading ? (
            [...Array(4)].map((_, i) => (
              <CRMMetricCard key={i} title="Loading..." value="---" loading={true} icon={TrendingUp} />
            ))
          ) : queries.dashboard.isError ? (
             <div className="col-span-full py-10 text-center border border-destructive/20 bg-destructive/5 rounded-xl">
               <p className="text-sm font-bold text-destructive">Failed to load dashboard metrics. <button onClick={() => queries.dashboard.refetch()} className="underline ml-2">Retry</button></p>
             </div>
          ) : (
            <div className="col-span-full py-10 text-center border border-dashed border-border rounded-xl">
              <p className="text-sm text-muted-foreground">No metric data available.</p>
            </div>
          )
        )}
      </CRMMetricsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <DashboardWidgetWrapper 
            id="salesChart" 
            title="Sales Chart"
            isLoading={queries.dashboard.isLoading}
            isError={queries.dashboard.isError}
            onRetry={() => queries.dashboard.refetch()}
            delay={0.5}
          >
            <SalesChart />
          </DashboardWidgetWrapper>

          <DashboardWidgetWrapper 
            id="upcomingMeetings" 
            title="Upcoming Meetings"
            isLoading={queries.meetings.isLoading}
            isError={queries.meetings.isError}
            onRetry={() => queries.meetings.refetch()}
            delay={0.6}
          >
            <UpcomingMeetings />
          </DashboardWidgetWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardWidgetWrapper 
              id="hotLeads" 
              title="Hot Leads"
              isLoading={queries.hotLeads.isLoading}
              isError={queries.hotLeads.isError}
              onRetry={() => queries.hotLeads.refetch()}
              delay={0.7}
            >
              <HotLeads />
            </DashboardWidgetWrapper>

            <DashboardWidgetWrapper 
              id="teamPerformance" 
              title="Team Performance"
              isLoading={queries.teamPerformance.isLoading}
              isError={queries.teamPerformance.isError}
              onRetry={() => queries.teamPerformance.refetch()}
              delay={0.8}
            >
              <TeamPerformance />
            </DashboardWidgetWrapper>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardWidgetWrapper 
              id="leadFunnel" 
              title="Lead Funnel"
              isLoading={queries.analytics.isLoading}
              isError={queries.analytics.isError}
              onRetry={() => queries.analytics.refetch()}
              delay={0.9}
            >
              <LeadFunnel />
            </DashboardWidgetWrapper>

            <DashboardWidgetWrapper 
              id="revenueTracker" 
              title="Revenue Tracker"
              isLoading={queries.analytics.isLoading}
              isError={queries.analytics.isError}
              onRetry={() => queries.analytics.refetch()}
              delay={1.0}
            >
              <RevenueTracker />
            </DashboardWidgetWrapper>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardWidgetWrapper 
              id="recentActivities" 
              title="Recent Activities"
              isLoading={queries.dashboard.isLoading}
              isError={queries.dashboard.isError}
              onRetry={() => queries.dashboard.refetch()}
              delay={1.1}
            >
              <RecentActivities />
            </DashboardWidgetWrapper>

            <DashboardWidgetWrapper 
              id="pendingFollowups" 
              title="Pending Tasks"
              isLoading={queries.tasks.isLoading}
              isError={queries.tasks.isError}
              onRetry={() => queries.tasks.refetch()}
              delay={1.2}
            >
              <PendingFollowups />
            </DashboardWidgetWrapper>
          </div>
        </div>

        <div className="flex flex-col gap-6 self-start w-full lg:sticky lg:top-24">
          <DashboardWidgetWrapper 
            id="aiInsights" 
            title="AI Insights"
            isLoading={queries.aiInsights.isLoading}
            isError={queries.aiInsights.isError}
            onRetry={() => queries.aiInsights.refetch()}
            delay={1.3}
          >
            <AIInsights />
          </DashboardWidgetWrapper>

          <DashboardWidgetWrapper 
            id="calendarWidget" 
            title="Calendar"
            delay={1.4}
          >
            <CalendarWidget />
          </DashboardWidgetWrapper>
        </div>
      </div>
    </CRMPageContainer>
  );
};

export default DashboardPage;
