import { TaskType } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  Plus,
  MessageSquare,
  Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskIntelligenceBadge } from "./TaskIntelligenceBadge";

interface KanbanViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const KanbanView = ({ tasks, onTaskClick }: KanbanViewProps) => {
  const statuses = ["Pending", "In Progress", "Completed"];

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide min-h-[600px]">
      {statuses.map((status) => {
        const statusTasks = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="flex-shrink-0 w-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">{status}</h3>
                <Badge variant="outline" className="bg-slate-100 border-none text-slate-500 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                  {statusTasks.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon-xs" className="text-slate-400 hover:text-slate-600">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex-1 space-y-4 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100 min-h-[500px]">
              {statusTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <Badge className={`px-2 py-0.5 rounded-lg font-bold text-[8px] uppercase tracking-widest border-none
                      ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 
                        task.priority === 'Medium' ? 'bg-blue-50 text-blue-600' : 
                        'bg-slate-50 text-slate-500'}`}>
                      {task.priority}
                    </Badge>
                    <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                  </div>

                  <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-3 leading-tight tracking-tight text-sm">
                    {task.title}
                  </h4>
                  
                  <div className="mb-4">
                    <TaskIntelligenceBadge type="progress" value={task.progress} />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center -space-x-1.5">
                      <Avatar className="w-6 h-6 border-2 border-white shadow-sm ring-1 ring-slate-100 rounded-lg">
                        <AvatarFallback className="text-[8px] font-bold bg-slate-100 text-slate-600">
                          {task.assignedTo.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {task.collaborators?.slice(0, 2).map(c => (
                        <Avatar key={c.id} className="w-6 h-6 border-2 border-white shadow-sm ring-1 ring-slate-100 rounded-lg">
                          <AvatarFallback className="text-[8px] font-bold bg-emerald-50 text-emerald-600">
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{task.notesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{task.attachmentsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {statusTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-dashed border-slate-300 mb-2">
                    <Plus className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Task</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
