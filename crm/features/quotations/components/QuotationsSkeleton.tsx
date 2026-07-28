import { CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  ToolbarSkeleton, 
  TableSkeleton 
} from "@/shared/components/skeletons";

export function QuotationsSkeleton() {
  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      <CRMMetricsGrid cols={3} className="gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </CRMMetricsGrid>
      <ToolbarSkeleton />
      <TableSkeleton rows={5} cols={6} />
    </CRMPageContainer>
  );
}
