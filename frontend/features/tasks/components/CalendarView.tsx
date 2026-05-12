"use client";

import { TaskType } from "@/shared/types/task";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CRMCard } from "@/shared/components/crm";
import { cn } from "@/shared/lib/utils";

interface CalendarViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const CalendarView = ({ tasks, onTaskClick }: CalendarViewProps) => {
  // Simple calendar simulation for May 2026
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <CRMCard noPadding accentSeed="Task Calendar" className="flex flex-col h-full min-h-[750px] overflow-hidden">
      <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-black text-foreground tracking-tight">May 2026</h3>
          <div className="flex items-center bg-card rounded-lg border border-border/60 p-1 shadow-sm">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-9 px-4 font-semibold rounded-lg">Today</Button>
        </div>
        <Button size="sm" className="gap-2 h-9 px-4 font-bold rounded-lg">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-7 border-b border-border/40 bg-muted/5">
        {weekDays.map(day => (
          <div key={day} className="px-4 py-3 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] border-r border-border/30 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/30">
        {days.map(day => {
          const dayTasks = tasks.slice(0, (day % 3 === 0 ? 2 : 0));
          return (
            <div key={day} className="min-h-[130px] p-2.5 group hover:bg-muted/30 transition-all duration-200">
              <div className="flex justify-between items-center mb-2.5">
                <span className={cn(
                  "text-xs font-bold",
                  day === 8 
                    ? 'bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-md shadow-sm' 
                    : 'text-muted-foreground/60'
                )}>
                  {day}
                </span>
              </div>
              <div className="space-y-1.5">
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "px-2 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider truncate cursor-pointer transition-all hover:scale-[1.03] border shadow-sm",
                      task.priority === 'High' ? 'bg-rose-500/5 text-rose-600 border-rose-500/20' : 
                      task.priority === 'Medium' ? 'bg-blue-500/5 text-blue-600 border-blue-500/20' : 
                      'bg-muted/50 text-muted-foreground border-border/50'
                    )}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </CRMCard>
  );
};












