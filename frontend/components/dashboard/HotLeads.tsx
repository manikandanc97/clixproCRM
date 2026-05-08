"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const leads = [
  { id: 1, name: "Sarah Jenkins", company: "Stark Industries", score: 98, value: "$45k" },
  { id: 2, name: "Michael Chang", company: "Wayne Ent.", score: 92, value: "$12k" },
  { id: 3, name: "Emily Watson", company: "Daily Planet", score: 87, value: "$28k" },
  { id: 4, name: "David Kim", company: "Oscorp", score: 85, value: "$8k" },
];

export default function HotLeads() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full h-full"
    >
      <Card className="h-full flex flex-col border-none shadow-premium bg-gradient-to-br from-card to-background/50">
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
          <div className="space-y-5">
            {leads.map((lead, index) => (
              <motion.div 
                key={lead.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                className="group flex items-center justify-between"
              >
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground shadow-sm group-hover:scale-110 transition-transform">
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
                    <span className="text-[10px] font-bold text-warning flex items-center gap-0.5"><Flame className="w-3 h-3"/> {lead.score} Score</span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 bg-muted hover:bg-warning/10 text-muted-foreground hover:text-warning rounded-xl transition-all -translate-x-2 group-hover:translate-x-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
