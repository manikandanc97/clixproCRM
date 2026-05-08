"use client";

import { CRMCard } from "@/components/shared/crm";
import {
  Zap,
  Target,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const ProductivityWidgets = () => {
  return (
    <div className="space-y-5">
      {/* AI Recommendations */}
      <CRMCard noPadding className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 border-primary/20 group">
        <div className="p-5 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-white/15 rounded-lg backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">AI Insight</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1.5 leading-tight tracking-tight">
            Focus on Project Alpha
          </h3>
          <p className="text-white/75 text-[11px] leading-relaxed mb-4">
            Completing &quot;Design Review&quot; today reduces bottleneck risk by 45%.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs rounded-lg h-9"
          >
            View Recommendation
          </Button>
        </div>
      </CRMCard>

      {/* Today's Focus */}
      <CRMCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Today&apos;s Focus</h3>
          </div>
          <Badge
            variant="outline"
            className="bg-primary/8 text-primary border-primary/20 font-bold text-[9px] uppercase tracking-widest rounded-md"
          >
            3 Tasks
          </Badge>
        </div>

        <div className="space-y-1.5">
          {[
            "Update design system",
            "Client meeting preparation",
            "Review project milestones",
          ].map((task, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group border border-transparent hover:border-border/50"
            >
              <div className="w-1 h-6 bg-primary/20 group-hover:bg-primary transition-colors rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{task}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">
                    4h left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CRMCard>

      {/* Weekly Pulse */}
      <CRMCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Weekly Pulse</h3>
          </div>
          <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-bold gap-1">
            <ArrowUpRight className="w-3 h-3" />
            +12%
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              <span>Completion Rate</span>
              <span className="text-foreground">85%</span>
            </div>
            <Progress value={85} className="h-1.5 bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Created</p>
              <p className="text-xl font-black text-foreground tabular-nums">24</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Finished</p>
              <p className="text-xl font-black text-foreground tabular-nums">18</p>
            </div>
          </div>
        </div>
      </CRMCard>

      {/* Team Workload */}
      <CRMCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Workload Balance</h3>
        </div>

        <div className="space-y-3.5">
          {[
            { name: "Alex Chen", taskCount: 8, load: 90, color: "bg-rose-500" },
            { name: "Sarah Miller", taskCount: 5, load: 60, color: "bg-primary" },
            { name: "Mike Ross", taskCount: 3, load: 35, color: "bg-blue-500" },
          ].map((member) => (
            <div key={member.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 border border-border rounded-md">
                    <AvatarFallback className="text-[8px] font-bold bg-muted text-muted-foreground">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] font-semibold text-foreground">{member.name}</span>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  {member.taskCount} tasks
                </span>
              </div>
              <Progress value={member.load} className="h-1 bg-muted" indicatorClassName={member.color} />
            </div>
          ))}
        </div>
      </CRMCard>
    </div>
  );
};
