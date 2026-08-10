"use client";

import React from "react";
import { CalendarDays, Plus } from "lucide-react";
import { EmptyState as GlobalEmptyState } from "@/shared/components/EmptyState";

interface EmptyStateProps {
  onNewEvent: () => void;
}

export function EmptyState({ onNewEvent }: EmptyStateProps) {
  return (
    <GlobalEmptyState
      icon={CalendarDays}
      title="No meetings scheduled"
      description="No events match the current date range or filters."
      action={{
        label: "Create Event",
        onClick: onNewEvent,
        icon: Plus,
      }}
    />
  );
}
