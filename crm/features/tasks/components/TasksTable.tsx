"use client";

import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Calendar, CheckCircle2, CircleDashed, Clock3, Eye, MoreHorizontal, Play, Trash2, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Checkbox } from "@/shared/ui/checkbox";
import { TaskType } from "@/shared/types/task";
import { Progress } from "@/shared/ui/progress";
import {
  CRMDataTable,
  CRMTableBody,
  CRMTableCell,
  CRMTableHeader,
  CRMTableHeaderCell,
  CRMTableRow,
} from "@/shared/components/crm";
import { cn } from "@/shared/lib/utils";

interface TasksTableProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

const TasksTable = ({ tasks, onTaskClick }: TasksTableProps) => {
  return (
    <CRMDataTable>
      <CRMTableHeader>
        <CRMTableRow className="h-14 border-b border-border/30 bg-muted/20">
          <CRMTableHeaderCell className="w-[52px] px-5">
            <Checkbox className="rounded-md border-muted-foreground/20" />
          </CRMTableHeaderCell>
          <CRMTableHeaderCell className="px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Task Detail
          </CRMTableHeaderCell>
          <CRMTableHeaderCell className="w-[220px] px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Intelligence
          </CRMTableHeaderCell>
          <CRMTableHeaderCell className="w-[120px] px-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Priority
          </CRMTableHeaderCell>
          <CRMTableHeaderCell className="w-[170px] px-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Deadline
          </CRMTableHeaderCell>
          <CRMTableHeaderCell className="w-[190px] px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Owner
          </CRMTableHeaderCell>
          <CRMTableHeaderCell className="w-[110px] px-5 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            Manage
          </CRMTableHeaderCell>
        </CRMTableRow>
      </CRMTableHeader>

      <CRMTableBody className="divide-y divide-border/15">
        {tasks.map((task) => (
          <CRMTableRow key={task.id} className="group h-[92px]">
            <CRMTableCell className="px-5">
              <Checkbox
                checked={task.status === "Completed"} 
                className="rounded-md border-muted-foreground/20"
              />
            </CRMTableCell>

            <CRMTableCell className="min-w-[320px] px-4">
              <button
                type="button"
                className="flex w-full flex-col gap-1.5 text-left"
                onClick={() => onTaskClick(task)}
              >
                <div className="flex items-center gap-2.5">
                  <p className={cn(
                    "line-clamp-1 text-[14px] font-semibold leading-tight tracking-tight text-foreground transition-colors",
                    task.status === "Completed" && "text-muted-foreground line-through"
                  )}>
                    {task.title}
                  </p>
                  {task.isUrgent && (
                    <Badge variant="outline" className="h-5 border-amber-500/30 bg-amber-500/10 px-2 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                      URGENT
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                  <span>Workspace</span>
                  <span className="text-muted-foreground/40">/</span>
                  <span>{task.category || "General"}</span>
                </div>
              </button>
            </CRMTableCell>

            <CRMTableCell className="px-4">
              <div className="w-full max-w-[180px] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                  <span className="flex items-center gap-1.5">
                    {task.status === "Completed" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <CircleDashed className="h-3.5 w-3.5 text-primary" />
                    )}
                    {task.status}
                  </span>
                  <span className="font-semibold text-foreground">{task.progress}%</span>
                </div>
                <Progress
                  value={task.progress}
                  className="h-1.5 bg-muted"
                  indicatorClassName={task.status === "Completed" ? "bg-emerald-500" : "bg-primary"}
                />
              </div>
            </CRMTableCell>

            <CRMTableCell className="text-center px-4">
              <span className={cn(
                "inline-flex min-w-[82px] items-center justify-center rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                task.priority === "High" && "border-rose-500/25 bg-rose-500/10 text-rose-700",
                task.priority === "Medium" && "border-blue-500/25 bg-blue-500/10 text-blue-700",
                task.priority === "Low" && "border-emerald-500/25 bg-emerald-500/10 text-emerald-700"
              )}>
                {task.priority}
              </span>
            </CRMTableCell>

            <CRMTableCell className="px-4">
              <div className="mx-auto flex min-w-[132px] flex-col items-center justify-center gap-1 rounded-xl border border-border/60 bg-card px-3 py-2 transition-colors">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {task.dueDate}
                </div>
                <span className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Clock3 className="h-3 w-3" />
                  {task.timeTracked ?? "No time logged"}
                </span>
              </div>
            </CRMTableCell>

            <CRMTableCell className="px-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 rounded-lg border border-border/50">
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                    {task.assignedTo.split(" ").map((name) => name[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold leading-none text-foreground">{task.assignedTo}</span>
                  <span className="mt-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                    Team Lead
                  </span>
                </div>
              </div>
            </CRMTableCell>

            <CRMTableCell className="px-5 text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onTaskClick(task)}
                  className="text-muted-foreground/40 hover:text-primary transition-all"
                  aria-label={`Open task ${task.title}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground/70 hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl border-border/70 p-1.5 shadow-premium">
                    <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Quick actions
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="gap-2 rounded-lg py-2 text-xs font-medium">
                      <Play className="h-4 w-4 text-emerald-600" />
                      Start Timer
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 rounded-lg py-2 text-xs font-medium">
                      <UserPlus className="h-4 w-4 text-primary" />
                      Reassign
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" className="gap-2 rounded-lg py-2 text-xs font-medium">
                      <Trash2 className="h-4 w-4" />
                      Delete Task
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












