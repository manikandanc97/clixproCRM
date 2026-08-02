"use client";

import { motion } from "framer-motion";
import { CRMCard, EmptyState } from "@/shared/components/crm";
import { CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CheckSquare, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTasks } from "@/shared/hooks/use-crm";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

export default function PendingFollowups() {
  const { data } = useTasks();
  const allTasks = data?.tasks ?? [];
  const pendingTasks = allTasks.filter(t => t.status !== "COMPLETED").slice(0, 4);

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

  return (
    <div className="w-full">
      <CRMCard animate={false} accentSeed="Pending Tasks" noPadding className="border-none shadow-premium bg-gradient-to-br from-card to-background/50 h-[420px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
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
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            {pendingTasks.length === 0 ? (
              <EmptyState 
                icon={CheckSquare}
                title="All Tasks Completed 🎉"
                description="Great work!\nThere are no pending tasks at the moment."
                primaryAction={{ label: "Create New Task", onClick: () => {} }}
              />
            ) : (
              <>
                <div className="space-y-4">
                  {pendingTasks.slice(0, 3).map((task, index) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + (index * 0.05) }}
                      className="group flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="mt-0.5">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.priority === 'HIGH' ? 'border-destructive/50 group-hover:border-destructive' :
                          task.priority === 'MEDIUM' ? 'border-warning/50 group-hover:border-warning' :
                          'border-border group-hover:border-info'
                        }`}>
                          {task.priority === "HIGH" && <AlertCircle className="w-3 h-3 text-rose-500" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors leading-snug">{task.title}</h4>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span className={`${task.priority === "HIGH" ? "text-rose-500" : task.priority === "MEDIUM" ? "text-amber-500" : ""}`}>{formatDueDate(task.dueDate)}</span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-auto rounded-xl border-border bg-transparent hover:bg-muted text-muted-foreground font-bold text-[11px] uppercase tracking-wider">
                  + Add New Task
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </CRMCard>
    </div>
  );
}












