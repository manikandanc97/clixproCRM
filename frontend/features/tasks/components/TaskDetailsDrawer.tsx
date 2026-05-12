"use client";

import type { ComponentType } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";
import { TaskType } from "@/shared/types/task";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Progress } from "@/shared/ui/progress";
import { ActivityTimeline } from "@/shared/components/crm";
import { cn } from "@/shared/lib/utils";

interface TaskDetailsDrawerProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailsDrawer = ({
  task,
  isOpen,
  onClose,
}: TaskDetailsDrawerProps) => {
  if (!task) return null;

  const collaborators = task.collaborators?.length ?? 0;
  const isCompleted = task.status === "Completed";
  const statusTone = isCompleted
    ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    : task.status === "In Progress"
      ? "text-blue-600 bg-blue-500/10 border-blue-500/20"
      : "text-amber-600 bg-amber-500/10 border-amber-500/20";

  const activityItems = [
    {
      id: `${task.id}-activity-1`,
      title: "Task created",
      description: `Assigned to ${task.assignedTo} under ${task.category ?? "General"} workspace.`,
      time: "Recently",
      icon: Sparkles,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: `${task.id}-activity-2`,
      title: "Progress updated",
      description: `${task.progress}% completion tracked against ${task.estimatedTime ?? "4h"} estimate.`,
      time: task.lastActivity ?? "2h ago",
      icon: Clock,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      id: `${task.id}-activity-3`,
      title: isCompleted ? "Task completed" : "Next milestone",
      description: isCompleted
        ? "All checkpoints marked complete and ready for reporting."
        : `Due on ${task.dueDate}. ${task.isOverdue ? "This item needs urgent attention." : "On track with current pace."}`,
      time: "Now",
      icon: isCompleted ? CheckCircle2 : AlertCircle,
      iconBg: isCompleted ? "bg-emerald-500/10" : "bg-amber-500/10",
      iconColor: isCompleted ? "text-emerald-600" : "text-amber-600",
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        showCloseButton={false}
        className="flex h-full flex-col border-l border-border/60 bg-background p-0 sm:max-w-2xl"
      >
        <header className="shrink-0 border-b border-border/60 bg-card/40 px-6 py-5 backdrop-blur-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-border/70 bg-background/60 text-[10px] font-semibold uppercase tracking-wide"
              >
                {task.category ?? "General"}
              </Badge>
              <Badge
                className={cn(
                  "border text-[10px] font-semibold uppercase tracking-wide",
                  statusTone,
                )}
              >
                {task.status}
              </Badge>
              {task.isUrgent && (
                <Badge className="border border-rose-500/30 bg-rose-500/10 text-[10px] font-semibold uppercase tracking-wide text-rose-600">
                  Urgent
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Close task details"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <SheetTitle className="text-2xl font-bold leading-tight text-foreground">
            {task.title}
          </SheetTitle>
          <SheetDescription className="mt-2 text-sm text-muted-foreground">
            Managed by {task.assignedTo} • Last updated{" "}
            {task.lastActivity ?? "recently"}
          </SheetDescription>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2">
              <Avatar className="h-7 w-7 border border-border/60">
                <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                  {task.assignedTo
                    .split(" ")
                    .filter(Boolean)
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-foreground">
                  {task.assignedTo}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Owner
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground">
              Priority:{" "}
              <span className="font-semibold text-foreground">
                {task.priority}
              </span>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground">
              Due:{" "}
              <span className="font-semibold text-foreground">
                {task.dueDate}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6 px-6 py-6 pb-24">
              <section className="rounded-xl border border-border/60 bg-card p-4">
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <StatTile
                    label="Progress"
                    value={`${task.progress}%`}
                    icon={CheckCircle2}
                  />
                  <StatTile
                    label="Estimate"
                    value={task.estimatedTime ?? "4h"}
                    icon={Clock}
                  />
                  <StatTile
                    label="Collaborators"
                    value={String(collaborators)}
                    icon={Users}
                  />
                  <StatTile
                    label="Attachments"
                    value={String(task.attachmentsCount ?? 0)}
                    icon={Tag}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>Completion</span>
                    <span className="font-semibold text-foreground">
                      {task.progress}%
                    </span>
                  </div>
                  <Progress
                    value={task.progress}
                    className="h-2 bg-muted"
                    indicatorClassName={
                      isCompleted ? "bg-emerald-500" : "bg-primary"
                    }
                  />
                </div>
              </section>

              <section className="rounded-xl border border-border/60 bg-card p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {task.description}
                </p>
                {task.aiSummary && (
                  <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      AI Summary
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                      {task.aiSummary}
                    </p>
                  </div>
                )}
                {(task.tags?.length ?? 0) > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {task.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-border/70 bg-background text-[10px] font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-border/60 bg-card p-4">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Activity Timeline
                </h3>
                <ActivityTimeline items={activityItems} className="space-y-6" />
              </section>

              {task.isOverdue && (
                <section className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-rose-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-rose-700">
                        Task is overdue
                      </h4>
                      <p className="mt-1 text-xs text-rose-700/80">
                        Due date has passed. Reprioritize this task or update
                        the schedule.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>
        </div>

        <footer className="shrink-0 border-t border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
            <Button
              variant="outline"
              className="h-10 w-full gap-2 px-4 text-xs font-semibold sm:w-auto"
            >
              <Play className="h-3.5 w-3.5" />
              <span className="truncate">Start Timer</span>
            </Button>

            <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:min-w-0 sm:items-center">
              <Button
                variant="ghost"
                className="h-10 w-full min-w-0 px-2 text-xs font-semibold sm:w-auto sm:px-4"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span className="truncate">Reschedule</span>
              </Button>
              <Button
                className="h-10 w-full min-w-0 px-2 text-xs font-semibold sm:w-auto sm:px-5"
                disabled={isCompleted}
              >
                <span className="truncate">
                  {isCompleted ? "Completed" : "Mark Complete"}
                </span>
              </Button>
            </div>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
};

interface StatTileProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}

const StatTile = ({ label, value, icon: Icon }: StatTileProps) => (
  <div className="rounded-lg border border-border/60 bg-background/60 p-3">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
    <p className="text-sm font-semibold text-foreground">{value}</p>
  </div>
);

export default TaskDetailsDrawer;












