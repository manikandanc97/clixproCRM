"use client";
import { CustomersSkeleton } from "@/features/customers/components/CustomersSkeleton";
import { useViewMode } from "@/shared/hooks/useViewMode";

export default function Loading() {
  const [viewMode] = useViewMode("customers", "list");
  return <CustomersSkeleton viewMode={viewMode} />;
}
