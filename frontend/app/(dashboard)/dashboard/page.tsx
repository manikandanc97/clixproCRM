"use client";

import React, { useEffect } from "react";
import { LayoutDashboard, Download, Filter, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import RecentActivities from "@/components/dashboard/RecentActivities";
import SalesChart from "@/components/dashboard/SalesChart";
import UpcomingMeetings from "@/components/dashboard/UpcomingMeetings";
import HotLeads from "@/components/dashboard/HotLeads";
import AIInsights from "@/components/dashboard/AIInsights";
import PendingFollowups from "@/components/dashboard/PendingFollowups";
import TeamPerformance from "@/components/dashboard/TeamPerformance";
import LeadFunnel from "@/components/dashboard/LeadFunnel";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import RevenueTracker from "@/components/dashboard/RevenueTracker";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { PageErrorState } from "@/components/shared/page-states";
import { useDashboardData } from "@/hooks/use-dashboard";
import { fetchLeadsData, fetchTasksData, fetchPipelineData, fetchCustomersData } from "@/lib/api/crm";
import { Button } from "@/components/ui/button";
import { 
  CRMPageHeader, 
  CRMMetricCard,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/components/shared/crm";
import { useCRMStore } from "@/store/useCRMStore";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";

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
        onRetry={() => refetch()}
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
      <CRMPageHeader 
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
            className="capitalize h-8 px-4 rounded-full text-xs font-semibold tracking-wide"
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
