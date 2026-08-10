import { CRMPageContainer, CRMMetricsGrid } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  MetricCardSkeleton 
} from "@/shared/components/skeletons";
import { Skeleton } from "@/shared/ui/skeleton";

function PipelineCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-12 rounded-sm" />
        <Skeleton className="h-4 w-4 rounded-sm" />
      </div>

      <div className="flex flex-col gap-1 mt-0.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>

      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-border/50">
        <Skeleton className="h-4 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-1.5 w-16 rounded-full" />
          <Skeleton className="h-3 w-6" />
        </div>
      </div>
    </div>
  );
}

function PipelineColumnSkeleton() {
  return (
    <div className="flex flex-col bg-muted/30 rounded-xl min-w-[340px] max-w-[340px] h-full border border-border overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-background/50 rounded-xl p-3 border border-border shadow-sm">
           <div className="flex flex-col gap-1">
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-4 w-20" />
           </div>
           <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-2 w-12" />
              <Skeleton className="h-3 w-10" />
           </div>
        </div>
      </div>

      <div className="flex-1 px-3 pt-4 space-y-3 overflow-hidden pb-6">
        <PipelineCardSkeleton />
        <PipelineCardSkeleton />
        <PipelineCardSkeleton />
      </div>

      <div className="px-5 py-3 bg-background/40 border-t border-border flex items-center">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function PipelineSkeleton() {
  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      <div className="shrink-0">
        <CRMMetricsGrid cols={3} className="gap-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </CRMMetricsGrid>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        <div className="shrink-0 mb-2 py-4">
           {/* Toolbar Skeleton */}
           <div className="flex flex-col sm:flex-row items-center gap-3">
             <Skeleton className="h-10 flex-1 w-full max-w-sm" />
             <div className="flex items-center gap-2">
               <Skeleton className="h-10 w-[120px]" />
               <Skeleton className="h-10 w-[120px]" />
             </div>
           </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex gap-6 overflow-hidden pb-4 -mx-8 px-8 h-[calc(100vh-260px)] min-h-[600px] items-start">
            {Array.from({ length: 5 }).map((_, i) => (
              <PipelineColumnSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </CRMPageContainer>
  );
}
