"use client";

import { BarChart3, Download, Calendar, TrendingUp, Users, DollarSign, Target, ArrowUpRight } from "lucide-react";
import RevenueChart from "@/features/reports/components/RevenueChart";
import ConversionChart from "@/features/reports/components/ConversionChart";
import PerformanceTable from "@/features/reports/components/PerformanceTable";
import AnalyticsSummary from "@/features/reports/components/AnalyticsSummary";
import SalesFunnel from "@/features/reports/components/SalesFunnel";
import ActivityHeatmap from "@/features/reports/components/ActivityHeatmap";
import RevenueTarget from "@/features/reports/components/RevenueTarget";
import { PageErrorState, PageLoadingState } from "@/shared/components/page-states";
import { useReports } from "@/shared/hooks/use-crm";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMCard,
  CRMPageContainer,
  CRMMetricsGrid,
  CRMPageSection
} from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";

const ReportsPage = () => {
  const { leads, quotations, customers } = useCRMStore();
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
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

  const sparklineData = [
    { value: 40 }, { value: 30 }, { value: 60 }, { value: 80 }, { value: 50 }, { value: 90 }, { value: 100 }
  ];

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
          value={safeLeads.length || "142"}
          change="+12"
          trend="up"
          icon={Users}
          color="blue"
          sparklineData={sparklineData}
          delay={0.3}
        />
        <CRMMetricCard 
          title="Total Customers"
          value={safeCustomers.length || "48"}
          change="+2.1%"
          trend="up"
          icon={TrendingUp}
          color="pink"
          sparklineData={sparklineData}
          delay={0.4}
        />
      </CRMMetricsGrid>

      <AnalyticsSummary />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <div className="xl:col-span-2 space-y-5">
          <RevenueChart data={data?.revenueChart || []} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ConversionChart data={data?.conversionChart || []} />
            <ActivityHeatmap />
          </div>
        </div>
        
        <div className="space-y-5">
          <RevenueTarget />
          <SalesFunnel />
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












