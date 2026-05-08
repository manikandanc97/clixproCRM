import { TaskType } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

interface TimelineViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const TimelineView = ({ tasks, onTaskClick }: TimelineViewProps) => {
  const dates = ["May 01", "May 02", "May 03", "May 04", "May 05", "May 06", "May 07", "May 08", "May 09", "May 10"];

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <div className="w-64 p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 sticky left-0 bg-slate-50/50 z-10">
              Tasks
            </div>
            {dates.map(date => (
              <div key={date} className="flex-1 p-4 text-center text-xs font-bold text-slate-400 border-r border-slate-100 last:border-r-0">
                {date}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            {tasks.map((task, idx) => {
              // Simulating random start/duration for visual demo
              const startIdx = idx % 5;
              const duration = 2 + (idx % 3);
              
              return (
                <div key={task.id} className="flex group hover:bg-slate-50/30 transition-colors">
                  <div 
                    onClick={() => onTaskClick(task)}
                    className="w-64 p-4 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50/30 z-10 cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {task.estimatedTime || "2h"}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex relative p-4">
                    {/* Grid Lines */}
                    {dates.map((_, i) => (
                      <div key={i} className="flex-1 border-r border-slate-50/50 last:border-r-0" />
                    ))}

                    {/* Task Bar */}
                    <div 
                      onClick={() => onTaskClick(task)}
                      className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-center px-3 gap-2
                        ${task.priority === 'High' ? 'bg-rose-500 text-white shadow-rose-500/20' : 
                          task.priority === 'Medium' ? 'bg-blue-500 text-white shadow-blue-500/20' : 
                          'bg-slate-700 text-white shadow-slate-700/20'}`}
                      style={{ 
                        left: `${(startIdx / dates.length) * 100}%`,
                        width: `${(duration / dates.length) * 100}%`
                      }}
                    >
                      <Avatar className="w-4 h-4 border border-white/20">
                        <AvatarFallback className="text-[6px] font-bold bg-white/20 text-white">
                          {task.assignedTo.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-bold truncate">{task.progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
