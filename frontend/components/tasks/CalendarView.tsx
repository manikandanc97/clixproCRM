import { TaskType } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const CalendarView = ({ tasks, onTaskClick }: CalendarViewProps) => {
  // Simple calendar simulation for May 2026
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-full min-h-[700px]">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-slate-900">May 2026</h3>
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
            <Button variant="ghost" size="icon-xs">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon-xs">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">Today</Button>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-7 border-b border-slate-100">
        {weekDays.map(day => (
          <div key={day} className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map(day => {
          // Mocking some tasks on specific days for visual demo
          const dayTasks = tasks.slice(0, (day % 3 === 0 ? 2 : 0));
          return (
            <div key={day} className="min-h-[120px] p-2 border-r border-b border-slate-50 last:border-r-0 group hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold ${day === 8 ? 'bg-emerald-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-md shadow-emerald-600/20' : 'text-slate-400'}`}>
                  {day}
                </span>
              </div>
              <div className="space-y-1">
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => onTaskClick(task)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold truncate cursor-pointer transition-all hover:scale-105
                      ${task.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                        task.priority === 'Medium' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                        'bg-slate-100 text-slate-600 border border-slate-200'}`}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
