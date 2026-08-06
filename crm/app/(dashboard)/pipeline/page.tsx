"use client";

import { useEffect, useState } from "react";
import { GitBranch, Plus, Download, TrendingUp, DollarSign, IndianRupee, Target } from "lucide-react";
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
import { useCurrency } from "@/shared/hooks/use-currency";
import { PipelineToolbar } from "@/features/pipeline/components/PipelineToolbar";

const PipelinePage = () => {
  const { pipelineItems, setPipelineItems } = useCRMStore();
  const safePipelineItems = Array.isArray(pipelineItems) ? pipelineItems : [];
  const { data, isLoading: loading, error, refetch } = usePipeline();

  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedStage, setPreselectedStage] = useState<string | undefined>();
  const { formatCurrency, currency } = useCurrency();
  const CurrencyIcon = currency === "INR" ? IndianRupee : DollarSign;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("created_desc");
  const [filterValue, setFilterValue] = useState("all");

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

  const handleAddDeal = (stage?: string | any) => {
    setPreselectedStage(typeof stage === 'string' ? stage : undefined);
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

  let filteredItems = [...safePipelineItems];
  
  if (searchQuery) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  if (filterValue === "hot") {
    filteredItems = filteredItems.filter(item => item.temperature === "Hot");
  } else if (filterValue === "stuck") {
    filteredItems = filteredItems.filter(item => item.isStuck);
  }
  
  if (sortValue === "value_desc") {
    filteredItems.sort((a, b) => (b.valueAmount || 0) - (a.valueAmount || 0));
  } else if (sortValue === "prob_desc") {
    filteredItems.sort((a, b) => (b.probability || 0) - (a.probability || 0));
  } else {
    // default created_desc
    filteredItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  return (
    <CRMPageContainer className="min-h-full !pb-4 md:!pb-6 space-y-0 gap-4 md:gap-6 flex flex-col">
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

      <div className="shrink-0">
        <CRMMetricsGrid cols={3} className="gap-4">
          <CRMMetricCard 
            title="Pipeline Value"
            value={formatCurrency(totalValue)}
            change="0%"
            trend="up"
            icon={CurrencyIcon}
            color="emerald"
            delay={0.1}
          />
          <CRMMetricCard 
            title="Avg. Probability"
            value={`${averageProbability}%`}
            change="0%"
            trend="up"
            icon={Target}
            color="cyan"
            delay={0.2}
          />
          <CRMMetricCard 
            title="Stuck Deals"
            value={stuckDeals}
            change="0%"
            trend={stuckDeals > 0 ? "down" : "up"}
            icon={TrendingUp}
            color="pink"
            delay={0.3}
          />
        </CRMMetricsGrid>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="shrink-0 mb-2 sticky top-0 z-40 bg-background/95 backdrop-blur-md py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <PipelineToolbar 
            onSearch={setSearchQuery}
            onSort={setSortValue}
            onFilter={setFilterValue}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <PipelineBoard items={filteredItems} onAddDeal={handleAddDeal} />
        </div>
      </div>

      <FormModal
        title="Add New Opportunity"
        description="Create a new deal in your sales pipeline."
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        size="lg"
      >
        <LeadForm 
          initialStage={preselectedStage}
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </FormModal>
    </CRMPageContainer>
  );
};

export default PipelinePage;
