"use client";

import { useState, useMemo } from "react";
import { LeadType } from "@/shared/types/lead";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";

export function useLeads(leads: LeadType[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LeadType | "score";
    direction: "asc" | "desc";
  } | null>(null);

  const { deleteLead } = useCRMStore();

  const sortedLeads = useMemo(() => {
    if (!sortConfig) return leads;
    return [...leads].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [leads, sortConfig]);

  const handleSort = (key: keyof LeadType | "score") => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (id: string, name: string) => {
    deleteLead(id);
    toast.error("Lead Deleted", {
      description: `${name} has been removed from the CRM.`,
    });
  };

  return {
    sortedLeads,
    selectedIds,
    setSelectedIds,
    expandedId,
    sortConfig,
    handleSort,
    toggleSelectAll,
    toggleSelect,
    toggleExpand,
    handleDelete,
  };
}





