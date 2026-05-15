"use client";

import React, { useState } from "react";
import { User, CheckCircle2, FileText, ArrowRight, Filter, Activity } from "lucide-react";
import { ActivityType } from "@/shared/types/dashboard";

import { CRMCard } from "@/shared/components/crm/CRMCard";
import { CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";

import { useDashboardData } from "@/shared/hooks/use-dashboard";
import { ActivityItem } from "./ActivityItem";


type CategoryType = "all" | "leads" | "tasks" | "quotations";

const RecentActivities = () => {
  const { data: dashboardData } = useDashboardData();
  const activities = dashboardData?.recentActivities ?? [];
  const [filter, setFilter] = useState<CategoryType>("all");

  const filteredActivities = activities.filter(activity => {
    if (filter === "all") return true;
    if (filter === "leads") return activity.title.toLowerCase().includes("lead");
    if (filter === "tasks") return activity.title.toLowerCase().includes("task");
    if (filter === "quotations") return activity.title.toLowerCase().includes("quotation");
    return true;
  }).slice(0, 4);

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


          <AnimatePresence mode="popLayout">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <ActivityItem 
                  key={activity.id}
                  activity={activity}
                  index={index}
                  onClick={handleActivityClick}
                />
              ))

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
  );
};

export default RecentActivities;
