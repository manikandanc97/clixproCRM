"use client";

import { motion } from "framer-motion";
import { CRMCard } from "@/shared/components/crm/CRMCard";
import { CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Award, TrendingUp } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTeamPerformance } from "@/shared/hooks/use-dashboard";

export default function TeamPerformance() {
  const { data } = useTeamPerformance();
  const team = data?.team ?? [];

  return (
    <div className="w-full h-full min-w-0">
      <CRMCard 
        animate={false}
        accentSeed="Team Performance"
        noPadding
        className="h-full flex flex-col bg-gradient-to-br from-card to-background/50 min-w-0"
      >
        <CardHeader className="flex flex-row items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <CardTitle className="truncate">Team Performance</CardTitle>
          </div>
          <Button variant="ghost" className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 rounded-xl px-4 h-9 shrink-0">Full Report</Button>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex flex-col justify-between pb-2 min-w-0">
            {team.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
                <Award className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">No performance data yet</p>
              </div>
            ) : (
              team.map((member, index) => {
                const progress = Math.min(100, Math.round((member.sales / member.target) * 100));
                // Generate a consistent color based on index or property
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];
                const barColor = colors[index % colors.length];
                const avatarBg = colors[index % colors.length].replace('bg-', 'bg-').replace('-500', '-500/20');
                const avatarText = colors[index % colors.length].replace('bg-', 'text-');
                
                return (
                  <motion.div 
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + (index * 0.05) }}
                    className="group py-3 first:pt-0 last:pb-0 min-w-0"
                  >
                    <div className="flex items-center justify-between mb-3 min-w-0 gap-3">
                      <div className="flex items-center gap-3 cursor-pointer min-w-0">
                        <div className={`w-11 h-11 rounded-xl shrink-0 ${avatarBg} ${avatarText} flex items-center justify-center font-bold shadow-sm transition-all duration-500 border border-current/10`}>
                          {member.avatar}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-none mb-1.5 truncate">{member.name}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none truncate">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block font-black text-foreground text-sm tracking-tight tabular-nums">{member.sales} / {member.target}</span>
                        <span className="text-[10px] font-bold text-success flex items-center gap-1 justify-end mt-1 uppercase tracking-tighter">
                          <TrendingUp className="w-3 h-3"/> {progress}% target
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/20 p-0.5 min-w-0">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, delay: 0.3 + (index * 0.1), ease: "easeOut" }}
                        className={`h-full rounded-full ${barColor} relative overflow-hidden shadow-[0_0_8px_-2px_currentColor]`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </CRMCard>
    </div>
  );
}












