"use client";

import {
  Search,
  SlidersHorizontal,
  List,
  Calendar as CalendarIcon,
  Kanban,
  GanttChart,
  Star,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  viewMode: "list" | "kanban" | "calendar" | "timeline";
  setViewMode: (mode: "list" | "kanban" | "calendar" | "timeline") => void;
}

const VIEW_MODES = [
  { id: "list", icon: List, label: "List" },
  { id: "kanban", icon: Kanban, label: "Board" },
  { id: "calendar", icon: CalendarIcon, label: "Calendar" },
  { id: "timeline", icon: GanttChart, label: "Timeline" },
];

const TaskFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
}: TaskFiltersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col xl:flex-row items-center justify-between gap-3 p-2 bg-card/50 backdrop-blur-sm border border-[var(--crm-border-subtle)] rounded-[var(--crm-card-radius)] shadow-sm"
    >
      <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto flex-1">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search tasks, descriptions, assignees..."
            className="w-full bg-transparent pl-9 h-10 border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Custom views */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-9">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/60" />
                Saved Views
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 p-1.5 rounded-[var(--crm-card-radius)] border-border shadow-xl"
            >
              <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer text-xs font-medium">
                <Star className="w-3.5 h-3.5 mr-2 text-amber-500" />
                My Urgent Tasks
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer text-xs font-medium">
                <Star className="w-3.5 h-3.5 mr-2 text-blue-500" />
                Recently Updated
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer text-xs font-semibold text-primary">
                <Plus className="w-3.5 h-3.5 mr-2" />
                Save Current View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-5 bg-border hidden md:block" />

          {/* Status select */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="relative w-36 h-9 pl-9 text-xs font-semibold border-border/60 bg-transparent rounded-lg focus:ring-primary/20">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-[var(--crm-card-radius)] border-border shadow-xl p-1">
              <SelectItem value="all" className="rounded-lg text-xs font-medium">All Status</SelectItem>
              <SelectItem value="pending" className="rounded-lg text-xs font-medium">Pending</SelectItem>
              <SelectItem value="in-progress" className="rounded-lg text-xs font-medium">In Progress</SelectItem>
              <SelectItem value="completed" className="rounded-lg text-xs font-medium">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View mode toggles */}
      <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/50 w-full xl:w-auto justify-between md:justify-start">
        {VIEW_MODES.map((mode) => (
          <Button
            key={mode.id}
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(mode.id as any)}
            className={cn(
              "flex-1 md:flex-none h-8 gap-1.5 px-3 text-xs font-semibold transition-all duration-200",
              viewMode === mode.id
                ? "bg-card shadow-sm text-primary hover:bg-card hover:text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <mode.icon className="w-3.5 h-3.5" />
            <span className={cn(viewMode === mode.id ? "inline" : "hidden md:inline")}>
              {mode.label}
            </span>
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default TaskFilters;
