"use client";
import { QuotationsSkeleton } from "@/features/quotations/components/QuotationsSkeleton";
import { useViewMode } from "@/shared/hooks/useViewMode";

export default function Loading() {
  const [viewMode] = useViewMode("quotations", "list");
  return <QuotationsSkeleton viewMode={viewMode} />;
}
