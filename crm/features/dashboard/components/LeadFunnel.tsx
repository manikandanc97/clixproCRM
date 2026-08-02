"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CRMCard } from "@/shared/components/crm/CRMCard";
import { Filter } from "lucide-react";
import { useAnalytics } from "@/shared/hooks/use-analytics";
import { DashboardWidgetSkeleton } from "@/shared/components/skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

const FUNNEL_STAGES = [
  { id: "New Lead", label: "New Lead", color: "bg-blue-500" },
  { id: "Contacted", label: "Contacted", color: "bg-cyan-500" },
  { id: "Proposal Sent", label: "Proposal Sent", color: "bg-purple-500" },
  { id: "Won", label: "Won", color: "bg-emerald-500" },
];

export default function LeadFunnel({ loading: externalLoading }: { loading?: boolean }) {
  const { data, isLoading: internalLoading } = useAnalytics();
  const loading = externalLoading || internalLoading;
  const [dateFilter, setDateFilter] = useState("This Month");

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

  const rawStages = data?.pipelineStages ?? [];
  const stageDataMap = rawStages.reduce((acc, stage) => {
    acc[stage.stage] = stage.count || 0;
    return acc;
  }, {} as Record<string, number>);

  const maxLeads = Math.max(...FUNNEL_STAGES.map((s) => stageDataMap[s.id] || 0));
  const totalLeads = maxLeads > 0 ? maxLeads : 0;
  const wonCount = stageDataMap["Won"] || 0;
  const overallConversion = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;

  const funnelData = FUNNEL_STAGES.map((stage) => {
    const count = stageDataMap[stage.id] || 0;
    const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
    return {
      ...stage,
      count,
      percentage,
      width: `${percentage}%`,
      isEmpty: count === 0,
    };
  });

  return (
    <div className="w-full h-full min-w-0">
      <CRMCard 
        animate={false}
        accentSeed="Lead Funnel"
        noPadding
        className="h-full flex flex-col bg-card min-w-0 rounded-xl shadow-sm border border-border/50"
      >
        <div className="flex flex-row items-start justify-between p-6 pb-2 min-w-0">
          <div className="flex items-start gap-4 min-w-0">
            <div className="p-2.5 bg-blue-50/50 text-blue-500 rounded-xl dark:bg-blue-500/10 shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <CardTitle className="truncate">Conversion Funnel</CardTitle>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                Overall Conversion: <span className="text-foreground">{overallConversion}%</span>
              </p>
            </div>
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs font-medium">
              <SelectValue placeholder="Select Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 pb-6 px-6 flex-1 min-w-0 flex flex-col justify-between">
          <TooltipProvider>
            <div className="space-y-4 flex flex-col min-w-0">
              {funnelData.map((item, index) => (
                <Tooltip key={item.id} delayDuration={200}>
                  <TooltipTrigger asChild>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + (index * 0.05) }}
                      className="group relative min-w-0 cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-2 min-w-0 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[13px] font-bold truncate ${item.isEmpty ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {item.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors duration-300 shrink-0 ${
                            item.isEmpty 
                              ? 'bg-muted/50 text-muted-foreground/60' 
                              : 'bg-muted dark:bg-slate-800 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                          }`}>
                            {item.percentage}%
                          </span>
                        </div>
                        <span className={`text-sm font-bold tracking-tight shrink-0 ${item.isEmpty ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-muted dark:bg-slate-800/50 rounded-full overflow-hidden flex justify-start min-w-0">
                        {!item.isEmpty && (
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: item.width }}
                            transition={{ duration: 1, delay: 0.3 + (index * 0.05), type: "spring", stiffness: 40, damping: 15 }}
                            className={`h-full rounded-full ${item.color} relative overflow-hidden`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="flex flex-col gap-1 p-3">
                    <div className="font-bold">{item.label}</div>
                    <div className="text-muted-foreground text-xs">Lead Count: <span className="text-foreground">{item.count}</span></div>
                    <div className="text-muted-foreground text-xs">Percentage: <span className="text-foreground">{item.percentage}%</span></div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>

          <div className="mt-6">
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                <span className="text-xs text-muted-foreground font-medium mb-1">Total Leads</span>
                <span className="text-sm font-bold text-foreground">{totalLeads}</span>
              </div>
              <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                <span className="text-xs text-muted-foreground font-medium mb-1">Won</span>
                <span className="text-sm font-bold text-foreground">{wonCount}</span>
              </div>
              <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                <span className="text-xs text-muted-foreground font-medium mb-1">Conversion</span>
                <span className="text-sm font-bold text-foreground">{overallConversion}%</span>
              </div>
              <div className="flex flex-col bg-muted/40 rounded-lg p-3">
                <span className="text-xs text-muted-foreground font-medium mb-1">Avg Deal Time</span>
                <span className="text-sm font-bold text-foreground">6 Days</span>
              </div>
            </div>
          </div>
        </div>
      </CRMCard>
    </div>
  );
}












