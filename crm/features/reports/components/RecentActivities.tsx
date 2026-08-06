"use client";

import React from "react";
import { History, ActivityIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { RecentActivityType } from "@/shared/types/report";
import { motion } from "framer-motion";
import { formatRelativeDate } from "@/lib/crm-formatters";
import { EmptyStateCard } from "@/shared/components/page-states";

interface RecentActivitiesProps {
  data: RecentActivityType[];
  loading?: boolean;
}

const RecentActivities = ({ data, loading }: RecentActivitiesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="h-full flex flex-col"
    >
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden h-full flex flex-col flex-1">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="font-bold text-foreground text-lg tracking-tight">Recent Activity</CardTitle>
              <History className="w-4 h-4 text-blue-500" />
            </div>
            <CardDescription className="text-muted-foreground text-xs mt-1">Latest actions across the CRM</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 min-w-0 flex-1 overflow-y-auto max-h-[400px]">
          {!data || data.length === 0 ? (
            <div className="p-6">
              <EmptyStateCard 
                icon={ActivityIcon} 
                title="No recent activity" 
                message="Start interacting with leads and deals to see history here." 
              />
            </div>
          ) : (
            <div className="space-y-4 relative p-6 before:absolute before:inset-0 before:ml-11 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {data.map((activity, index) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-50 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-900 text-sm">{activity.action}</div>
                      <time className="text-[10px] font-medium text-slate-500">{formatRelativeDate(activity.createdAt)}</time>
                    </div>
                    {activity.description && <div className="text-xs text-slate-500">{activity.description}</div>}
                    <div className="mt-2 text-[10px] text-slate-400 font-medium">
                      {activity.userName && <span>By {activity.userName}</span>}
                      {activity.userName && activity.leadName && <span> • </span>}
                      {activity.leadName && <span>For {activity.leadName}</span>}
                    </div>
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

export default React.memo(RecentActivities);
