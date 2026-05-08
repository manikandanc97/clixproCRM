import { Search, SlidersHorizontal, LayoutGrid, List, X, Filter, Calendar, DollarSign, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuotationFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const QuotationFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: QuotationFiltersProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activePresets] = useState(["Recent Drafts", "High Value", "Expiring Soon"]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-4 rounded-xl border border-slate-200/60 shadow-xl shadow-slate-200/20">
        <div className="relative flex-1 w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 transition-colors group-focus-within:text-emerald-500" />
          <Input
            placeholder="Search by quote #, client, or project..."
            className="w-full bg-slate-50/50 pl-11 pr-4 py-6 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-2xl outline-none transition-all duration-300 shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`h-12 rounded-2xl border-slate-200 font-bold text-slate-600 transition-all ${isAdvancedOpen ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <div className="relative flex-1 md:flex-none">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44 bg-white pl-10 pr-4 py-6 border-slate-200 rounded-2xl focus:ring-emerald-500/20 font-bold text-slate-700 text-sm h-auto text-left shadow-sm">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                </div>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                <SelectItem value="all" className="rounded-xl">All Status</SelectItem>
                <SelectItem value="pending" className="rounded-xl">Pending</SelectItem>
                <SelectItem value="approved" className="rounded-xl">Approved</SelectItem>
                <SelectItem value="rejected" className="rounded-xl">Rejected</SelectItem>
                <SelectItem value="expired" className="rounded-xl">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="hidden lg:flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-md text-emerald-600">
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600">
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdvancedOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-slate-200/40 border-dashed">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Value Range</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input placeholder="Min" className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm" />
                  </div>
                  <span className="text-slate-300">-</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input placeholder="Max" className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type="date" className="pl-10 bg-white border-slate-200 rounded-xl h-10 text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Creator</label>
                <Select>
                  <SelectTrigger className="bg-white border-slate-200 rounded-xl h-10 text-sm">
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="me">Me only</SelectItem>
                    <SelectItem value="team">My Team</SelectItem>
                    <SelectItem value="all">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-2 px-1">
        <div className="flex items-center gap-1.5 text-slate-400 mr-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Presets:</span>
        </div>
        {activePresets.map((preset) => (
          <button 
            key={preset}
            className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
          >
            {preset}
          </button>
        ))}
        <button className="px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-[11px] font-bold text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-all">
          + Save Current
        </button>
      </div>
    </div>
  );
};

export default QuotationFilters;
