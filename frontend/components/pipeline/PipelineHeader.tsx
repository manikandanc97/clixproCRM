import { Plus, Download, DollarSign, Users, Briefcase, LucideIcon, Filter, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineMetricType } from "@/types/pipeline";
import PipelineAnalytics from "./PipelineAnalytics";

interface PipelineHeaderProps {
  stats: PipelineMetricType[];
}

const PipelineHeader = ({ stats }: PipelineHeaderProps) => {
  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
               <Layers className="w-5 h-5" />
             </div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sales Pipeline</h1>
          </div>
          <p className="text-slate-500 font-medium">Visualizing {stats.find(s => s.title === "Active Deals")?.value || "your"} active deals across the sales funnel.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
             <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-slate-600 bg-white shadow-sm">Kanban</Button>
             <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600">List View</Button>
          </div>
          
          <div className="w-px h-8 bg-slate-200 mx-1" />
          
          <Button variant="outline" className="rounded-2xl border-slate-200 h-11 px-5 font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          
          <Button variant="outline" className="rounded-2xl border-slate-200 h-11 px-5 font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 h-11 px-6 font-bold transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Intelligence Analytics */}
      <PipelineAnalytics stats={stats} />
    </div>
  );
};

export default PipelineHeader;
