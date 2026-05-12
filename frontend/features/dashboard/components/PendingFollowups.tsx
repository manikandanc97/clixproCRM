"use client";

import { motion } from "framer-motion";
import { CRMCard } from "@/shared/components/crm/CRMCard";
import { CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CheckSquare, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTasks } from "@/shared/hooks/use-crm";
import { DashboardWidgetSkeleton } from "@/shared/components/skeletons";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

export default function PendingFollowups() {
  const { data, isLoading: loading } = useTasks();
  const allTasks = data?.tasks ?? [];
  const pendingTasks = allTasks.filter(t => t.status !== "Completed").slice(0, 4);

  const formatDueDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
      if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
      return format(date, "MMM dd");
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <DashboardWidgetSkeleton rows={3} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="w-full"
    >
      <CRMCard accentSeed="Pending Tasks" className="border-none shadow-premium bg-gradient-to-br from-card to-background/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-info/10 text-info rounded-xl">
              <div className="relative">
                <CheckSquare className="w-5 h-5" />
                {pendingTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </div>
            </div>
            <CardTitle>Pending Tasks</CardTitle>
          </div>
          <Button variant="ghost" className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 rounded-xl px-4 h-9">View All</Button>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          <div className="space-y-4">
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckSquare className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground/60 mt-1">No pending tasks found</p>
              </div>
            ) : (
              pendingTasks.map((task, index) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
                  className="group flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="mt-0.5">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.priority === 'High' ? 'border-destructive/50 group-hover:border-destructive' :
                      task.priority === 'Medium' ? 'border-warning/50 group-hover:border-warning' :
                      'border-border group-hover:border-info'
                    }`}>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors leading-snug">{task.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className={task.priority === 'High' ? 'text-destructive' : ''}>{formatDueDate(task.dueDate)}</span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <Button variant="outline" className="w-full mt-4 rounded-xl border-border bg-transparent hover:bg-muted text-muted-foreground font-bold text-[11px] uppercase tracking-wider">
            + Add New Task
          </Button>
        </CardContent>
      </CRMCard>
    </motion.div>
  );
}












