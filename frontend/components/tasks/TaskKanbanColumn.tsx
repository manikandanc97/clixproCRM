"use client";

import { useDroppable } from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { TaskType } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskKanbanCard } from "./TaskKanbanCard";
import { toast } from "sonner";

interface TaskKanbanColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const TaskKanbanColumn = ({ id, title, tasks, onTaskClick }: TaskKanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: "Column",
    },
  });

  const handleAddTask = () => {
    toast.info("Quick Add Task", {
      description: `Creating new task in ${title} column.`,
    });
  };

  return (
    <div className="flex-shrink-0 w-[320px] flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground text-sm tracking-tight">{title}</h3>
          <Badge variant="outline" className="bg-muted/50 border-border/50 text-muted-foreground font-bold px-2 py-0.5 rounded-md text-[10px]">
            {tasks.length}
          </Badge>
        </div>
        <button 
          onClick={handleAddTask}
          className="text-muted-foreground hover:text-primary h-7 w-7 rounded-lg hover:bg-primary/5 flex items-center justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 space-y-4 bg-muted/20 p-2.5 rounded-[var(--crm-card-radius)] border border-border/40 min-h-[500px]"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskKanbanCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div 
            onClick={handleAddTask}
            className="flex flex-col items-center justify-center py-12 opacity-40 hover:opacity-100 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-dashed border-border mb-3 group-hover:border-primary group-hover:bg-primary/5 group-hover:scale-110 transition-all">
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Add Task</p>
          </div>
        )}
      </div>
    </div>
  );
};
