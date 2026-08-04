"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ViewToggle, ViewOption } from "./ViewToggle";

interface CRMToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  viewMode?: string;
  setViewMode?: (mode: any) => void;
  viewOptions?: readonly ViewOption[] | ViewOption[];
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
  viewOptions,
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
          <ViewToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            options={viewOptions}
          />
        )}
      </div>
    </motion.div>
  );
};












