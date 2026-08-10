import { CRMPageContainer } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  CardSkeleton
} from "@/shared/components/skeletons";
import { Skeleton } from "@/shared/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <CRMPageContainer>
      {/* Page Header */}
      <PageHeaderSkeleton />

      {/* Body */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 mt-6">
        {/* Sidebar */}
        <div className="lg:w-60 shrink-0 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          <CardSkeleton className="min-h-[200px]" />
          <CardSkeleton className="min-h-[300px]" />
          <CardSkeleton className="min-h-[150px]" />
        </div>
      </div>
    </CRMPageContainer>
  );
}
