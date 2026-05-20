"use client";

import { motion } from "framer-motion";
import { CRMCard } from "@/shared/components/crm/CRMCard";
import { CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Flame, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useHotLeads } from "@/shared/hooks/use-dashboard";

export default function HotLeads() {
  const { data } = useHotLeads();
  const leads = data?.leads ?? [];

  return (
    <div className="w-full h-full">
      <CRMCard animate={false} accentSeed="Hot Leads" noPadding className="h-full flex flex-col bg-gradient-to-br from-card to-background/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-warning/10 text-warning rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <CardTitle>Hot Leads</CardTitle>
          </div>
          <Button variant="ghost" className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 rounded-xl px-4 h-9">View All</Button>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Flame className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">No hot leads right now</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add active leads to see them here</p>
            </div>
          ) : (
            <div className="space-y-5">
              {leads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  className="group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground shadow-sm">
                        {lead.name.charAt(0)}
                      </div>
                      {lead.score > 90 && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-warning transition-colors">{lead.name}</h4>
                      <p className="text-xs font-medium text-muted-foreground">{lead.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block font-bold text-foreground text-sm">{lead.value}</span>
                      <span className="text-[10px] font-bold text-warning flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> {lead.score} Score
                      </span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 bg-muted hover:bg-warning/10 text-muted-foreground hover:text-warning rounded-xl transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </CRMCard>
    </div>
  );
}












