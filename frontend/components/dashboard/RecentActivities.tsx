"use client";

import React, { useState } from "react";
import { User, CheckCircle2, FileText, ArrowRight, Filter, Activity } from "lucide-react";
import { ActivityType } from "@/types/dashboard";

import { CRMCard } from "@/components/shared/crm/CRMCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface RecentActivitiesProps {
  activities: ActivityType[];
}

type CategoryType = "all" | "leads" | "tasks" | "quotations";

const RecentActivities = ({ activities }: RecentActivitiesProps) => {
  const [filter, setFilter] = useState<CategoryType>("all");

  const filteredActivities = activities.filter(activity => {
    if (filter === "all") return true;
    if (filter === "leads") return activity.title.toLowerCase().includes("lead");
    if (filter === "tasks") return activity.title.toLowerCase().includes("task");
    if (filter === "quotations") return activity.title.toLowerCase().includes("quotation");
    return true;
  });

  const handleActivityClick = (title: string) => {
    toast.info(`Activity Detail: ${title}`, {
      description: "Opening detailed activity log and associated entity record.",
    });
  };

  const handleViewAll = () => {
    toast.success("Full Activity Log", {
      description: "Navigating to global activity audit trails.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="w-full h-full"
    >
      <CRMCard 
        accentSeed="Recent Activities"
        noPadding 
        className="flex flex-col h-full bg-gradient-to-br from-card to-background/50"
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <CardTitle>Recent Activities</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {(["all", "leads", "tasks", "quotations"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                    filter === cat
                      ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                      : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleViewAll}
            className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 rounded-xl px-4"
          >
            View All
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="space-y-5 relative py-2">
            {/* Timeline Line */}
            <div className="absolute left-[21px] top-4 bottom-4 w-px bg-gradient-to-b from-border via-border to-transparent" />

            <AnimatePresence mode="popLayout">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity, index) => {
                  const isLeadActivity = activity.title.toLowerCase().includes("lead");
                  const isQuotationActivity = activity.title.toLowerCase().includes("quotation");
                  const isTaskActivity = activity.title.toLowerCase().includes("task");
                  
                  const Icon = isQuotationActivity ? FileText : isTaskActivity ? CheckCircle2 : User;
                  const colorClass = isQuotationActivity
                    ? "bg-gradient-to-br from-warning to-orange-500 shadow-orange-500/20"
                    : isTaskActivity
                      ? "bg-gradient-to-br from-success to-teal-500 shadow-teal-500/20"
                      : isLeadActivity
                        ? "bg-gradient-to-br from-info to-indigo-500 shadow-blue-500/20"
                        : "bg-gradient-to-br from-muted-foreground to-slate-500 shadow-slate-500/20";

                  const categoryLabel = isQuotationActivity ? "Quotation" : isTaskActivity ? "Task" : isLeadActivity ? "Lead" : "Activity";

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      key={activity.id} 
                      onClick={() => handleActivityClick(activity.title)}
                      className="flex items-start gap-5 group cursor-pointer relative z-10"
                    >
                      <div className={`h-11 w-11 rounded-xl ${colorClass} text-white flex items-center justify-center shadow-lg transition-all duration-500 shrink-0 border border-white/20`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                            {activity.title}
                          </p>
                          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap pt-0.5">{activity.time}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                            isQuotationActivity ? "bg-warning/5 text-warning border-warning/10" :
                            isTaskActivity ? "bg-success/5 text-success border-success/10" :
                            isLeadActivity ? "bg-info/5 text-info border-info/10" :
                            "bg-muted text-muted-foreground border-border"
                          }`}>
                            {categoryLabel}
                          </span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground/30 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-muted-foreground/30"
                >
                  <Filter className="w-10 h-10 mb-4 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">No {filter} activities</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </CRMCard>
    </motion.div>
  );
};

export default RecentActivities;
