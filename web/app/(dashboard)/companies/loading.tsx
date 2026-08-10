"use client";
import { CompaniesSkeleton } from "@/features/companies/components/CompaniesSkeleton";
import { useViewMode } from "@/shared/hooks/useViewMode";

export default function Loading() {
  const [viewMode] = useViewMode("companies", "list");
  return <CompaniesSkeleton viewMode={viewMode} />;
}
