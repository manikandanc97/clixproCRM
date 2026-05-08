"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronRight, TrendingUp } from "lucide-react";

const SalesFunnel = () => {
  const funnelData = [
    { stage: "Leads", count: 1240, percentage: 100, color: "bg-blue-500" },
    { stage: "Qualified", count: 860, percentage: 69, color: "bg-blue-400" },
    { stage: "Proposal", count: 420, percentage: 34, color: "bg-blue-300" },
    { stage: "Negotiation", count: 180, percentage: 14, color: "bg-blue-200" },
    { stage: "Closed Won", count: 96, percentage: 8, color: "bg-emerald-500" },
  ];

  return (
    <Card className="bg-white rounded-xl border-slate-200/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-bold text-slate-900 text-lg tracking-tight">Sales Funnel</CardTitle>
          <div className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            7.7% Conv.
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="space-y-3">
          {funnelData.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-600">{item.stage}</span>
                <span className="text-[10px] font-bold text-slate-900">{item.count}</span>
              </div>
              <div className="h-8 w-full bg-slate-50 rounded-lg overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={`${item.color} h-full relative group cursor-pointer hover:brightness-110 transition-all`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1),transparent)]" />
                </motion.div>
                <div className="flex-1 flex items-center justify-end pr-2">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{item.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-900">Funnel Efficiency</p>
            <p className="text-[9px] text-slate-500">Up 2.4% vs last Q</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesFunnel;
