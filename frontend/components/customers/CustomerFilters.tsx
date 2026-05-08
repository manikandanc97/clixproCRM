"use client";

import { Search, SlidersHorizontal, LayoutGrid, List, Filter, Sparkles, X } from "lucide-react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface CustomerFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  segmentFilter?: string;
  setSegmentFilter?: (segment: string) => void;
  healthFilter?: string;
  setHealthFilter?: (health: string) => void;
}

const CustomerFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  segmentFilter = "all",
  setSegmentFilter = () => {},
  healthFilter = "all",
  setHealthFilter = () => {},
}: CustomerFiltersProps) => {
  const activeFiltersCount = [
    statusFilter !== "all",
    segmentFilter !== "all",
    healthFilter !== "all"
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-4 rounded-xl border border-slate-200/60 shadow-sm">
      <div className="relative flex-1 w-full md:max-w-md group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-indigo-50 group-focus-within:text-indigo-600 transition-all duration-300 z-10">
          <Search className="w-4 h-4" />
        </div>
        <Input
          placeholder="Search customers, companies, or insights..."
          className="w-full bg-slate-50/50 pl-14 pr-4 py-7 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl outline-none transition-all duration-500 shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-white/50 pl-10 pr-4 py-6 border-slate-200/60 rounded-2xl focus:ring-indigo-500/20 font-semibold text-slate-700 text-sm h-auto hover:bg-white transition-all shadow-sm">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1">
              <SelectItem value="all" className="rounded-xl">All Status</SelectItem>
              <SelectItem value="premium" className="rounded-xl">Premium</SelectItem>
              <SelectItem value="active" className="rounded-xl">Active</SelectItem>
              <SelectItem value="inactive" className="rounded-xl">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-auto py-3 px-4 rounded-2xl border-slate-200/60 bg-white/50 hover:bg-white relative flex items-center gap-2 font-semibold text-slate-700 shadow-sm">
                <Filter className="w-4 h-4 text-slate-400" />
                <span>Filters</span>
                <AnimatePresence>
                  {activeFiltersCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge className="bg-indigo-600 text-white border-none h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                        {activeFiltersCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-xl border-slate-200 shadow-2xl p-6" align="end">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Intelligence Filters
                  </h3>
                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setStatusFilter("all");
                        setSegmentFilter("all");
                        setHealthFilter("all");
                      }}
                      className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Segment</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Enterprise", "Growth", "SMB", "VIP"].map((seg) => (
                        <Button
                          key={seg}
                          variant="outline"
                          size="sm"
                          onClick={() => setSegmentFilter(segmentFilter === seg ? "all" : seg)}
                          className={`rounded-xl h-10 font-bold border-slate-100 ${segmentFilter === seg ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          {seg}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Score</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "high", label: "Good (80+)", color: "emerald" },
                        { id: "low", label: "At Risk (<40)", color: "rose" }
                      ].map((h) => (
                        <Button
                          key={h.id}
                          variant="outline"
                          size="sm"
                          onClick={() => setHealthFilter(healthFilter === h.id ? "all" : h.id)}
                          className={`rounded-xl h-10 font-bold border-slate-100 ${healthFilter === h.id ? `bg-${h.color}-50 border-${h.color}-200 text-${h.color}-600 shadow-inner` : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          {h.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium italic">Advanced AI sorting applied</span>
                  <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-6">
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="h-10 w-px bg-slate-200 mx-1 hidden md:block" />

        <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl shadow-inner border border-slate-200/30">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm text-indigo-600 scale-105 transition-all">
            <List className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-600 transition-all opacity-50">
            <LayoutGrid className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters;
