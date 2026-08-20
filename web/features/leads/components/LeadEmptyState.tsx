"use client";

import React from "react";
import { Users, Plus, Upload, FilterX } from "lucide-react";
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
  searchQuery,
  hasFilters,
  onResetAll,
  onClearFilters,
  onClearSearch,
  onAddLead,
  onImport,
  className,
}: LeadEmptyStateProps) {
  const isBrandNew = totalLeads === 0;

  if (isBrandNew) {
    return (
      <EmptyState
        module="leads"
        action={
          onAddLead
            ? {
                label: "Create Lead",
                onClick: onAddLead,
                icon: Plus,
              }
            : undefined
        }
        secondaryAction={
          onImport
            ? {
                label: "Import Leads",
                onClick: onImport,
                icon: Upload,
              }
            : undefined
        }
        className={className}
      />
    );
  }

  const handleReset = onResetAll || onClearFilters || onClearSearch;

  return (
    <EmptyState
      icon={Users}
      title="No leads found"
      description={
        searchQuery || hasFilters
          ? "No leads match the current filters or search criteria. Try resetting your query."
          : "No leads match the current selection."
      }
      action={
        handleReset
          ? {
              label: "Clear Filters",
              onClick: handleReset,
              icon: FilterX,
              variant: "outline",
            }
          : undefined
      }
      className={className}
    />
  );
}
