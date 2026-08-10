"use client";
import { DealsSkeleton } from "@/features/deals/components/DealsSkeleton";
import { useViewMode } from "@/shared/hooks/useViewMode";

export default function Loading() {
  const [viewMode] = useViewMode("deals", "list");
  return <DealsSkeleton viewMode={viewMode} />;
}
