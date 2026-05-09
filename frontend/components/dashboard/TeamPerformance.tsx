"use client";

import { motion } from "framer-motion";
import { CRMCard } from "@/components/shared/crm/CRMCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const team = [
  { id: 1, name: "Alex Rivera", role: "Sr. Account Exec", sales: 42, target: 85, avatar: "AR", color: "bg-info" },
  { id: 2, name: "Jordan Lee", role: "Sales Rep", sales: 28, target: 60, avatar: "JL", color: "bg-primary" },
  { id: 3, name: "Taylor Smith", role: "SDR", sales: 15, target: 45, avatar: "TS", color: "bg-warning" },
];

export default function TeamPerformance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="w-full h-full"
    >
      <CRMCard 
        accentSeed="Team Performance"
        noPadding
        className="h-full flex flex-col bg-gradient-to-br from-card to-background/50"
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <CardTitle>Team Performance</CardTitle>
          </div>
          <Button variant="ghost" className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 rounded-xl px-4 h-9">Full Report</Button>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col justify-between pb-2">
            {team.map((member, index) => {
              const progress = Math.min(100, Math.round((member.sales / member.target) * 100));
              const barColor = member.color === 'bg-info' ? 'bg-blue-500' : 
                               member.color === 'bg-primary' ? 'bg-emerald-500' : 
                               'bg-amber-500';
              
              return (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + (index * 0.1) }}
                  className="group py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-11 h-11 rounded-xl ${member.color} flex items-center justify-center font-bold text-white shadow-md transition-all duration-500 border border-white/20`}>
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-none mb-1.5">{member.name}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-foreground text-sm tracking-tight tabular-nums">{member.sales} / {member.target}</span>
                      <span className="text-[10px] font-bold text-success flex items-center gap-1 justify-end mt-1 uppercase tracking-tighter">
                        <TrendingUp className="w-3 h-3"/> {progress}% target
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/20 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.2, delay: 1 + (index * 0.1), ease: "easeOut" }}
                      className={`h-full rounded-full ${barColor} relative overflow-hidden shadow-[0_0_8px_-2px_currentColor]`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </CRMCard>
    </motion.div>
  );
}
