import { CRMPageContainer, CRMMetricsGrid, CRMCard } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  ToolbarSkeleton, 
  TableSkeleton 
} from "@/shared/components/skeletons";
import { Skeleton } from "@/shared/ui/skeleton";

function QuotationCardSkeleton() {
  return (
    <CRMCard className="group relative flex flex-col justify-between p-5 h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>

          <div className="h-px w-full bg-border/50" />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
        <Skeleton className="h-9 font-bold text-xs rounded-xl flex-1" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
    </CRMCard>
  );
}

export function QuotationsSkeleton({ viewMode = "list" }: { viewMode?: string }) {
  const isGrid = viewMode === "grid" || viewMode === "cards";

  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      <div className="shrink-0">
        <CRMMetricsGrid cols={4}>
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </CRMMetricsGrid>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        <div className="shrink-0 mb-2 py-4">
          <ToolbarSkeleton />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          {isGrid ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <QuotationCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="p-1">
              <TableSkeleton rows={10} cols={7} showPagination={true} />
            </div>
          )}
        </div>
      </div>
    </CRMPageContainer>
  );
}
