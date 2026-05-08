"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, ChevronRight } from "lucide-react";

const funnelData = [
  { stage: "Total Leads", count: 1240, color: "bg-blue-500", width: "100%", conversion: null },
  { stage: "Qualified", count: 856, color: "bg-[#8B5CF6]", width: "69%", conversion: "69%" },
  { stage: "Proposals", count: 420, color: "bg-[#A855F7]", width: "34%", conversion: "49%" },
  { stage: "Won Deals", count: 185, color: "bg-[#10B981]", width: "15%", conversion: "44%" },
];

export default function LeadFunnel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full h-full"
    >
      <Card className="border-none shadow-premium bg-gradient-to-br from-card to-background/50 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl dark:bg-blue-500/10">
              <Filter className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-bold">Conversion Funnel</CardTitle>
          </div>
          <button className="text-muted-foreground hover:text-muted-foreground transition-colors p-2 hover:bg-muted rounded-xl">
            <ChevronRight className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6 flex-1">
          <div className="space-y-5 flex flex-col">
            {funnelData.map((item, index) => (
              <motion.div 
                key={item.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                className="group relative"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-foreground dark:text-slate-200">{item.stage}</span>
                    {item.conversion && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted dark:bg-slate-800 text-muted-foreground dark:text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                        {item.conversion}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground dark:text-white tracking-tight">{item.count.toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-muted dark:bg-slate-800/50 rounded-lg overflow-hidden flex justify-start">
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
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
