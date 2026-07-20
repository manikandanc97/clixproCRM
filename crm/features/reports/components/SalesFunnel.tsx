"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { EmptyStateCard } from "@/shared/components/page-states";
import { FunnelPointType } from "@/shared/types/report";

const colors = ["bg-blue-500", "bg-blue-400", "bg-blue-300", "bg-blue-200", "bg-emerald-500"];

const SalesFunnel = ({ data }: { data: FunnelPointType[] }) => {
  const conversion = data.length > 1 && data[0].count > 0
    ? Math.round((data[data.length - 1].count / data[0].count) * 1000) / 10
    : 0;
  return (
    <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md min-w-0">
      <CardHeader className="p-6 pb-2 min-w-0">
        <div className="flex items-center justify-between min-w-0">
          <CardTitle className="font-bold text-foreground text-lg tracking-tight truncate">Sales Funnel</CardTitle>
          <div className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            {conversion}% Conv.
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 min-w-0">
        <div className="space-y-3 min-w-0">
          {data.length === 0 ? (
            <EmptyStateCard title="No funnel data" message="Funnel metrics will appear after leads are added to the database." />
          ) : data.map((item, idx) => (
            <div key={idx} className="relative min-w-0">
              <div className="flex justify-between items-center mb-1 px-1 min-w-0">
                <span className="text-[10px] font-bold text-muted-foreground truncate">{item.stage}</span>
                <span className="text-[10px] font-bold text-foreground shrink-0">{item.count}</span>
              </div>
              <div className="h-8 w-full bg-muted rounded-lg overflow-hidden flex min-w-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={`${colors[idx % colors.length]} h-full relative group cursor-pointer hover:brightness-110 transition-all min-w-0`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1),transparent)]" />
                </motion.div>
                <div className="flex-1 flex items-center justify-end pr-2 min-w-0">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{item.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.length > 0 && <div className="mt-6 p-3 bg-muted rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-foreground">Funnel Efficiency</p>
            <p className="text-[9px] text-muted-foreground">Based on current pipeline data</p>
          </div>
        </div>}
      </CardContent>
    </Card>
  );
};

export default SalesFunnel;












