"use client";

import { CRMCard, CRMCardHeader } from '@/shared/components/crm';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { CardContent } from '@/shared/ui/card';
import { Users, Activity, MoreVertical, Zap } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from '@/shared/ui/skeleton';

export interface AgentStat {
  id: string | number;
  name: string;
  avatar?: string;
  deals?: number;
  revenue?: string;
  performance?: number;
}

export const TopAgents = ({ data, loading }: { data?: AgentStat[], loading?: boolean }) => (
  <CRMCard className="h-full" noPadding accentSeed="agents">
    <CRMCardHeader 
      title="Top Performers" 
      subtitle="Agents with highest revenue"
      icon={Users}
      iconBg="bg-gradient-to-br from-indigo-500/20 to-indigo-500/5"
      iconColor="text-indigo-600 dark:text-indigo-400"
      actions={<Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>}
    />
    <CardContent className="px-6 pb-6 pt-0">
      <div className="space-y-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))
        ) : (
          data?.map((agent: AgentStat) => (
            <div key={agent.id} className="group/agent flex items-center gap-4">
              <Avatar className="h-10 w-10 border-2 border-primary/10 transition-transform group-hover/agent:scale-110">
                <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                  {agent.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-foreground truncate">{agent.name}</p>
                  <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                    {agent.performance}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                     <Zap className="w-3 h-3 text-amber-500" />
                     {agent.deals} Deals Closed
                  </span>
                  <span className="font-bold text-foreground">{agent.revenue}</span>
                </div>
                <Progress value={agent.performance} className="h-1.5" />
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </CRMCard>
);

interface ActivityItem {
  id: string | number;
  user: string;
  detail: string;
  time: string;
}

export const RecentActivity = ({ data, loading }: { data?: ActivityItem[], loading?: boolean }) => (
  <CRMCard className="h-full" noPadding accentSeed="activity">
    <CRMCardHeader 
      title="Recent Activity" 
      subtitle="Latest updates from your team"
      icon={Activity}
      iconBg="bg-gradient-to-br from-amber-500/20 to-amber-500/5"
      iconColor="text-amber-600 dark:text-amber-400"
      actions={<Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>}
    />
    <CardContent className="px-6 pb-6 pt-0">
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative pl-10 space-y-2">
              <Skeleton className="absolute left-0 top-1 h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : (
          data?.map((activity: ActivityItem) => (
            <div key={activity.id} className="group/activity relative pl-10">
              <div className="absolute left-0 top-1 h-10 w-10 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center z-10 transition-colors group-hover/activity:border-primary">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight group-hover/activity:text-primary transition-colors">
                  {activity.detail}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                    {activity.user}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </CRMCard>
);












