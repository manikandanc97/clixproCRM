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
import { useApiResource } from "@/hooks/use-api-resource";
import { fetchDashboardData, fetchLeadsData, fetchTasksData, fetchPipelineData, fetchCustomersData } from "@/lib/api/crm";
import { Button } from "@/components/ui/button";
import { 
  CRMPageHeader, 
  CRMMetricCard,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/components/shared/crm";
import { useCRMStore } from "@/store/useCRMStore";
import { toast } from "sonner";

const DashboardPage = () => {
  const { data, loading, error, refetch } = useApiResource(fetchDashboardData);
  const { 
    leads, setLeads, 
    tasks, setTasks, 
    pipelineItems, setPipelineItems,
    customers, setCustomers,
    activeTimeframe, setActiveTimeframe 
  } = useCRMStore();

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
        message={error}
        onRetry={refetch}
      />
    );
  }

  const sparklineData = [
    { value: 40 }, { value: 30 }, { value: 60 }, { value: 80 }, { value: 50 }, { value: 90 }, { value: 100 }
  ];

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
        <CRMMetricCard 
          title="Total Revenue"
          value={activeTimeframe === 'today' ? "$4,200" : activeTimeframe === 'week' ? "$28,400" : "$124,500"}
          change="+15.2%"
          trend="up"
          icon={DollarSign}
          color="emerald"
          sparklineData={sparklineData}
          delay={0.1}
        />
        <CRMMetricCard 
          title="Active Deals"
          value={safePipelineItems.length.toString()}
          change="+8.4%"
          trend="up"
          icon={Target}
          color="purple"
          sparklineData={sparklineData}
          delay={0.2}
        />
        <CRMMetricCard 
          title="New Leads"
          value={safeLeads.length.toString()}
          change="+12.5%"
          trend="up"
          icon={Users}
          color="blue"
          sparklineData={sparklineData}
          delay={0.3}
        />
        <CRMMetricCard 
          title="Win Rate"
          value="24%"
          change="+2.1%"
          trend="up"
          icon={TrendingUp}
          color="indigo"
          sparklineData={sparklineData}
          delay={0.4}
        />
      </CRMMetricsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <SalesChart data={data?.salesChartData || []} />
          <UpcomingMeetings />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HotLeads />
            <TeamPerformance />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeadFunnel />
            <RevenueTracker />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentActivities activities={data?.recentActivities || []} />
            <PendingFollowups />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <AIInsights />
          <CalendarWidget />
        </div>
      </div>
    </CRMPageContainer>
  );
};

export default DashboardPage;
