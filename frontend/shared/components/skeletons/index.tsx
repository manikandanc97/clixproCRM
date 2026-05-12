import { CRMCard } from "@/shared/components/crm/CRMCard";
import { CardContent, CardHeader } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function DashboardWidgetSkeleton({ rows = 3, showHeader = true }: { rows?: number; showHeader?: boolean }) {
  return (
    <CRMCard noPadding className="h-full flex flex-col">
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-20 rounded-xl" />
        </CardHeader>
      )}
      <CardContent className="pt-0 flex-1 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-12 rounded-md shrink-0" />
          </div>
        ))}
      </CardContent>
    </CRMCard>
  );
}

export function MetricCardSkeleton() {
  return (
    <CRMCard className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-10 w-full rounded-md" />
    </CRMCard>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/50">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-4 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="w-full animate-pulse" style={{ height }}>
      <div className="w-full h-full bg-muted/40 rounded-xl flex items-end gap-2 px-4 pb-4">
        {[60, 80, 45, 90, 70, 85, 55].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-muted rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}











