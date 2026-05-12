"use client";

import { useEffect } from "react";
import { GitBranch, Plus, Download, TrendingUp, DollarSign, Target } from "lucide-react";
import PipelineBoard from "@/features/pipeline/components/PipelineBoard";
import { PageErrorState, PageLoadingState } from "@/shared/components/page-states";
import { usePipeline } from "@/shared/hooks/use-crm";
import { 
  CRMPageHeader, 
  CRMMetricCard,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";

const PipelinePage = () => {
  const { pipelineItems, setPipelineItems } = useCRMStore();
  const safePipelineItems = Array.isArray(pipelineItems) ? pipelineItems : [];
  const { data, isLoading: loading, error, refetch } = usePipeline();

  useEffect(() => {
    if (data?.items && safePipelineItems.length === 0) {
      setPipelineItems(data.items);
    }
  }, [data, safePipelineItems.length, setPipelineItems]);

  const handleAddDeal = () => {
    toast.info("Add Deal", {
      description: "Opening revenue opportunity workspace...",
    });
  };

  const handleExport = () => {
    toast.success("Pipeline Manifest Exported", {
      description: `Revenue forecast for ${safePipelineItems.length} deals is ready.`,
    });
  };

  if (loading && safePipelineItems.length === 0) {
    return <PageLoadingState label="Loading live pipeline stages and deal totals..." />;
  }

  if (error && safePipelineItems.length === 0) {
    return (
      <PageErrorState
        title="Pipeline unavailable"
        message={(error as Error).message || "An error occurred"}
        onRetry={() => { refetch(); }}
      />
    );
  }

  const totalValue = safePipelineItems.reduce((acc, item) => {
    const val = item.valueAmount ?? parseInt(item.value.replace(/[^0-9]/g, ""));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
  const averageProbability = safePipelineItems.length
    ? Math.round(safePipelineItems.reduce((sum, item) => sum + (item.probability ?? 0), 0) / safePipelineItems.length)
    : 0;
  const stuckDeals = safePipelineItems.filter((item) => item.isStuck).length;

  return (
    <CRMPageContainer className="pb-6">
      <CRMPageHeader 
        title="Sales Pipeline"
        subtitle="Visualize your sales funnel, manage deal stages, and forecast revenue with real-time accuracy."
        icon={GitBranch}
        badge="Revenue Intelligence"
        actions={[
          {
            label: "Export",
            icon: Download,
            onClick: handleExport,
            variant: "outline"
          },
          {
            label: "Add Deal",
            icon: Plus,
            onClick: handleAddDeal,
            variant: "default"
          }
        ]}
      />

      <CRMMetricsGrid cols={3} className="gap-4">
        <CRMMetricCard 
          title="Pipeline Value"
          value={totalValue.toLocaleString()}
          change="0%"
          trend="up"
          icon={DollarSign}
          color="purple"
          delay={0.1}
        />
        <CRMMetricCard 
          title="Avg. Probability"
          value={`${averageProbability}%`}
          change="0%"
          trend="up"
          icon={Target}
          color="blue"
          delay={0.2}
        />
        <CRMMetricCard 
          title="Stuck Deals"
          value={stuckDeals}
          change="0%"
          trend={stuckDeals > 0 ? "down" : "up"}
          icon={TrendingUp}
          color="blue"
          delay={0.3}
        />
      </CRMMetricsGrid>

      <PipelineBoard items={safePipelineItems} />
    </CRMPageContainer>
  );
};

export default PipelinePage;












