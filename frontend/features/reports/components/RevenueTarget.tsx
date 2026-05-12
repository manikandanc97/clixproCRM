"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { motion } from "framer-motion";
import { Target, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { EmptyStateCard } from "@/shared/components/page-states";
import { RevenueTargetType } from "@/shared/types/report";

const RevenueTarget = ({ data }: { data: RevenueTargetType | null }) => {
  if (!data) {
    return <EmptyStateCard title="No revenue target" message="Revenue target data will appear when it is available from the backend." />;
  }

  const currentRevenue = data.revenue;
  const targetRevenue = data.target;
  const percentage = Math.round((currentRevenue / targetRevenue) * 100);
  const remaining = targetRevenue - currentRevenue;

  return (
    <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md min-w-0">
      <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between min-w-0">
        <div className="space-y-0.5 min-w-0">
          <CardTitle className="font-bold text-foreground text-lg tracking-tight truncate">Q2 Goal Progress</CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-medium truncate">
            <Calendar className="w-3 h-3" />
            Database target
          </div>
        </div>
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <Target className="w-5 h-5" />
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-4 flex flex-col space-y-6 min-w-0">
        <div className="space-y-6 min-w-0">
          <div className="flex items-end justify-between min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1 truncate">Current Revenue</p>
              <h3 className="text-3xl font-bold text-foreground tracking-tight truncate">${(currentRevenue/1000).toFixed(0)}k</h3>
            </div>
            <div className="text-right min-w-0">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1 truncate">Target</p>
              <h4 className="text-lg font-bold text-muted-foreground tracking-tight truncate">${(targetRevenue/1000).toFixed(0)}k</h4>
            </div>
          </div>

          <div className="space-y-3 min-w-0">
            <div className="flex justify-between items-center mb-1 min-w-0">
              <span className="text-xs font-bold text-foreground truncate">{percentage}% Achieved</span>
              <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px] uppercase shrink-0">
                <ArrowUpRight className="w-3 h-3" />
                {data.positive ? "On Track" : "Needs Attention"}
              </div>
            </div>
            <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 shadow-inner min-w-0">
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

        <div className="grid grid-cols-2 gap-3 min-w-0">
          <div className="p-4 bg-muted rounded-xl space-y-0.5 min-w-0">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">Remaining</p>
            <p className="text-base font-bold text-foreground truncate">${(remaining/1000).toFixed(0)}k</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl space-y-0.5 min-w-0">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider truncate">Change</p>
            <p className="text-base font-bold text-indigo-600 truncate">{data.change}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueTarget;












