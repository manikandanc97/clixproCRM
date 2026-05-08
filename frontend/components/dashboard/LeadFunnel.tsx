"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, ChevronRight } from "lucide-react";

const funnelData = [
  { stage: "Total Leads", count: 1240, color: "bg-info", width: "100%" },
  { stage: "Qualified", count: 856, color: "bg-primary", width: "70%" },
  { stage: "Proposals", count: 420, color: "bg-warning", width: "35%" },
  { stage: "Won Deals", count: 185, color: "bg-success", width: "15%" },
];

export default function LeadFunnel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full"
    >
      <Card className="border-none shadow-premium bg-gradient-to-br from-card to-background/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-info/10 text-info rounded-xl">
              <Filter className="w-5 h-5" />
            </div>
            <CardTitle>Conversion Funnel</CardTitle>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-xl">
            <ChevronRight className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="p-6 lg:p-8 pt-2 flex-1">
          <div className="space-y-6 flex flex-col justify-center h-full">
            {funnelData.map((item, index) => (
              <motion.div 
                key={item.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                className="relative"
              >
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">{item.stage}</span>
                  <span className="text-lg font-bold text-foreground tracking-tight">{item.count}</span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex justify-center shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: item.width }}
                    transition={{ duration: 1, delay: 0.8 + (index * 0.1), type: "spring", stiffness: 50 }}
                    className={`h-full rounded-full ${item.color} shadow-sm`}
                  />
                </div>
                {/* Connecting lines between stages (except last) */}
                {index < funnelData.length - 1 && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-8 h-6 flex justify-center opacity-20">
                    <div className="border-l border-r border-slate-400 w-full h-full transform perspective-100 rotate-x-12" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }}></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
