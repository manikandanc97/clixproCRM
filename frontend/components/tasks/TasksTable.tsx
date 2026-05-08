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
        <CRMTableRow className="hover:bg-transparent">
          <CRMTableHeaderCell className="w-[60px] px-8">
            <Checkbox />
          </CRMTableHeaderCell>
          <CRMTableHeaderCell>Task Details</CRMTableHeaderCell>
          <CRMTableHeaderCell>Analytics</CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-center">Priority</CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-center">Timeline</CRMTableHeaderCell>
          <CRMTableHeaderCell>Owner</CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-right px-8">Action</CRMTableHeaderCell>
        </CRMTableRow>
      </CRMTableHeader>

      <CRMTableBody>
        {tasks.map((task) => (
          <CRMTableRow 
            key={task.id} 
            className="group"
          >
            <CRMTableCell className="px-8">
              <Checkbox 
                checked={task.status === "Completed"} 
              />
            </CRMTableCell>

            <CRMTableCell className="min-w-[300px]">
              <div className="flex flex-col gap-1.5 cursor-pointer" onClick={() => onTaskClick(task)}>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-semibold text-foreground group-hover:text-primary transition-colors leading-tight text-sm",
                    task.status === "Completed" && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                  {task.isUrgent && (
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
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
                "border-none px-3 py-0.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-sm",
                task.priority === 'High' ? 'bg-destructive/10 text-destructive' : 
                task.priority === 'Medium' ? 'bg-primary/10 text-primary' : 
                'bg-muted text-muted-foreground'
              )}>
                {task.priority}
              </Badge>
            </CRMTableCell>

            <CRMTableCell>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-foreground text-[11px] font-bold bg-muted/50 px-2 py-1 rounded-lg border border-border/50">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {task.dueDate}
                </div>
                {task.estimatedTime && (
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    Est: {task.estimatedTime}
                  </div>
                )}
              </div>
            </CRMTableCell>

            <CRMTableCell>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center font-bold text-xs">
                    <AvatarFallback>
                      {task.assignedTo.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-foreground leading-none">{task.assignedTo}</span>
                  <span className="text-[9px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">Task Owner</span>
                </div>
              </div>
            </CRMTableCell>

            <CRMTableCell className="text-right px-8">
              <div className="flex items-center justify-end gap-1">
                <Button 
                  variant="ghost" 
                  size="icon-xs" 
                  onClick={() => onTaskClick(task)}
                  className="text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-xl p-1.5">
                    <DropdownMenuItem className="rounded-lg">
                      <Play className="w-4 h-4 mr-2 text-emerald-500" /> Start Timer
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">
                      <UserPlus className="w-4 h-4 mr-2" /> Reassign
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">
                      <Flag className="w-4 h-4 mr-2 text-amber-500" /> Mark Urgent
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-lg">
                      <Copy className="w-4 h-4 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">
                      <Paperclip className="w-4 h-4 mr-2" /> Attachments
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive rounded-lg">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
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
