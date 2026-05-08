"use client";

import { LayoutDashboard, Download, Filter, TrendingUp, Users, DollarSign, Target, Calendar, Sparkles } from "lucide-react";
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
import { fetchDashboardData } from "@/lib/api/crm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMCard 
} from "@/components/shared/crm";

const DashboardPage = () => {
  const { data, loading, error, refetch } = useApiResource(fetchDashboardData);

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

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-20">
      <CRMPageHeader 
        title="Command Center"
        subtitle="Welcome back, Agent. Here's what's happening across your sales intelligence landscape today."
        icon={LayoutDashboard}
        badge="System Overview"
        actions={[
          {
            label: "Filters",
            icon: Filter,
            onClick: () => console.log("Filters"),
            variant: "outline"
          },
          {
            label: "Export PDF",
            icon: Download,
            onClick: () => console.log("Export"),
            variant: "default"
          }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CRMMetricCard 
          title="Total Revenue"
          value="$124,500"
          change="+15.2%"
          trend="up"
          icon={DollarSign}
          color="emerald"
          sparklineData={sparklineData}
          delay={0.1}
        />
        <CRMMetricCard 
          title="Active Deals"
          value="42"
          change="+8.4%"
          trend="up"
          icon={Target}
          color="purple"
          sparklineData={sparklineData}
          delay={0.2}
        />
        <CRMMetricCard 
          title="New Leads"
          value="12"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        
        {/* Main SaaS Grid Structure */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-8">
          
          <SalesChart data={data?.salesChartData || []} />
          
          <UpcomingMeetings />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <HotLeads />
            <TeamPerformance />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LeadFunnel />
            <RevenueTracker />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RecentActivities activities={data?.recentActivities || []} />
            <PendingFollowups />
          </div>

        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-8">
          <AIInsights />
          <CalendarWidget />
          
          <CRMCard className="bg-primary text-primary-foreground p-6 overflow-hidden relative group cursor-pointer border-none shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <Sparkles className="w-16 h-16" />
            </div>
            <div className="relative z-10 space-y-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px] font-bold uppercase tracking-widest">
                Premium
              </Badge>
              <h4 className="font-bold text-xl tracking-tight">Upgrade to Enterprise</h4>
              <p className="text-primary-foreground/70 text-xs font-medium leading-relaxed">Unlock advanced AI lead scoring, priority support and unlimited automation rules.</p>
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold h-11 rounded-xl shadow-lg">
                View Plans
              </Button>
            </div>
          </CRMCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
