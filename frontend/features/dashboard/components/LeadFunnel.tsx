"use client";

import { motion } from "framer-motion";
import { CRMCard } from "@/shared/components/crm/CRMCard";
import { CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Filter, ChevronRight } from "lucide-react";
import { useAnalytics } from "@/shared/hooks/use-analytics";
import { DashboardWidgetSkeleton } from "@/shared/components/skeletons";

export default function LeadFunnel({ loading: externalLoading }: { loading?: boolean }) {
  const { data, isLoading: internalLoading } = useAnalytics();
  const loading = externalLoading || internalLoading;
  const stages = data?.pipelineStages ?? [];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full"
      >
        <DashboardWidgetSkeleton rows={4} />
      </motion.div>
    );
  }

  const maxCount = stages.length > 0 ? stages[0].count : 1;
  const funnelData = stages.map((item, index) => {
    const width = `${Math.max(15, Math.round((item.count / (maxCount || 1)) * 100))}%`;
    const conversion = index === 0 ? null : `${Math.round((item.count / (maxCount || 1)) * 100)}%`;
    const colors = ["bg-blue-500", "bg-[#8B5CF6]", "bg-[#A855F7]", "bg-[#10B981]"];
    
    return {
      stage: item.stage,
      count: item.count,
      color: colors[index % colors.length],
      width,
      conversion
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full h-full min-w-0"
    >
      <CRMCard 
        accentSeed="Lead Funnel"
        noPadding
        className="h-full flex flex-col bg-gradient-to-br from-card to-background/50 min-w-0"
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl dark:bg-blue-500/10 shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-bold truncate">Conversion Funnel</CardTitle>
          </div>
          <button className="text-muted-foreground hover:text-muted-foreground transition-colors p-2 hover:bg-muted rounded-xl shrink-0">
            <ChevronRight className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6 flex-1 min-w-0">
          <div className="space-y-5 flex flex-col min-w-0">
            {funnelData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
                <Filter className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">No funnel data yet</p>
              </div>
            ) : (
              funnelData.map((item, index) => (
                <motion.div 
                  key={item.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                  className="group relative min-w-0"
                >
                  <div className="flex justify-between items-center mb-2 min-w-0 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[13px] font-bold text-foreground dark:text-slate-200 truncate">{item.stage}</span>
                      {item.conversion && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted dark:bg-slate-800 text-muted-foreground dark:text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300 shrink-0">
                          {item.conversion}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-foreground dark:text-white tracking-tight shrink-0">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full bg-muted dark:bg-slate-800/50 rounded-lg overflow-hidden flex justify-start min-w-0">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: item.width }}
                      transition={{ duration: 1, delay: 0.8 + (index * 0.1), type: "spring", stiffness: 40, damping: 15 }}
                      className={`h-full rounded-lg ${item.color} relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                    </motion.div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </CRMCard>
    </motion.div>
  );
}












