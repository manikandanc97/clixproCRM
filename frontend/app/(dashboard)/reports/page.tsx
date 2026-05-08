"use client";

import { BarChart3, Download, Calendar, TrendingUp, Users, DollarSign, Target, ArrowUpRight } from "lucide-react";
import RevenueChart from "@/components/reports/RevenueChart";
import ConversionChart from "@/components/reports/ConversionChart";
import PerformanceTable from "@/components/reports/PerformanceTable";
import AnalyticsSummary from "@/components/reports/AnalyticsSummary";
import SalesFunnel from "@/components/reports/SalesFunnel";
import ActivityHeatmap from "@/components/reports/ActivityHeatmap";
import RevenueTarget from "@/components/reports/RevenueTarget";
import { PageErrorState, PageLoadingState } from "@/components/shared/page-states";
import { useApiResource } from "@/hooks/use-api-resource";
import { fetchReportsData } from "@/lib/api/crm";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMCard 
} from "@/components/shared/crm";

const ReportsPage = () => {
  const { data, loading, error, refetch } = useApiResource(fetchReportsData);

  if (loading && !data) {
    return <PageLoadingState label="Loading report metrics and chart data..." />;
  }

  if (error && !data) {
    return (
      <PageErrorState
        title="Reports unavailable"
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
        title="Reports & Analytics"
        subtitle="Comprehensive breakdown of your sales performance, revenue targets, and team efficiency."
        icon={BarChart3}
        badge="Business Intelligence"
        actions={[
          {
            label: "Time Period",
            icon: Calendar,
            onClick: () => console.log("Time"),
            variant: "outline"
          },
          {
            label: "Download Report",
            icon: Download,
            onClick: () => console.log("Download"),
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
          title="Avg. Win Rate"
          value="24.8%"
          change="+4.2%"
          trend="up"
          icon={Target}
          color="indigo"
          sparklineData={sparklineData}
          delay={0.2}
        />
        <CRMMetricCard 
          title="Active Leads"
          value="142"
          change="+12"
          trend="up"
          icon={Users}
          color="blue"
          sparklineData={sparklineData}
          delay={0.3}
        />
        <CRMMetricCard 
          title="Projected Growth"
          value="18.5%"
          change="+2.1%"
          trend="up"
          icon={TrendingUp}
          color="pink"
          sparklineData={sparklineData}
          delay={0.4}
        />
      </div>

      <AnalyticsSummary />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-8">
          <RevenueChart data={data?.revenueChart || []} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ConversionChart data={data?.conversionChart || []} />
            <ActivityHeatmap />
          </div>
        </div>
        
        <div className="space-y-8">
          <RevenueTarget />
          <SalesFunnel />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight">Team Performance</h2>
          <p className="text-muted-foreground text-sm font-medium">Detailed breakdown of sales representative metrics and activity.</p>
        </div>
        
        <PerformanceTable performance={data?.performance || []} />
      </div>
    </div>
  );
};

export default ReportsPage;
