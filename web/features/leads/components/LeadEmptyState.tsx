"use client";

import React from "react";
import { Users, Plus } from "lucide-react";
import { EmptyState, EmptyStateAction } from "@/shared/components/EmptyState";

export interface ActiveFilter {
  label: string;
  value: string;
}

export interface LeadEmptyStateProps {
  totalLeads: number;
  searchQuery?: string;
  hasFilters?: boolean;
  activeFilters?: ActiveFilter[];
  isAssignmentEmpty?: boolean;
  isTagEmpty?: boolean;
  
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  onResetAll?: () => void;
  onAddLead?: () => void;
  onImport?: () => void;
  onAssign?: () => void;
  
  className?: string;
}

export function LeadEmptyState({
  totalLeads,
  onAddLead,
  className
}: LeadEmptyStateProps) {
  const isBrandNew = totalLeads === 0;

  const title = isBrandNew ? "No leads yet" : "No leads found";
  const description = isBrandNew
    ? "Get started by creating your first lead or importing existing contacts."
    : "No leads match the current search or filters.";

  const action: EmptyStateAction | undefined = isBrandNew && onAddLead ? {
    label: "Add First Lead",
    onClick: onAddLead,
    icon: Plus
  } : undefined;

  return (
    <EmptyState
      icon={Users}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}
