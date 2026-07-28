"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Download,
  Target,
  AlertCircle,
  SearchX,
  List,
  Kanban,
  Calendar as CalendarIcon,
  GanttChart,
  CheckCircle2,
} from "lucide-react";

import dynamic from "next/dynamic";
const TasksTable = dynamic(() => import("@/features/tasks/components/TasksTable"));
const KanbanView = dynamic(() => import("@/features/tasks/components/KanbanView").then(mod => ({ default: mod.KanbanView })));
const CalendarView = dynamic(() => import("@/features/tasks/components/CalendarView").then(mod => ({ default: mod.CalendarView })));
const TimelineView = dynamic(() => import("@/features/tasks/components/TimelineView").then(mod => ({ default: mod.TimelineView })));
const TaskDetailsDrawer = dynamic(() => import("@/features/tasks/components/TaskDetailsDrawer"));
import { PageErrorState } from "@/shared/components/page-states";
import { TasksSkeleton } from "@/features/tasks/components/TasksSkeleton";
import { useTasks } from "@/shared/hooks/use-crm";
import { TaskType } from "@/shared/types/task";
import { Button } from "@/shared/ui/button";
import {
  CRMPageHeader,
  CRMMetricCard,
  CRMToolbar,
  CRMPageContainer,
  CRMMetricsGrid,
} from "@/shared/components/crm";
import { motion, AnimatePresence } from "framer-motion";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { FormModal } from "@/shared/components/form-modal";
const TaskForm = dynamic(() => import("@/features/forms/TaskForm").then(mod => ({ default: mod.TaskForm })));
import { useSearchParams } from "next/navigation";

const VIEW_MODES = [
  { id: "list", icon: List, label: "List" },
  { id: "kanban", icon: Kanban, label: "Board" },
  { id: "calendar", icon: CalendarIcon, label: "Calendar" },
  { id: "timeline", icon: GanttChart, label: "Timeline" },
] as const;

type TaskViewMode = (typeof VIEW_MODES)[number]["id"];

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

const TasksPage = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<TaskViewMode>("list");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(searchParams.get("new") === "true");

  const { tasks, setTasks } = useCRMStore();
  const safeTasks = useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks]);
  const { data, isLoading: loading, error, refetch } = useTasks();

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data?.tasks) {
      setTasks(data.tasks);
    }
  }, [data?.tasks, setTasks]);

  const filteredTasks = useMemo(() => {
    return safeTasks.filter((task: TaskType) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery) ||
        "Unassigned".toLowerCase().includes(normalizedQuery);
      const normalizedStatus = task.status.toLowerCase().replace(/\s+/g, "-");
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [safeTasks, searchQuery, statusFilter]);

  const completedCount = safeTasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressCount = safeTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdueCount = safeTasks.filter((t) => t.isOverdue).length;

  const handleNewTask = () => {
    setIsAddModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Tasks Exported", {
      description: `Exported ${filteredTasks.length} tasks to productivity manifest.`,
    });
  };

  if (loading && safeTasks.length === 0) {
    return <TasksSkeleton />;
  }

  if (error && safeTasks.length === 0) {
    return (
      <PageErrorState title="Tasks unavailable" message={(error as Error).message || "An error occurred"} onRetry={() => { refetch(); }} />
    );
  }

  return (
    <CRMPageContainer>
      {/* Page Header */}
      <CRMPageHeader
        title="Tasks"
        subtitle="Organize your workflow, track productivity, and collaborate with your team."
        icon={CheckSquare}
        badge="Productivity"
        actions={[
          { label: "Export", icon: Download, onClick: handleExport, variant: "outline" },
          { label: "New Task", icon: Plus, onClick: handleNewTask, variant: "default" },
        ]}
      />

      {/* Metric Cards */}
      <CRMMetricsGrid>
        <CRMMetricCard
          title="Total Tasks"
          value={safeTasks.length}
          change="0%"
          trend="up"
          icon={CheckSquare}
          color="blue"
          delay={0.05}
        />
        <CRMMetricCard
          title="Completed"
          value={completedCount}
          change="0%"
          trend="up"
          icon={CheckCircle2}
          color="emerald"
          delay={0.1}
        />
        <CRMMetricCard
          title="In Progress"
          value={inProgressCount}
          change="0%"
          trend="up"
          icon={Target}
          color="orange"
          delay={0.15}
        />
        <CRMMetricCard
          title="Overdue"
          value={overdueCount}
          change="0%"
          trend={overdueCount > 0 ? "down" : "up"}
          icon={AlertCircle}
          color="pink"
          delay={0.2}
        />
      </CRMMetricsGrid>

      {/* Toolbar */}
      <CRMToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search tasks, assignees..."
      >
        {/* Status filters */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-full">
          {STATUS_FILTERS.map((s) => {
            const key = s.id === "all" ? "all" : s.id;
            const isActive = statusFilter === key;
            return (
              <Button
                key={s.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(key)}
                className="h-9 px-3 text-xs font-semibold"
              >
                {s.label}
              </Button>
            );
          })}
        </div>

        <div className="hidden sm:block w-px h-6 bg-border/60" />

        {/* View mode toggles */}
        <div className="crm-segment">
          {VIEW_MODES.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={viewMode === id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode(id)}
              className={cn(
                "h-8 gap-1.5 px-2.5 text-[11px] font-semibold",
                viewMode === id ? "text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </CRMToolbar>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {filteredTasks.length > 0 ? (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === "list" && (
              <TasksTable tasks={filteredTasks} onTaskClick={setSelectedTask} />
            )}
            {viewMode === "kanban" && (
              <KanbanView tasks={filteredTasks} onTaskClick={setSelectedTask} />
            )}
            {viewMode === "calendar" && (
              <CalendarView tasks={filteredTasks} onTaskClick={setSelectedTask} />
            )}
            {viewMode === "timeline" && (
              <TimelineView tasks={filteredTasks} onTaskClick={setSelectedTask} />
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="crm-empty-state"
          >
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-5">
              <SearchX className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6 text-sm font-medium">
              Try adjusting your search or filters to find the tasks you&apos;re looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
              className="px-5"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <TaskDetailsDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <FormModal
        title="Create New Task"
        description="Add a new task to your productivity list."
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        size="lg"
      >
        <TaskForm 
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </FormModal>
    </CRMPageContainer>
  );
};

export default TasksPage;
