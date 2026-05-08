"use client";

import { 
  Badge 
} from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  Play, 
  Flag, 
  Copy, 
  Paperclip, 
  Trash2, 
  UserPlus,
  Eye
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskType } from "@/types/task";
import { TaskIntelligenceBadge } from "./TaskIntelligenceBadge";
import { 
  CRMDataTable, 
  CRMTableHeader, 
  CRMTableBody, 
  CRMTableRow, 
  CRMTableCell, 
  CRMTableHeaderCell 
} from "@/components/shared/crm";
import { cn } from "@/lib/utils";

interface TasksTableProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

const TasksTable = ({ tasks, onTaskClick }: TasksTableProps) => {
  return (
    <CRMDataTable>
      <CRMTableHeader>
        <CRMTableRow className="hover:bg-transparent border-b border-border/40">
          <CRMTableHeaderCell className="w-[60px] px-6">
            <Checkbox className="rounded-md border-muted-foreground/30" />
          </CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Task Detail</CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Intelligence</CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-center text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Priority</CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-center text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Deadline</CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Owner</CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-right px-6 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Manage</CRMTableHeaderCell>
        </CRMTableRow>
      </CRMTableHeader>

      <CRMTableBody className="divide-y divide-border/20">
        {tasks.map((task) => (
          <CRMTableRow 
            key={task.id} 
            className="group hover:bg-muted/10 transition-colors"
          >
            <CRMTableCell className="px-6">
              <Checkbox 
                checked={task.status === "Completed"} 
                className="rounded-md border-muted-foreground/30"
              />
            </CRMTableCell>

            <CRMTableCell className="min-w-[300px]">
              <div className="flex flex-col gap-1.5 cursor-pointer" onClick={() => onTaskClick(task)}>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-bold text-foreground group-hover:text-primary transition-colors leading-tight text-sm tracking-tight",
                    task.status === "Completed" && "line-through text-muted-foreground opacity-60"
                  )}>
                    {task.title}
                  </p>
                  {task.isUrgent && (
                    <Badge variant="outline" className="h-4 px-1.5 py-0 text-[7px] font-black uppercase tracking-tighter bg-destructive/10 text-destructive border-destructive/20 animate-pulse">
                      Urgent
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <TaskIntelligenceBadge type="category" value={task.category || "General"} />
                  {task.subtaskCount && (
                    <TaskIntelligenceBadge type="subtasks" value={task.subtaskCount} />
                  )}
                </div>
              </div>
            </CRMTableCell>

            <CRMTableCell>
              <div className="flex flex-col gap-1 w-32">
                <TaskIntelligenceBadge type="progress" value={task.progress} />
                <div className="flex items-center gap-1.5 mt-1">
                  {task.isOverdue && <TaskIntelligenceBadge type="overdue" value={true} />}
                  {task.aiPriorityScore && <TaskIntelligenceBadge type="ai-score" value={task.aiPriorityScore} />}
                </div>
              </div>
            </CRMTableCell>

            <CRMTableCell className="text-center">
              <Badge variant="outline" className={cn(
                "border px-2.5 py-0.5 rounded-md font-black text-[9px] uppercase tracking-widest shadow-sm",
                task.priority === 'High' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 
                task.priority === 'Medium' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 
                'bg-muted/50 text-muted-foreground border-border/50'
              )}>
                {task.priority}
              </Badge>
            </CRMTableCell>

            <CRMTableCell>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-foreground text-[10px] font-black bg-card px-2 py-1 rounded-md border border-border/50 shadow-sm">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {task.dueDate}
                </div>
                {task.estimatedTime && (
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[8px] font-black uppercase tracking-wider">
                    <Clock className="w-2.5 h-2.5" />
                    Est: {task.estimatedTime}
                  </div>
                )}
              </div>
            </CRMTableCell>

            <CRMTableCell>
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <Avatar className="w-8 h-8 rounded-lg border border-border/60 bg-muted flex items-center justify-center font-black text-[10px] shadow-sm">
                    <AvatarFallback className="bg-primary/5 text-primary">
                      {task.assignedTo.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full shadow-sm" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-foreground leading-none truncate">{task.assignedTo}</span>
                  <span className="text-[8px] font-black text-muted-foreground/60 mt-1 uppercase tracking-[0.1em] truncate">Lead Owner</span>
                </div>
              </div>
            </CRMTableCell>

            <CRMTableCell className="text-right px-6">
              <div className="flex items-center justify-end gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onTaskClick(task)}
                  className="h-7 w-7 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100 rounded-md"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl border-border shadow-premium p-1.5">
                    <DropdownMenuItem className="rounded-lg text-xs font-bold gap-2">
                      <Play className="w-3.5 h-3.5 text-emerald-500" /> Start Timer
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg text-xs font-bold gap-2">
                      <UserPlus className="w-3.5 h-3.5" /> Reassign
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg text-xs font-bold gap-2">
                      <Flag className="w-3.5 h-3.5 text-amber-500" /> Mark Urgent
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="opacity-50" />
                    <DropdownMenuItem className="rounded-lg text-xs font-bold gap-2">
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg text-xs font-bold gap-2">
                      <Paperclip className="w-3.5 h-3.5" /> Attachments
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="opacity-50" />
                    <DropdownMenuItem className="text-destructive focus:text-destructive rounded-lg text-xs font-bold gap-2">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CRMTableCell>
          </CRMTableRow>
        ))}
      </CRMTableBody>
    </CRMDataTable>
  );
};

export default TasksTable;
