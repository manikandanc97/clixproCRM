"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Rocket, 
  SearchX, 
  Filter, 
  Inbox, 
  Users, 
  Tag, 
  X,
  Plus,
  UploadCloud,
  RefreshCw
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

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
  activeFilters = [],
  isAssignmentEmpty,
  isTagEmpty,
  onClearSearch,
  onClearFilters,
  onResetAll,
  onAddLead,
  onImport,
  onAssign,
  className
}: LeadEmptyStateProps) {
  // Determine the State Type
  const isBrandNew = totalLeads === 0;
  const isSearchEmpty = !!searchQuery && !hasFilters;
  const isFilterEmpty = hasFilters && !searchQuery;
  const isCombinedEmpty = !!searchQuery && hasFilters;

  let stateConfig = {
    icon: Inbox,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    heading: "No leads found",
    description: "We couldn't find any leads matching your criteria.",
    primaryCTA: null as React.ReactNode,
    secondaryCTA: null as React.ReactNode,
  };

  if (isBrandNew) {
    stateConfig = {
      icon: Rocket,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
      heading: "Welcome! Your pipeline is empty",
      description: "Start building your sales pipeline by adding your first lead or importing existing contacts.",
      primaryCTA: onAddLead && (
        <Button onClick={onAddLead} className="gap-2 shadow-sm rounded-xl font-semibold px-6 h-11">
          <Plus className="w-4 h-4" /> Add First Lead
        </Button>
      ),
      secondaryCTA: onImport && (
        <Button onClick={onImport} variant="outline" className="gap-2 rounded-xl font-semibold px-6 h-11 hover:bg-muted transition-colors">
          <UploadCloud className="w-4 h-4" /> Import Leads
        </Button>
      )
    };
  } else if (isAssignmentEmpty) {
    stateConfig = {
      icon: Users,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10",
      heading: "No Assigned Leads",
      description: "No leads are currently assigned to this user.",
      primaryCTA: onAssign && (
        <Button onClick={onAssign} className="gap-2 shadow-sm rounded-xl font-semibold px-6 h-11">
          <Users className="w-4 h-4" /> Assign Leads
        </Button>
      ),
      secondaryCTA: null
    };
  } else if (isTagEmpty) {
    stateConfig = {
      icon: Tag,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
      heading: "No Tagged Leads",
      description: "No leads were found with this tag.",
      primaryCTA: onClearFilters && (
        <Button onClick={onClearFilters} className="gap-2 shadow-sm rounded-xl font-semibold px-6 h-11">
          <X className="w-4 h-4" /> Clear Filter
        </Button>
      ),
      secondaryCTA: null
    };
  } else if (isCombinedEmpty) {
    stateConfig = {
      icon: SearchX,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/10",
      heading: "No matching leads",
      description: "No leads match your search and selected filters.",
      primaryCTA: onResetAll && (
        <Button onClick={onResetAll} variant="destructive" className="gap-2 shadow-sm rounded-xl font-semibold px-6 h-11">
          <RefreshCw className="w-4 h-4" /> Reset All
        </Button>
      ),
      secondaryCTA: (
        <div className="flex gap-3">
          {onClearSearch && (
            <Button onClick={onClearSearch} variant="outline" className="gap-2 rounded-xl font-semibold h-11 hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors">
              Clear Search
            </Button>
          )}
          {onClearFilters && (
            <Button onClick={onClearFilters} variant="outline" className="gap-2 rounded-xl font-semibold h-11 hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors">
              Clear Filters
            </Button>
          )}
        </div>
      )
    };
  } else if (isSearchEmpty) {
    stateConfig = {
      icon: SearchX,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
      heading: "No results found",
      description: `We couldn't find any leads matching "${searchQuery}".`,
      primaryCTA: onClearSearch && (
        <Button onClick={onClearSearch} variant="destructive" className="gap-2 shadow-sm rounded-xl font-semibold px-6 h-11">
          <X className="w-4 h-4" /> Clear Search
        </Button>
      ),
      secondaryCTA: null
    };
  } else if (isFilterEmpty) {
    stateConfig = {
      icon: Filter,
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/10",
      heading: "No leads match filters",
      description: "There are no leads matching your current filter selections.",
      primaryCTA: onClearFilters && (
        <Button onClick={onClearFilters} variant="destructive" className="gap-2 shadow-sm rounded-xl font-semibold px-6 h-11">
          <Filter className="w-4 h-4" /> Clear Filters
        </Button>
      ),
      secondaryCTA: null
    };
  }

  const Icon = stateConfig.icon;

  return (
    <div className={cn("w-full flex justify-center py-6", className)}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-[650px] bg-card rounded-2xl border border-border/60 shadow-sm p-10 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 opacity-20 blur-3xl pointer-events-none", stateConfig.iconBg)} />

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3, type: "spring" }}
          className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border/50 backdrop-blur-sm relative z-10", stateConfig.iconBg)}
        >
          <Icon className={cn("w-10 h-10", stateConfig.iconColor)} strokeWidth={1.5} />
        </motion.div>

        <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10 tracking-tight">
          {stateConfig.heading}
        </h3>
        
        <p className="text-muted-foreground text-base max-w-[450px] mb-8 relative z-10 font-medium leading-relaxed">
          {stateConfig.description}
        </p>

        {/* Context Information Chips */}
        {activeFilters.length > 0 && !isBrandNew && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 relative z-10 bg-muted/30 p-4 rounded-xl border border-border/30 w-full max-w-[500px]">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">
              Active Context:
            </span>
            {searchQuery && (
              <Badge variant="secondary" className="bg-background border-border shadow-sm text-xs py-1 px-3">
                <span className="opacity-50 font-normal mr-1.5">Search:</span> "{searchQuery}"
              </Badge>
            )}
            {activeFilters.map((filter, i) => (
              <Badge key={i} variant="secondary" className="bg-background border-border shadow-sm text-xs py-1 px-3">
                <span className="opacity-50 font-normal mr-1.5">{filter.label}:</span> {filter.value}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3.5 relative z-10">
          {stateConfig.secondaryCTA}
          {stateConfig.primaryCTA}
        </div>
      </motion.div>
    </div>
  );
}
