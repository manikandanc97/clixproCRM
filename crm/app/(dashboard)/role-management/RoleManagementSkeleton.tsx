import { CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  ToolbarSkeleton, 
  TableSkeleton 
} from "@/shared/components/skeletons";

export function RoleManagementSkeleton() {
  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      <CRMMetricsGrid cols={3}>
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </CRMMetricsGrid>
      <div className="space-y-6">
        <ToolbarSkeleton />
        <TableSkeleton rows={5} cols={5} />
      </div>
    </CRMPageContainer>
  );
}
