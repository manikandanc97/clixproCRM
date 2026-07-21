"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskType } from "@/shared/types/task";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { 
  MoreHorizontal, 
  MessageSquare,
  Paperclip,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { TaskIntelligenceBadge } from "./TaskIntelligenceBadge";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

interface TaskKanbanCardProps {
  task: TaskType;
  onClick: (task: TaskType) => void;
  isOverlay?: boolean;
}

export const TaskKanbanCard = ({ task, onClick, isOverlay }: TaskKanbanCardProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const { deleteTask } = useCRMStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
    toast.error("Task Deleted", {
      description: `"${task.title}" has been removed.`,
    });
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-muted/40 p-4 rounded-xl border border-dashed border-primary/20 h-[180px]"
      />
    );
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        "bg-card p-4 rounded-xl border border-border/50 shadow-[var(--crm-card-shadow)] hover:shadow-[var(--crm-card-hover-shadow)] hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing group relative",
        isOverlay && "shadow-elevated border-primary/50 rotate-1 scale-[1.02]"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <Badge className={cn(
          "px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-widest border-none",
          task.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 
          task.priority === 'Medium' ? 'bg-blue-500/10 text-blue-500' : 
          'bg-muted/50 text-muted-foreground'
        )}>
          {task.priority}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-premium">
            <DropdownMenuItem 
              onClick={handleDelete}
              variant="destructive"
              className="rounded-lg gap-2 font-semibold text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-3 leading-tight tracking-tight text-sm">
        {task.title}
      </h4>
      
      <div className="mb-4 pointer-events-none">
        <TaskIntelligenceBadge type="progress" value={task.progress} />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center -space-x-1.5">
          <Avatar className="w-6 h-6 border-2 border-card shadow-sm rounded-lg">
            <AvatarFallback className="text-[8px] font-bold bg-muted text-muted-foreground">
              {"Unassigned".split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {task.collaborators?.slice(0, 2).map(c => (
            <Avatar key={c.id} className="w-6 h-6 border-2 border-card shadow-sm rounded-lg">
              <AvatarFallback className="text-[8px] font-bold bg-primary/15 text-primary">
                {c.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        <div className="flex items-center gap-3 text-muted-foreground">
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
  );
};












