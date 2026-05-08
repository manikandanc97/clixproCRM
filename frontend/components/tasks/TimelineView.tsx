"use client";

import { TaskType } from "@/types/task";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { CRMCard } from "@/components/shared/crm";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const TimelineView = ({ tasks, onTaskClick }: TimelineViewProps) => {
  const dates = ["May 01", "May 02", "May 03", "May 04", "May 05", "May 06", "May 07", "May 08", "May 09", "May 10"];

  return (
    <CRMCard noPadding className="flex flex-col min-h-[650px] overflow-hidden">
      <div className="overflow-x-auto timeline-scroll">
        <div className="min-w-[1100px]">
          {/* Header */}
          <div className="flex border-b border-border/50 bg-muted/20">
            <div className="w-64 p-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] border-r border-border/40 sticky left-0 bg-muted/20 backdrop-blur-md z-10">
              Project Timeline
            </div>
            {dates.map(date => (
              <div key={date} className="flex-1 p-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest border-r border-border/30 last:border-r-0">
                {date}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/20">
            {tasks.map((task, idx) => {
              const startIdx = idx % 5;
              const duration = 2 + (idx % 3);
              
              return (
                <div key={task.id} className="flex group hover:bg-muted/10 transition-colors">
                  <div 
                    onClick={() => onTaskClick(task)}
                    className="w-64 p-4 border-r border-border/40 sticky left-0 bg-card group-hover:bg-muted/5 z-10 cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors tracking-tight">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {task.estimatedTime || "2h"}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex relative p-4 bg-muted/5">
                    {/* Grid Lines */}
                    {dates.map((_, i) => (
                      <div key={i} className="flex-1 border-r border-border/10 last:border-r-0" />
                    ))}

                    {/* Task Bar */}
                    <div 
                      onClick={() => onTaskClick(task)}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-8 rounded-lg cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-center px-3 gap-2 border",
                        task.priority === 'High' ? 'bg-rose-500 text-white border-rose-600/20 shadow-rose-500/10' : 
                        task.priority === 'Medium' ? 'bg-blue-500 text-white border-blue-600/20 shadow-blue-500/10' : 
                        'bg-foreground text-background border-foreground/10 shadow-foreground/5'
                      )}
                      style={{ 
                        left: `${(startIdx / dates.length) * 100}%`,
                        width: `${(duration / dates.length) * 100}%`
                      }}
                    >
                      <Avatar className="w-4 h-4 border border-white/20 shrink-0">
                        <AvatarFallback className="text-[6px] font-black bg-white/20 text-white">
                          {task.assignedTo.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[9px] font-black tracking-widest">{task.progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CRMCard>
  );
};
