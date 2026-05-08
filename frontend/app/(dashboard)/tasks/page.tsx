"use client";

import { useState, useMemo } from "react";
import { CheckSquare, Plus, Download, TrendingUp, Clock, Target, SearchX, LayoutGrid } from "lucide-react";

import TasksTable from "@/components/tasks/TasksTable";
import { KanbanView } from "@/components/tasks/KanbanView";
import { CalendarView } from "@/components/tasks/CalendarView";
import { TimelineView } from "@/components/tasks/TimelineView";
import TaskDetailsDrawer from "@/components/tasks/TaskDetailsDrawer";
import { ProductivityWidgets } from "@/components/tasks/ProductivityWidgets";
import { PageErrorState, PageLoadingState } from "@/components/shared/page-states";
import { useApiResource } from "@/hooks/use-api-resource";
import { fetchTasksData } from "@/lib/api/crm";
import { TaskType } from "@/types/task";
import { Button } from "@/components/ui/button";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMToolbar 
} from "@/components/shared/crm";
import { motion, AnimatePresence } from "framer-motion";

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "calendar" | "timeline">("list");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  
  const { data, loading, error, refetch } = useApiResource(fetchTasksData);

  const augmentedTasks = useMemo(() => {
    if (!data?.tasks) return [];
    
    return data.tasks.map((task: any, idx: number) => ({
      ...task,
      progress: task.status === "Completed" ? 100 : task.status === "In Progress" ? 45 + (idx * 7) % 40 : 0,
      category: idx % 3 === 0 ? "Development" : idx % 3 === 1 ? "Design" : "Marketing",
      estimatedTime: idx % 2 === 0 ? "4h 30m" : "1h 15m",
      isOverdue: idx === 1 || idx === 4,
      isUrgent: idx === 0 || idx === 2,
    }));
  }, [data]);

  const filteredTasks = useMemo(() => {
    return augmentedTasks.filter((task: TaskType) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery) ||
        task.assignedTo.toLowerCase().includes(normalizedQuery);
      const normalizedStatus = task.status.toLowerCase().replace(/\s+/g, "-");
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [augmentedTasks, searchQuery, statusFilter]);

  if (loading && !data) {
    return <PageLoadingState label="Loading your intelligent workspace..." />;
  }

  if (error && !data) {
    return (
      <PageErrorState
        title="Tasks unavailable"
        message={error}
        onRetry={refetch}
      />
    );
  }

  const sparklineData = [
    { value: 40 }, { value: 30 }, { value: 60 }, { value: 80 }, { value: 50 }, { value: 90 }, { value: 100 }
  ];

  return (
    <div className="flex flex-col lg:row min-h-screen">
      <div className="flex-1 space-y-8 p-8 max-w-[1600px] mx-auto pb-20">
        <CRMPageHeader 
          title="Tasks"
          subtitle="Organize your workflow, track productivity, and collaborate with your team in real-time."
          icon={CheckSquare}
          badge="Productivity Center"
          actions={[
            {
              label: "Export",
              icon: Download,
              onClick: () => console.log("Export"),
              variant: "outline"
            },
            {
              label: "New Task",
              icon: Plus,
              onClick: () => console.log("Add"),
              variant: "default"
            }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CRMMetricCard 
            title="Total Tasks"
            value={augmentedTasks.length}
            change="+4.2%"
            trend="up"
            icon={CheckSquare}
            color="orange"
            sparklineData={sparklineData}
            delay={0.1}
          />
          <CRMMetricCard 
            title="Completed"
            value="12"
            change="+5"
            trend="up"
            icon={Target}
            color="emerald"
            sparklineData={sparklineData}
            delay={0.2}
          />
          <CRMMetricCard 
            title="Avg. Completion"
            value="3.2 Days"
            change="-0.5"
            trend="up"
            icon={Clock}
            color="indigo"
            sparklineData={sparklineData}
            delay={0.3}
          />
        </div>

        <CRMToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search tasks, descriptions..."
        >
          <div className="flex items-center gap-2">
            {["All", "Pending", "In Progress", "Completed"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status.toLowerCase().replace(/\s+/g, "-") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(status.toLowerCase().replace(/\s+/g, "-"))}
                className="h-8 px-3 text-xs font-semibold"
              >
                {status}
              </Button>
            ))}
          </div>
          <div className="w-px h-6 bg-border mx-1" />
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
            {["list", "kanban", "calendar", "timeline"].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode as any)}
                className="h-8 px-2 text-[10px] font-bold uppercase tracking-wider"
              >
                {mode}
              </Button>
            ))}
          </div>
        </CRMToolbar>

        <AnimatePresence mode="wait">
          {filteredTasks.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="transition-all duration-300"
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
              className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-dashed border-border shadow-inner"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <SearchX className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No tasks found</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-8 text-sm font-medium">
                Try adjusting your search or filters to find the tasks you're looking for.
              </p>
              <Button 
                variant="outline" 
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="font-bold rounded-xl px-6 h-11"
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Productivity Sidebar */}
      <div className="hidden xl:block w-96 p-8 border-l border-border bg-card/30 backdrop-blur-xl">
        <ProductivityWidgets />
      </div>

      <TaskDetailsDrawer 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  );
};

export default TasksPage;
