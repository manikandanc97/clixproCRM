"use client";

import { BarChart3, Download, Calendar, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import RevenueChart from "@/features/reports/components/RevenueChart";
import ConversionChart from "@/features/reports/components/ConversionChart";
import PerformanceTable from "@/features/reports/components/PerformanceTable";
import AnalyticsSummary from "@/features/reports/components/AnalyticsSummary";
import SalesFunnel from "@/features/reports/components/SalesFunnel";
import ActivityHeatmap from "@/features/reports/components/ActivityHeatmap";
import RevenueTarget from "@/features/reports/components/RevenueTarget";
import { PageErrorState, PageLoadingState } from "@/shared/components/page-states";
import { useReports } from "@/shared/hooks/use-crm";
import { Button } from "@/shared/ui/button";
import { CRMPageHeader, CRMMetricCard, CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { toast } from "sonner";

const ReportsPage = () => {
  const { data, isLoading: loading, error, refetch } = useReports();

  const handleTimePeriod = () => {
    toast.info("Time Period Selection", {
      description: "Opening custom date range selector...",
    });
  };

  const handleDownload = () => {
    toast.success("Intelligence Report Ready", {
      description: "Compiling business data into PDF format...",
    });
  };

  if (loading && !data) {
    return <PageLoadingState label="Loading report metrics and chart data..." />;
  }

  if (error && !data) {
    return (
      <PageErrorState
        title="Reports unavailable"
        message={(error as Error).message || "An error occurred"}
        onRetry={() => { refetch(); }}
      />
    );
  }

  return (
    <CRMPageContainer>
      <CRMPageHeader 
        title="Reports & Analytics"
        subtitle="Comprehensive breakdown of your sales performance, revenue targets, and team efficiency."
        icon={BarChart3}
        badge="Business Intelligence"
        actions={[
          {
            label: "Time Period",
            icon: Calendar,
            onClick: handleTimePeriod,
            variant: "outline"
          },
          {
            label: "Download Report",
            icon: Download,
            onClick: handleDownload,
            variant: "default"
          }
        ]}
      />

      <CRMMetricsGrid cols={4} className="gap-4">
        {(data?.stats ?? []).map((stat, index) => {
          const Icon = stat.title.toLowerCase().includes("revenue") ? DollarSign :
            stat.title.toLowerCase().includes("conversion") || stat.title.toLowerCase().includes("win") ? Target :
            stat.title.toLowerCase().includes("deal") ? Users :
            TrendingUp;

          return (
            <CRMMetricCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.positive ? "up" : "down"}
              icon={Icon}
              color={stat.color || "primary"}
              sparklineData={stat.sparklineData}
              delay={0.1 * (index + 1)}
            />
          );
        })}
      </CRMMetricsGrid>

      <AnalyticsSummary insights={data?.insights ?? []} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <div className="xl:col-span-2 space-y-5">
          <RevenueChart data={data?.revenueChart || []} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ConversionChart data={data?.conversionChart || []} />
            <ActivityHeatmap data={data?.activityHeatmap ?? []} />
          </div>
        </div>
        
        <div className="space-y-5">
          <RevenueTarget data={data?.revenueTarget ?? null} />
          <SalesFunnel data={data?.funnel ?? []} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight">Team Performance</h2>
          <p className="text-muted-foreground text-sm font-medium">Detailed breakdown of sales representative metrics and activity.</p>
        </div>
        
        <PerformanceTable performance={data?.performance || []} />
      </div>
    </CRMPageContainer>
  );
};

export default ReportsPage;












