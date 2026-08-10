import { PageHeaderSkeleton, TableSkeleton } from "@/shared/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="p-6 bg-card rounded-xl border border-border/50">
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  );
}
