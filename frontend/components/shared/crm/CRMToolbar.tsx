"use client";

import { Search, List, Grid, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CRMToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  viewMode?: "list" | "grid";
  setViewMode?: (mode: "list" | "grid") => void;
  onFilterClick?: () => void;
  children?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export const CRMToolbar = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onFilterClick,
  children,
  placeholder = "Search...",
  className,
}: CRMToolbarProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-card/50 backdrop-blur-sm border border-[var(--crm-border-subtle)] rounded-2xl shadow-sm mb-6",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-9 h-10 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          />
        </div>
        
        {onFilterClick && (
          <Button variant="ghost" size="sm" onClick={onFilterClick} className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {children}
        
        {viewMode && setViewMode && (
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
