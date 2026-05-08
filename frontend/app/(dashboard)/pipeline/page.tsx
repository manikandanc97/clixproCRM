"use client";

import { GitBranch, Plus, Download, TrendingUp, DollarSign, Target } from "lucide-react";
import PipelineBoard from "@/components/pipeline/PipelineBoard";
import { PageErrorState, PageLoadingState } from "@/components/shared/page-states";
import { useApiResource } from "@/hooks/use-api-resource";
import { fetchPipelineData } from "@/lib/api/crm";
import { 
  CRMPageHeader, 
  CRMMetricCard 
} from "@/components/shared/crm";

const PipelinePage = () => {
  const { data, loading, error, refetch } = useApiResource(fetchPipelineData);

  if (loading && !data) {
    return <PageLoadingState label="Loading live pipeline stages and deal totals..." />;
  }

  if (error && !data) {
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

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-6">
      <CRMPageHeader 
        title="Sales Pipeline"
        subtitle="Visualize your sales funnel, manage deal stages, and forecast revenue with real-time accuracy."
        icon={GitBranch}
        badge="Revenue Intelligence"
        actions={[
          {
            label: "Export",
            icon: Download,
            onClick: () => console.log("Export"),
            variant: "outline"
          },
          {
            label: "Add Deal",
            icon: Plus,
            onClick: () => console.log("Add"),
            variant: "default"
          }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CRMMetricCard 
          title="Pipeline Value"
          value="$425,800"
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
      </div>

      <PipelineBoard items={data?.items || []} />
    </div>
  );
};

export default PipelinePage;
