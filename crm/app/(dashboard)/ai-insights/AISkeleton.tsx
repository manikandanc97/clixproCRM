import { CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  ChartSkeleton, 
  CardSkeleton 
} from "@/shared/components/skeletons";

export function AISkeleton() {
  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      
      <CRMMetricsGrid cols={4}>
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </CRMMetricsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
        <div className="lg:col-span-2 space-y-8 min-w-0">
          <div className="space-y-4">
            <div className="h-6 w-48 skeleton rounded-md" />
            <div className="crm-card h-[400px] min-h-[400px] p-6 min-w-0">
              <ChartSkeleton height={350} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-6 w-48 skeleton rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-6 w-48 skeleton rounded-md" />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    </CRMPageContainer>
  );
}
