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

export function TableSkeleton({ rows = 5, cols = 5, showPagination = true }: { rows?: number; cols?: number, showPagination?: boolean }) {
  return (
    <div className="space-y-4">
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
      {showPagination && (
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number | string }) {
  return (
    <div className="w-full" style={{ height }}>
      <div className="w-full h-full bg-muted/10 rounded-xl flex items-end gap-2 px-4 pb-4">
        {[60, 80, 45, 90, 70, 85, 55].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px] sm:w-[250px]" />
        <Skeleton className="h-4 w-[250px] sm:w-[350px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string } = {}) {
  return (
    <CRMCard className={`p-6 space-y-4${className ? ` ${className}` : ''}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="pt-4 flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </CRMCard>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="pt-4 flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-6 h-[calc(100vh-200px)] overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-80 flex-shrink-0 flex flex-col gap-4 bg-muted/10 p-4 rounded-xl border border-border/50">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          {Array.from({ length: 3 }).map((_, j) => (
            <CRMCard key={j} className="p-4 space-y-3 shadow-sm border-border/50">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </CRMCard>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };
  return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
}

export function ModalSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <FormSkeleton />
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
      <Skeleton className="h-10 flex-1 w-full" />
      <Skeleton className="h-10 w-[120px]" />
      <Skeleton className="h-10 w-[120px]" />
    </div>
  );
}

export function ToolbarSkeleton() {
  return (
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
        <div className="space-y-3 flex-1 w-full">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-md" /> {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <CRMCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-border/50 rounded-xl overflow-hidden border border-border/50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`header-${i}`} className="bg-muted/30 p-3 text-center border-b border-border/50">
            <Skeleton className="h-4 w-8 mx-auto" />
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={`day-${i}`} className="bg-card min-h-[120px] p-2 space-y-2">
            <Skeleton className="h-4 w-6 ml-auto" />
            {i % 5 === 0 && <Skeleton className="h-5 w-full rounded-sm" />}
            {i % 8 === 0 && <Skeleton className="h-5 w-full rounded-sm" />}
          </div>
        ))}
      </div>
    </CRMCard>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-64 h-full border-r border-border bg-sidebar flex flex-col p-4 gap-6">
      <div className="flex items-center gap-3 px-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex-1 space-y-2 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
      <div className="mt-auto border-t border-border pt-4">
        <div className="flex items-center gap-3 px-2">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 w-full">
      <Skeleton className="h-10 w-64 rounded-md" /> {/* Search */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </header>
  );
}
