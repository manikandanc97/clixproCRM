"use client";

import { useState } from "react";
import { BarChart3, Download, Calendar, TrendingUp, Users, IndianRupee, Target, RefreshCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { PageErrorState } from "@/shared/components/page-states";
import { ReportsSkeleton } from "@/features/reports/components/ReportsSkeleton";
import { useReports } from "@/shared/hooks/use-crm";
import { useCurrency } from "@/shared/hooks/use-currency";
import { CRMPageHeader, CRMMetricCard, CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { toast } from "sonner";

const RevenueChart = dynamic(() => import("@/features/reports/components/RevenueChart"));
const ConversionChart = dynamic(() => import("@/features/reports/components/ConversionChart"));
const PerformanceTable = dynamic(() => import("@/features/reports/components/PerformanceTable"));
const AnalyticsSummary = dynamic(() => import("@/features/reports/components/AnalyticsSummary"));
const SalesFunnel = dynamic(() => import("@/features/reports/components/SalesFunnel"));
const RevenueTarget = dynamic(() => import("@/features/reports/components/RevenueTarget"));
const LeadSourceChart = dynamic(() => import("@/features/reports/components/LeadSourceChart"));
const SalesActivities = dynamic(() => import("@/features/reports/components/SalesActivities"));
const TopCustomers = dynamic(() => import("@/features/reports/components/TopCustomers"));
const RecentActivities = dynamic(() => import("@/features/reports/components/RecentActivities"));
const UpcomingFollowUps = dynamic(() => import("@/features/reports/components/UpcomingFollowUps"));
const AIInsights = dynamic(() => import("@/features/reports/components/AIInsights"));

const ReportsPage = () => {
  const [filters, setFilters] = useState<{ startDate?: string, endDate?: string, assignedToId?: string }>({});
  
  const { data, isLoading: loading, error, refetch, isFetching } = useReports(filters);
  
  const { CurrencyIcon } = useCurrency();

  const handleTimePeriod = () => {
    // Demo implementation for toggling this month filter
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    if (filters.startDate === firstDay) {
      setFilters({});
      toast.success("Filters cleared");
    } else {
      setFilters({ ...filters, startDate: firstDay });
      toast.info("Filtered by This Month");
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  const handleDownload = () => {
    if (!data || !data.performance) {
       toast.error("No data available to export");
       return;
    }

    try {
      const headers = ["Team Member", "Deals Closed", "Revenue Value", "Conversion Rate"];
      const rows = data.performance.map(p => [
        `"${p.name}"`,
        p.dealsClosed,
        p.revenueValue,
        `"${p.conversionRate}"`
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `CRM_Performance_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export Successful", {
        description: "Your team performance report has been downloaded as a CSV.",
      });
    } catch {
      toast.error("Export Failed", { description: "An error occurred while generating the report." });
    }
  };

  if (loading && !data) {
    return <ReportsSkeleton />;
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
            label: "Refresh",
            icon: RefreshCcw,
            onClick: handleRefresh,
            variant: "outline",
            // spinning if fetching
          },
          {
            label: "This Month",
            icon: Calendar,
            onClick: handleTimePeriod,
            variant: filters.startDate ? "default" : "outline"
          },
          {
            label: "Export",
            icon: Download,
            onClick: handleDownload,
            variant: "default"
          }
        ]}
      />

      <CRMMetricsGrid cols={4} className="gap-4">
        {(data?.stats ?? []).map((stat, index) => {
          const Icon = stat.title.toLowerCase().includes("revenue") || stat.title.toLowerCase().includes("size") ? CurrencyIcon :
            stat.title.toLowerCase().includes("conversion") || stat.title.toLowerCase().includes("win") ? Target :
            stat.title.toLowerCase().includes("deal") || stat.title.toLowerCase().includes("lead") ? Users :
            TrendingUp;

          // Define an array of premium colors
          const colors: ReturnType<typeof JSON.parse>[] = ["indigo", "violet", "emerald", "rose", "pink", "cyan", "amber", "blue"];
          // We can use a deterministic color based on index or title. Let's map by title or index.
          let assignedColor = stat.color || colors[index % colors.length];

          // Let's refine based on the title to have semantic colors
          const lowerTitle = stat.title.toLowerCase();
          if (lowerTitle.includes("won") || lowerTitle.includes("conversion")) assignedColor = "emerald";
          else if (lowerTitle.includes("lost")) assignedColor = "pink"; // fallback to pink/rose
          else if (lowerTitle.includes("open")) assignedColor = "cyan";
          else if (lowerTitle.includes("total")) assignedColor = "indigo";
          else if (lowerTitle.includes("avg") || lowerTitle.includes("size")) assignedColor = "violet";
          else if (lowerTitle.includes("forecast")) assignedColor = "orange";
          else if (lowerTitle.includes("revenue")) assignedColor = "blue";

          return (
            <CRMMetricCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.positive ? "up" : "down"}
              icon={Icon}
              color={assignedColor}
              sparklineData={stat.sparklineData}
              delay={0.05 * (index + 1)}
            />
          );
        })}
      </CRMMetricsGrid>

      <AnalyticsSummary insights={data?.insights ?? []} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <div className="xl:col-span-2 space-y-5 h-full flex flex-col">
          <div className="flex-1 min-h-[400px] flex flex-col">
             <RevenueChart data={data?.revenueChart || []} loading={isFetching} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
             <div className="min-h-[350px] flex flex-col">
               <ConversionChart data={data?.conversionChart || []} loading={isFetching} />
             </div>
             <div className="min-h-[350px] flex flex-col">
               <SalesFunnel data={data?.funnel ?? []} />
             </div>
          </div>
        </div>
        
        <div className="space-y-5 h-full flex flex-col">
          <RevenueTarget data={data?.revenueTarget ?? null} />
          <div className="flex-1 min-h-[300px] flex flex-col">
            <LeadSourceChart data={data?.leadSources ?? []} loading={isFetching} />
          </div>
          <div className="flex-1 min-h-[300px] flex flex-col">
            <SalesActivities data={data?.salesActivities ?? []} loading={isFetching} />
          </div>
        </div>
      </div>

      {/* Secondary Row: Customers, Activities, Follow-ups, Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="min-h-[400px] flex flex-col h-full">
          <TopCustomers data={data?.topCustomers ?? []} loading={isFetching} />
        </div>
        <div className="min-h-[400px] flex flex-col h-full">
          <RecentActivities data={data?.recentActivities ?? []} loading={isFetching} />
        </div>
        <div className="min-h-[400px] flex flex-col h-full">
          <UpcomingFollowUps data={data?.upcomingFollowUps ?? []} loading={isFetching} />
        </div>
        <div className="min-h-[400px] flex flex-col h-full">
          <AIInsights />
        </div>
      </div>

      {/* Team Performance */}
      <div className="space-y-4 pt-4">
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
