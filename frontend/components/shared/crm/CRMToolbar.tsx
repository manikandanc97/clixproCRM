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
        "crm-toolbar",
        className
      )}
    >
      <div className="flex w-full flex-1 items-center gap-3 sm:w-auto">
        <div className="relative flex-1 sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="h-10 border-transparent bg-muted/40 pl-9 shadow-none focus-visible:border-primary focus-visible:bg-background"
          />
        </div>
        
        {onFilterClick && (
          <Button variant="outline" size="sm" onClick={onFilterClick} className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        )}
      </div>

      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
        {children}
        
        {viewMode && setViewMode && (
          <div className="crm-segment">
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
