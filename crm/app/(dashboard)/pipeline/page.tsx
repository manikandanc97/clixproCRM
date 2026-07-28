"use client";

import { useEffect, useState } from "react";
import { GitBranch, Plus, Download, TrendingUp, DollarSign, Target } from "lucide-react";
import dynamic from "next/dynamic";
const PipelineBoard = dynamic(() => import("@/features/pipeline/components/PipelineBoard"), {
  loading: () => <div className="h-[600px] w-full skeleton rounded-xl" />
});
import { PageErrorState } from "@/shared/components/page-states";
import { PipelineSkeleton } from "@/features/pipeline/components/PipelineSkeleton";
import { usePipeline } from "@/shared/hooks/use-crm";
import { 
  CRMPageHeader, 
  CRMMetricCard,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";
import { FormModal } from "@/shared/components/form-modal";
const LeadForm = dynamic(() => import("@/features/forms/LeadForm").then(mod => ({ default: mod.LeadForm })), {
  loading: () => <div className="h-[300px] skeleton rounded-xl" />
});
import { useSearchParams } from "next/navigation";

const PipelinePage = () => {
  const { pipelineItems, setPipelineItems } = useCRMStore();
  const safePipelineItems = Array.isArray(pipelineItems) ? pipelineItems : [];
  const { data, isLoading: loading, error, refetch } = usePipeline();

  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      const timer = setTimeout(() => {
        setIsAddModalOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (data?.items) {
      setPipelineItems(data.items);
    }
  }, [data?.items, setPipelineItems]);

  const handleAddDeal = () => {
    setIsAddModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Pipeline Manifest Exported", {
      description: `Revenue forecast for ${safePipelineItems.length} deals is ready.`,
    });
  };

  if (loading && safePipelineItems.length === 0) {
    return <PipelineSkeleton />;
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

      <FormModal
        title="Add New Opportunity"
        description="Create a new deal in your sales pipeline."
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        size="lg"
      >
        <LeadForm 
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </FormModal>
    </CRMPageContainer>
  );
};

export default PipelinePage;
