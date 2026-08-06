"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Download, Filter } from "lucide-react";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { useDashboardInitializer } from "@/shared/hooks/use-dashboard";
import { Button } from "@/shared/ui/button";
import { CRMPageContainer } from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";


// Standard dynamic imports
const RecentActivities = dynamic(() => import("@/features/dashboard/components/RecentActivities"));
const UpcomingMeetings = dynamic(() => import("@/features/dashboard/components/UpcomingMeetings"));
const HotLeads = dynamic(() => import("@/features/dashboard/components/HotLeads"));
const PendingFollowups = dynamic(() => import("@/features/dashboard/components/PendingFollowups"));
const CalendarWidget = dynamic(() => import("@/features/dashboard/components/CalendarWidget"));
import WelcomeBanner from "@/features/dashboard/components/WelcomeBanner";
import { DashboardWidgetWrapper } from "@/features/dashboard/components/DashboardWidgetWrapper";
import CreateNewMenu from "@/features/dashboard/components/CreateNewMenu";
import DashboardKPIs from "@/features/dashboard/components/DashboardKPIs";
import DashboardFilterMenu from "@/features/dashboard/components/DashboardFilterMenu";

const AIInsights = dynamic(() => import("@/features/reports/components/AIInsights"));
const RevenueTarget = dynamic(() => import("@/features/reports/components/RevenueTarget"));
const RevenueChart = dynamic(() => import("@/features/reports/components/RevenueChart"));
const SalesFunnel = dynamic(() => import("@/features/reports/components/SalesFunnel"));
const RecentCustomers = dynamic(() => import("@/features/dashboard/components/RecentCustomers"));

const DashboardPage = () => {
  const { 
    activeTimeframe, setActiveTimeframe 
  } = useCRMStore();

  const { 
    queries, 
    isAuthInitializing,
  } = useDashboardInitializer(activeTimeframe);

  if (isAuthInitializing) {
    return <DashboardSkeleton />;
  }

  const handleExport = () => {
    toast.success("Preparing PDF export...", {
      description: "Opening print dialog for dashboard...",
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <CRMPageContainer>
      <div className="flex flex-col gap-6">
        {/* Row 1: Hero Banner */}
        <WelcomeBanner />

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DashboardFilterMenu />
            <Button variant="outline" size="sm" onClick={handleExport} className="rounded-full h-9 px-3 sm:px-4 text-xs font-bold gap-2 print:hidden">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
            <div className="hidden sm:block h-4 w-px bg-border mx-1" />
            <CreateNewMenu />
          </div>
        </div>

        {/* Row 2: KPI Grid */}
        <DashboardKPIs />


        {/* Row 4 & 5: Operational Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 gap-6">
              <DashboardWidgetWrapper 
                id="revenueChart" 
                title="Revenue Chart"
                isLoading={queries.analytics.isLoading}
                isError={queries.analytics.isError}
                onRetry={() => queries.analytics.refetch()}
                delay={1.2}
              >
                <div className="h-[350px]">
                  <RevenueChart 
                    data={queries.analytics.data?.revenueOverview?.map(r => ({ name: r.name, total: r.revenue })) || []} 
                  />
                </div>
              </DashboardWidgetWrapper>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardWidgetWrapper 
                id="upcomingMeetings" 
                title="Upcoming Meetings"
                isLoading={queries.meetings.isLoading}
                isError={queries.meetings.isError}
                onRetry={() => queries.meetings.refetch()}
                delay={0.7}
              >
                <UpcomingMeetings />
              </DashboardWidgetWrapper>

              <DashboardWidgetWrapper 
                id="pendingFollowups" 
                title="Pending Tasks"
                isLoading={queries.tasks.isLoading}
                isError={queries.tasks.isError}
                onRetry={() => queries.tasks.refetch()}
                delay={0.8}
              >
                <PendingFollowups />
              </DashboardWidgetWrapper>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardWidgetWrapper 
                id="hotLeads" 
                title="Hot Leads"
                isLoading={queries.hotLeads.isLoading}
                isError={queries.hotLeads.isError}
                onRetry={() => queries.hotLeads.refetch()}
                delay={0.9}
              >
                <HotLeads />
              </DashboardWidgetWrapper>

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
            </div>

            <div className="grid grid-cols-1 gap-6">
              <DashboardWidgetWrapper 
                id="recentCustomers" 
                title="Recent Customers"
                isLoading={queries.customers?.isLoading || false}
                isError={queries.customers?.isError || false}
                onRetry={() => queries.customers?.refetch()}
                delay={1.3}
              >
                <div className="h-[350px]">
                  <RecentCustomers />
                </div>
              </DashboardWidgetWrapper>
            </div>

          </div>

          {/* Right Sidebar (Sticky) */}
          <div className="flex flex-col gap-6 w-full xl:sticky xl:top-24 self-start">
            
            <DashboardWidgetWrapper 
              id="revenueTarget" 
              title="Revenue Target"
              isLoading={queries.dashboard.isLoading}
              isError={queries.dashboard.isError}
              onRetry={() => queries.dashboard.refetch()}
              delay={1.2}
            >
              <RevenueTarget data={queries.dashboard.data?.revenueTarget ?? null} />
            </DashboardWidgetWrapper>

            <AIInsights />

            <DashboardWidgetWrapper 
              id="calendarWidget" 
              title="Calendar"
              delay={1.3}
            >
              <CalendarWidget />
            </DashboardWidgetWrapper>
          </div>
        </div>

      </div>
    </CRMPageContainer>
  );
};

export default DashboardPage;
