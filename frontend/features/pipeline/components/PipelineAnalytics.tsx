"use client";

import { TrendingUp, Target, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { motion } from "framer-motion";

interface PipelineAnalyticsProps {
  stats: PipelineMetricType[];
}

const PipelineAnalytics = ({ stats }: PipelineAnalyticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Forecast Card */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 border-none shadow-lg shadow-emerald-100 overflow-hidden group">
        <CardContent className="p-5 relative">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp size={120} />
          </div>
          <div className="flex items-center gap-2 text-emerald-100/80 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Revenue Forecast</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white tabular-nums">$124,500</h3>
            <span className="text-[10px] font-bold text-emerald-200 bg-white/10 px-1.5 py-0.5 rounded-md">+12.5%</span>
          </div>
          <p className="text-[10px] text-emerald-100/60 mt-2 font-medium">Weighted value based on probability</p>
        </CardContent>
      </Card>

      {/* Conversion Card */}
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden hover:shadow-md transition-all group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Conversion rate</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-foreground tabular-nums">24.8%</h3>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "24.8%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Avg. lead to won conversion</p>
        </CardContent>
      </Card>

      {/* Average Deal Age */}
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden hover:shadow-md transition-all">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Avg. Deal Cycle</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground tabular-nums">18 Days</h3>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full ${i < 3 ? 'bg-amber-400' : 'bg-muted'}`} 
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">3 days faster than last month</p>
        </CardContent>
      </Card>

      {/* Next Step Prediction */}
      <Card className="bg-slate-900 border-none shadow-lg overflow-hidden group">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Recommendation</span>
          </div>
          <p className="text-slate-200 text-xs font-medium leading-relaxed mb-3">
            3 deals in <span className="text-emerald-400 font-bold">Proposal</span> stage are at risk. Send follow-up today.
          </p>
          <button className="flex items-center gap-2 text-[10px] font-bold text-white hover:text-emerald-400 transition-colors">
            VIEW RECOMMENDED ACTIONS
            <ArrowRight className="w-3 h-3" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineAnalytics;
import { PipelineMetricType } from "@/shared/types/pipeline";












