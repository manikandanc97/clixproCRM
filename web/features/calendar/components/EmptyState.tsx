"use client";

import React from "react";
import { Plus } from "lucide-react";
import { EmptyState as GlobalEmptyState } from "@/shared/components/EmptyState";

interface EmptyStateProps {
  onNewEvent: () => void;
  className?: string;
}

export function EmptyState({ onNewEvent, className }: EmptyStateProps) {
  return (
    <GlobalEmptyState
      module="meetings"
      action={{
        label: "Schedule Meeting",
        onClick: onNewEvent,
        icon: Plus,
      }}
      className={className}
    />
  );
}
