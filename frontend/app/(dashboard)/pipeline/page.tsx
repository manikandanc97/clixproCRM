"use client";

import { useEffect } from "react";
import { GitBranch, Plus, Download, TrendingUp, DollarSign, Target } from "lucide-react";
import PipelineBoard from "@/components/pipeline/PipelineBoard";
import { PageErrorState, PageLoadingState } from "@/components/shared/page-states";
import { useApiResource } from "@/hooks/use-api-resource";
import { fetchPipelineData } from "@/lib/api/crm";
import { 
  CRMPageHeader, 
  CRMMetricCard,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/components/shared/crm";
import { useCRMStore } from "@/store/useCRMStore";
import { toast } from "sonner";

const PipelinePage = () => {
  const { pipelineItems, setPipelineItems } = useCRMStore();
  const safePipelineItems = Array.isArray(pipelineItems) ? pipelineItems : [];
  const { data, loading, error, refetch } = useApiResource(fetchPipelineData);

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
        message={error}
        onRetry={refetch}
      />
    );
  }

  const sparklineData = [
    { value: 40 }, { value: 30 }, { value: 60 }, { value: 80 }, { value: 50 }, { value: 90 }, { value: 100 }
  ];

  const totalValue = safePipelineItems.reduce((acc, item) => {
    const val = parseInt(item.value.replace(/[^0-9]/g, ""));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

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
          value={`$${totalValue.toLocaleString()}`}
          change="+14.2%"
          trend="up"
          icon={DollarSign}
          color="purple"
          sparklineData={sparklineData}
          delay={0.1}
        />
        <CRMMetricCard 
          title="Avg. Probability"
          value="68%"
          change="+5%"
          trend="up"
          icon={Target}
          color="cyan"
          sparklineData={sparklineData}
          delay={0.2}
        />
        <CRMMetricCard 
          title="Win Velocity"
          value="18 Days"
          change="-2 Days"
          trend="up"
          icon={TrendingUp}
          color="blue"
          sparklineData={sparklineData}
          delay={0.3}
        />
      </CRMMetricsGrid>

      <PipelineBoard items={safePipelineItems} />
    </CRMPageContainer>
  );
};

export default PipelinePage;
