import { CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  KanbanSkeleton 
} from "@/shared/components/skeletons";

export function PipelineSkeleton() {
  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      <CRMMetricsGrid cols={3} className="gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </CRMMetricsGrid>
      <KanbanSkeleton />
    </CRMPageContainer>
  );
}
