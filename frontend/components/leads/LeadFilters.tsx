// search + filters

import { Search, SlidersHorizontal, LayoutGrid, List, Calendar, User, Tag, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface LeadFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
}

const LeadFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
}: LeadFiltersProps) => {
  const [activePreset, setActivePreset] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const presets = [
    { id: "all", label: "All Leads" },
    { id: "new", label: "Newly Assigned" },
    { id: "high_score", label: "High Intent (AI)" },
    { id: "no_activity", label: "Needs Follow-up" },
    { id: "won", label: "Won Deals" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Search Section */}
        <div className="relative flex-1 w-full md:max-w-xl group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <Input
            placeholder="Search leads by name, company, or AI attributes..."
            className="w-full bg-slate-50 pl-14 pr-12 py-7 border-slate-200 focus:border-emerald-500/50 focus:bg-white rounded-2xl outline-none transition-all duration-300 text-base font-medium placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <kbd className="hidden md:inline-flex items-center justify-center h-7 w-7 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-400 shadow-sm">⌘</kbd>
            <kbd className="hidden md:inline-flex items-center justify-center h-7 w-7 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-400 shadow-sm">K</kbd>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-52 bg-white pl-12 pr-4 py-7 border-slate-200 rounded-2xl focus:ring-emerald-500/30 font-bold text-slate-700 text-sm h-auto transition-all hover:bg-slate-50">
                <div className="absolute left-5 top-1/2 -translate-y-1/2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                </div>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1">
                <SelectItem value="all" className="rounded-xl py-2.5 font-medium">All Statuses</SelectItem>
                <SelectItem value="new" className="rounded-xl py-2.5 font-medium">New Leads</SelectItem>
                <SelectItem value="contacted" className="rounded-xl py-2.5 font-medium">Contacted</SelectItem>
                <SelectItem value="proposal sent" className="rounded-xl py-2.5 font-medium">Proposal Sent</SelectItem>
                <SelectItem value="won" className="rounded-xl py-2.5 font-medium">Won Deals</SelectItem>
                <SelectItem value="lost" className="rounded-xl py-2.5 font-medium">Lost Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 h-[58px] px-5 rounded-2xl border-slate-200 font-bold transition-all ${showAdvanced ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <Sparkles className={`w-4 h-4 ${showAdvanced ? 'text-emerald-400' : 'text-slate-400'}`} />
            Advanced
          </Button>

          <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl shadow-inner border border-slate-200/30">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("list")}
              className={`h-11 w-11 rounded-xl transition-all duration-300 ${
                viewMode === "list" 
                  ? "bg-white shadow-sm text-slate-900" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <List className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("grid")}
              className={`h-11 w-11 rounded-xl transition-all duration-300 ${
                viewMode === "grid" 
                  ? "bg-white shadow-sm text-slate-900" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-900 rounded-xl shadow-xl border border-slate-800">
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Calendar className="w-3 h-3" /> Date Range
                 </label>
                 <Select defaultValue="last_30">
                   <SelectTrigger className="bg-slate-800 border-slate-700 text-white rounded-xl py-6 focus:ring-emerald-500/30">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-slate-800 border-slate-700 text-white rounded-xl">
                     <SelectItem value="today">Today</SelectItem>
                     <SelectItem value="yesterday">Yesterday</SelectItem>
                     <SelectItem value="last_7">Last 7 Days</SelectItem>
                     <SelectItem value="last_30">Last 30 Days</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Tag className="w-3 h-3" /> Lead Source
                 </label>
                 <Select defaultValue="all">
                   <SelectTrigger className="bg-slate-800 border-slate-700 text-white rounded-xl py-6 focus:ring-emerald-500/30">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-slate-800 border-slate-700 text-white rounded-xl">
                     <SelectItem value="all">All Sources</SelectItem>
                     <SelectItem value="linkedin">LinkedIn</SelectItem>
                     <SelectItem value="website">Website</SelectItem>
                     <SelectItem value="referral">Referral</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <User className="w-3 h-3" /> Sales Rep
                 </label>
                 <Select defaultValue="all">
                   <SelectTrigger className="bg-slate-800 border-slate-700 text-white rounded-xl py-6 focus:ring-emerald-500/30">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-slate-800 border-slate-700 text-white rounded-xl">
                     <SelectItem value="all">Everyone</SelectItem>
                     <SelectItem value="me">Assigned to Me</SelectItem>
                     <SelectItem value="unassigned">Unassigned</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="flex items-end">
                 <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
                   Apply AI Filters
                 </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setActivePreset(preset.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
              activePreset === preset.id
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {preset.id === "high_score" && <Sparkles className="w-3 h-3 inline-block mr-1.5 mb-0.5 text-emerald-500" />}
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeadFilters;
