import { CRMPageContainer, CRMMetricsGrid, CRMCard } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton, 
  ToolbarSkeleton, 
  TableSkeleton,
  CardSkeleton
} from "@/shared/components/skeletons";
import { Skeleton } from "@/shared/ui/skeleton";

function EmployeeCardSkeleton() {
  return (
    <CRMCard className="group relative flex flex-col justify-between p-5 h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2.5 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-3.5 h-3.5 rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-3.5 h-3.5 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
        <Skeleton className="h-9 w-24 rounded-xl flex-1" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
    </CRMCard>
  );
}

export function EmployeesSkeleton({ viewMode = "list" }: { viewMode?: string }) {
  const isGrid = viewMode === "grid" || viewMode === "cards";

  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      
      {/* Stats Grid */}
      <CRMMetricsGrid>
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </CRMMetricsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Table Area */}
        <div className="lg:col-span-3 space-y-6">
          <ToolbarSkeleton />
          
          {isGrid ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <EmployeeCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <TableSkeleton rows={10} cols={5} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-6 w-32 skeleton rounded-md" /> {/* Section Title Skeleton */}
            <CardSkeleton className="min-h-[200px]" />
          </div>
          <div className="space-y-4">
            <div className="h-6 w-48 skeleton rounded-md" /> {/* Section Title Skeleton */}
            <CardSkeleton className="min-h-[250px]" />
          </div>
        </div>
      </div>
    </CRMPageContainer>
  );
}
