import { CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  ChartSkeleton, 
  CardSkeleton,
  TableSkeleton
} from "@/shared/components/skeletons";

export function ReportsSkeleton() {
  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      
      <CRMMetricsGrid cols={4} className="gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </CRMMetricsGrid>

      <CardSkeleton /> {/* Analytics Summary placeholder */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <div className="xl:col-span-2 space-y-5">
          <div className="crm-card p-6">
            <div className="h-6 w-32 skeleton rounded-md mb-6" />
            <ChartSkeleton height={300} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="crm-card p-6">
              <div className="h-6 w-32 skeleton rounded-md mb-6" />
              <ChartSkeleton height={200} />
            </div>
            <div className="crm-card p-6">
              <div className="h-6 w-32 skeleton rounded-md mb-6" />
              <ChartSkeleton height={200} />
            </div>
          </div>
        </div>
        
        <div className="space-y-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="h-6 w-48 skeleton rounded-md" />
          <div className="h-4 w-64 skeleton rounded-md" />
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    </CRMPageContainer>
  );
}
