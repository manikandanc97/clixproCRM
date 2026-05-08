import { Plus, Download, Sparkles, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const QuotationsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Quotations</h1>
          <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
            Enterprise
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <p className="text-sm font-medium">Manage your revenue pipeline with intelligence.</p>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase">
            <RefreshCcw className="w-3 h-3 animate-spin-slow" />
            Last synced: Just now
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 w-full md:w-auto"
      >
        <Button variant="outline" className="flex-1 md:flex-none rounded-2xl border-slate-200 h-12 px-6 font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        
        <Button variant="outline" className="hidden lg:flex flex-1 md:flex-none rounded-2xl border-indigo-100 h-12 px-6 font-bold text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm group">
          <Sparkles className="w-4 h-4 mr-2 text-indigo-500 group-hover:rotate-12 transition-transform" />
          AI Summary
        </Button>

        <Button className="flex-1 md:flex-none rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-200 h-12 px-8 font-black transition-all active:scale-95 group">
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          New Quotation
        </Button>
      </motion.div>
    </div>
  );
};

export default QuotationsHeader;
