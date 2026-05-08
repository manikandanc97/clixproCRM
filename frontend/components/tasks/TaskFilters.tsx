import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon, 
  Kanban, 
  GanttChart,
  ChevronDown,
  Star,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  viewMode: "list" | "kanban" | "calendar" | "timeline";
  setViewMode: (mode: "list" | "kanban" | "calendar" | "timeline") => void;
}

const TaskFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
}: TaskFiltersProps) => {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-between gap-4 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto flex-1">
        <div className="relative flex-1 w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="Search tasks, descriptions, assignees..."
            className="w-full bg-slate-50/50 pl-11 pr-4 h-10 border-transparent focus:border-emerald-500/30 focus:bg-white rounded-lg outline-none transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Custom Views
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-1.5 rounded-xl border-slate-200 shadow-xl">
              <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer text-xs font-medium">
                <Star className="w-3.5 h-3.5 mr-2 text-amber-500" /> My Urgent Tasks
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer text-xs font-medium">
                <Star className="w-3.5 h-3.5 mr-2 text-blue-500" /> Recently Updated
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer text-emerald-600 font-bold text-xs">
                <Plus className="w-3.5 h-3.5 mr-2" /> Save Current View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-[1px] h-6 bg-slate-100 hidden md:block" />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-white pl-10 pr-4 h-9 border-slate-200 rounded-lg focus:ring-emerald-500/30 font-medium text-slate-700 text-xs text-left shadow-sm">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
              <SelectItem value="all" className="rounded-lg text-xs">All Status</SelectItem>
              <SelectItem value="pending" className="rounded-lg text-xs">Pending</SelectItem>
              <SelectItem value="in-progress" className="rounded-lg text-xs">In Progress</SelectItem>
              <SelectItem value="completed" className="rounded-lg text-xs">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center bg-slate-100/80 p-1 rounded-xl h-10 border border-slate-200/50 w-full xl:w-auto justify-between md:justify-start">
        {[
          { id: "list", icon: List, label: "List" },
          { id: "kanban", icon: Kanban, label: "Kanban" },
          { id: "calendar", icon: CalendarIcon, label: "Calendar" },
          { id: "timeline", icon: GanttChart, label: "Timeline" }
        ].map((mode) => (
          <Button
            key={mode.id}
            variant="ghost"
            size="xs"
            onClick={() => setViewMode(mode.id as any)}
            className={cn(
              "flex-1 md:flex-none transition-all duration-200 gap-2 px-3 tracking-normal normal-case",
              viewMode === mode.id 
                ? "bg-white shadow-sm text-emerald-600 hover:bg-white" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <mode.icon className="w-3.5 h-3.5" />
            <span className={cn(viewMode === mode.id ? "inline" : "hidden md:inline")}>{mode.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TaskFilters;
