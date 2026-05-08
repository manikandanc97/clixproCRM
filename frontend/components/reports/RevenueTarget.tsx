"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Target, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const RevenueTarget = () => {
  const currentRevenue = 142000;
  const targetRevenue = 180000;
  const percentage = Math.round((currentRevenue / targetRevenue) * 100);
  const remaining = targetRevenue - currentRevenue;

  return (
    <Card className="bg-white rounded-xl border-slate-200/60 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
      <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="font-bold text-slate-900 text-lg tracking-tight">Q2 Goal Progress</CardTitle>
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium">
            <Calendar className="w-3 h-3" />
            Ends in 24 days
          </div>
        </div>
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <Target className="w-5 h-5" />
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-4 flex flex-col space-y-6">
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Current Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">${(currentRevenue/1000).toFixed(0)}k</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Target</p>
              <h4 className="text-lg font-bold text-slate-400 tracking-tight">${(targetRevenue/1000).toFixed(0)}k</h4>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-900">{percentage}% Achieved</span>
              <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px] uppercase">
                <ArrowUpRight className="w-3 h-3" />
                On Track
              </div>
            </div>
            <div className="relative h-3 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full shadow-lg shadow-indigo-100 relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]" />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-50 rounded-2xl space-y-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Remaining</p>
            <p className="text-base font-bold text-slate-900">${(remaining/1000).toFixed(0)}k</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-2xl space-y-0.5">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Avg. Needed</p>
            <p className="text-base font-bold text-indigo-600">${(remaining/24/1000).toFixed(1)}k/d</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueTarget;
