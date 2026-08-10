"use client";
import { LeadsSkeleton } from "@/features/leads/components/LeadsSkeleton";
import { useViewMode } from "@/shared/hooks/useViewMode";

export default function Loading() {
  const [viewMode] = useViewMode("leads", "list");
  return <LeadsSkeleton viewMode={viewMode} />;
}
