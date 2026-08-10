import { CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  ToolbarSkeleton, 
  TableSkeleton 
} from "@/shared/components/skeletons";
import { Skeleton } from "@/shared/ui/skeleton";

function DealCardSkeleton() {
  return (
    <div className="group relative bg-card rounded-xl border border-border p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 mt-auto">
        <Skeleton className="h-[52px] w-full rounded-lg" />
        <Skeleton className="h-[52px] w-full rounded-lg" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function DealsSkeleton({ viewMode = "list" }: { viewMode?: string }) {
  const isGrid = viewMode === "grid" || viewMode === "cards";

  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      <div className="shrink-0">
        <CRMMetricsGrid cols={3}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 lg:p-6 bg-muted/20">
              {Array.from({ length: 8 }).map((_, i) => (
                <DealCardSkeleton key={i} />
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
