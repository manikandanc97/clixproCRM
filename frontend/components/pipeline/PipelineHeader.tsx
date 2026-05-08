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
             <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
               <Layers className="w-5 h-5" />
             </div>
             <h1 className="text-3xl font-bold text-foreground tracking-tight">Sales Pipeline</h1>
          </div>
          <p className="text-muted-foreground font-medium">Visualizing {stats.find(s => s.title === "Active Deals")?.value || "your"} active deals across the sales funnel.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-muted p-1 rounded-xl border border-border">
             <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-muted-foreground bg-white shadow-sm">Kanban</Button>
             <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-muted-foreground hover:text-muted-foreground">List View</Button>
          </div>
          
          <div className="w-px h-8 bg-slate-200 mx-1" />
          
          <Button variant="outline" className="rounded-xl border-border h-11 px-5 font-semibold text-muted-foreground hover:bg-muted shadow-sm transition-all active:scale-95">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          
          <Button variant="outline" className="rounded-xl border-border h-11 px-5 font-semibold text-muted-foreground hover:bg-muted shadow-sm transition-all active:scale-95">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-elevated shadow-slate-200 h-11 px-6 font-bold transition-all active:scale-95 flex items-center gap-2">
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
