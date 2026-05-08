"use client";

import { Download, UserPlus, Sparkles, Database, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const CustomersHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Database className="w-5 h-5" />
          </div>
          <Badge variant="outline" className="border-indigo-100 bg-indigo-50/50 text-indigo-600 rounded-lg font-black text-[10px] px-2 py-0.5 uppercase tracking-widest">
            Relationship Intelligence
          </Badge>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">Insights</span>
        </h1>
        <p className="text-slate-500 font-medium flex items-center gap-2 max-w-md">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          Real-time relationship intelligence and behavioral analytics for your entire customer base.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 w-full md:w-auto"
      >
        <Button variant="outline" className="flex-1 md:flex-none rounded-2xl border-slate-200 bg-white h-12 px-6 font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          Export Data
        </Button>
        <Button className="flex-1 md:flex-none rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-[0_10px_20px_rgba(79,70,229,0.2)] h-12 px-6 font-bold transition-all active:scale-95 flex items-center gap-2 group">
          <UserPlus className="w-4 h-4 transition-transform group-hover:rotate-12" />
          Add Customer
        </Button>
      </motion.div>
    </div>
  );
};

export default CustomersHeader;
