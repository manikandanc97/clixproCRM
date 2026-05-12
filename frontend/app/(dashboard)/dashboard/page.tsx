"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { LayoutDashboard, Download, Filter, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { PageErrorState } from "@/shared/components/page-states";
import { useDashboardData } from "@/shared/hooks/use-dashboard";
import { fetchLeadsData, fetchTasksData, fetchPipelineData, fetchCustomersData } from "@/shared/lib/api/crm";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/components/PageHeader";
import { 
  CRMMetricCard,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/components/auth-provider";

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

const DashboardPage = () => {
  const { data, isLoading: loading, error, refetch } = useDashboardData();
  const { 
    leads, setLeads, 
    tasks, setTasks, 
    pipelineItems, setPipelineItems,
    customers, setCustomers,
    activeTimeframe, setActiveTimeframe 
  } = useCRMStore();
  const { access } = useAuth();

  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safePipelineItems = Array.isArray(pipelineItems) ? pipelineItems : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Initialize store with data if empty
  useEffect(() => {
    if (data) {
      if (safeLeads.length === 0) {
        fetchLeadsData().then((res) => setLeads(res.leads));
      }
      if (safeTasks.length === 0) {
        fetchTasksData().then((res) => setTasks(res.tasks));
      }
      if (safePipelineItems.length === 0) {
        fetchPipelineData().then((res) => setPipelineItems(res.items));
      }
      if (safeCustomers.length === 0) {
        fetchCustomersData().then((res) => setCustomers(res.customers));
      }
    }
  }, [data, safeLeads.length, safeTasks.length, safePipelineItems.length, safeCustomers.length, setLeads, setTasks, setPipelineItems, setCustomers]);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <PageErrorState
        title="Dashboard unavailable"
        message={(error as Error).message}
        onRetry={() => { refetch(); }}
      />
    );
  }

  const dashboardData = data;

  const sparklineData = [
    { value: 40 }, { value: 30 }, { value: 60 }, { value: 80 }, { value: 50 }, { value: 90 }, { value: 100 }
  ];
  const widgets = new Set(access.dashboardWidgets);

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
      <PageHeader 
        title="Command Center"
        subtitle="Welcome back, Agent. Here's what's happening across your sales intelligence landscape today."
        icon={LayoutDashboard}
        badge="System Overview"
        actions={[
          {
            label: "Filters",
            icon: Filter,
            onClick: handleFilterClick,
            variant: "outline"
          },
          {
            label: "Export PDF",
            icon: Download,
            onClick: handleExport,
            variant: "default"
          }
        ]}
      />

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

      <CRMMetricsGrid>
        {data?.stats?.map((stat: any, index: number) => {
          const Icon = stat.title === "Total Revenue" ? DollarSign :
                       stat.title === "Active Deals" ? Target :
                       stat.title === "New Leads" ? Users :
                       TrendingUp;
          
          return widgets.has(stat.id || stat.title.toLowerCase().replace(" ", "")) && (
            <CRMMetricCard 
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.positive ? "up" : "down"}
              icon={Icon}
              color={stat.color || "primary"}
              sparklineData={stat.sparklineData || sparklineData}
              delay={0.1 * (index + 1)}
              loading={loading}
            />
          );
        })}
      </CRMMetricsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          {widgets.has("salesChart") && <SalesChart data={data?.salesChartData || []} />}
          {widgets.has("upcomingMeetings") && <UpcomingMeetings />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {widgets.has("hotLeads") && <HotLeads />}
            {widgets.has("teamPerformance") && <TeamPerformance />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {widgets.has("leadFunnel") && <LeadFunnel />}
            {widgets.has("revenueTracker") && <RevenueTracker />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {widgets.has("recentActivities") && <RecentActivities activities={data?.recentActivities || []} />}
            {widgets.has("pendingFollowups") && <PendingFollowups />}
          </div>
        </div>

        <div className="flex flex-col gap-6 self-start w-full lg:sticky lg:top-24">
          {widgets.has("aiInsights") && <AIInsights />}
          {widgets.has("calendarWidget") && <CalendarWidget />}
        </div>
      </div>
    </CRMPageContainer>
  );
};

export default DashboardPage;

