"use client";
import { EmployeesSkeleton } from "@/features/employees/components/EmployeesSkeleton";
import { useViewMode } from "@/shared/hooks/useViewMode";

export default function Loading() {
  const [viewMode] = useViewMode("employees", "list");
  return <EmployeesSkeleton viewMode={viewMode} />;
}
