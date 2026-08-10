"use client";
import { TasksSkeleton } from "@/features/tasks/components/TasksSkeleton";
import { useViewMode } from "@/shared/hooks/useViewMode";

export default function Loading() {
  const [viewMode] = useViewMode("tasks", "list");
  return <TasksSkeleton viewMode={viewMode} />;
}
