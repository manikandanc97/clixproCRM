import { CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  ToolbarSkeleton, 
  TableSkeleton 
} from "@/shared/components/skeletons";

export function DealsSkeleton() {
  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      <CRMMetricsGrid cols={3}>
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </CRMMetricsGrid>
      <ToolbarSkeleton />
      <TableSkeleton rows={5} cols={6} />
    </CRMPageContainer>
  );
}
