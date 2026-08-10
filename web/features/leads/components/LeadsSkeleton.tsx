import { CRMPageContainer, CRMMetricsGrid, CRMCard } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  ToolbarSkeleton, 
  TableSkeleton 
} from "@/shared/components/skeletons";
import { Skeleton } from "@/shared/ui/skeleton";

function LeadCardSkeleton() {
  return (
    <CRMCard className="group relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>

      <div className="space-y-4 mb-6">
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="h-px w-full bg-border/50" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32 col-span-2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-[52px] w-full rounded-xl" />
          <Skeleton className="h-[52px] w-full rounded-xl" />
          <Skeleton className="h-[52px] w-full rounded-xl" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </CRMCard>
  );
}

export function LeadsSkeleton({ viewMode = "list" }: { viewMode?: string }) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <LeadCardSkeleton key={i} />
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
