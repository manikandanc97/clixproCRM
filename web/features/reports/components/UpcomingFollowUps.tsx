"use client";

import React from "react";
import { CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { UpcomingFollowUpType } from "@/shared/types/report";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/crm-formatters";
import { EmptyStateCard } from "@/shared/components/page-states";

interface UpcomingFollowUpsProps {
  data: UpcomingFollowUpType[];
  loading?: boolean;
}

const UpcomingFollowUps = ({ data, loading: _loading }: UpcomingFollowUpsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="h-full flex flex-col"
    >
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden h-full flex flex-col flex-1">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="font-bold text-foreground text-lg tracking-tight">Upcoming Actions</CardTitle>
              <CalendarClock className="w-4 h-4 text-emerald-500" />
            </div>
            <CardDescription className="text-muted-foreground text-xs mt-1">Scheduled tasks and meetings</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 min-w-0 flex-1 overflow-y-auto max-h-[400px]">
          {!data || data.length === 0 ? (
            <div className="p-6">
              <EmptyStateCard 
                icon={CalendarClock} 
                title="All caught up" 
                message="You have no upcoming tasks or meetings scheduled." 
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    item.type === 'TASK' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                    {item.type === 'TASK' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
                  </div>
                  <div className="shrink-0">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-600">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(UpcomingFollowUps);
