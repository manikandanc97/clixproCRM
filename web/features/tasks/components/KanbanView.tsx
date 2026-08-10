"use client";

import { useState } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  sortableKeyboardCoordinates, 
} from "@dnd-kit/sortable";
import { TaskType } from "@/shared/types/task";
import { TaskKanbanColumn } from "./TaskKanbanColumn";
import { TaskKanbanCard } from "./TaskKanbanCard";
import { useUpdateTaskStatus } from "@/shared/hooks/use-crm";

interface KanbanViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  onAddTask?: (status?: string) => void;
  onScheduleMeeting?: (task: TaskType) => void;
  onEditTask?: (task: TaskType) => void;
}

const COLUMN_CONFIGS: { id: TaskType["status"]; title: string; color: string }[] = [
  { id: "PENDING", title: "Pending", color: "blue" },
  { id: "IN_PROGRESS", title: "In Progress", color: "amber" },
  { id: "BLOCKED", title: "Blocked", color: "red" },
  { id: "COMPLETED", title: "Completed", color: "emerald" },
  { id: "OVERDUE", title: "Overdue", color: "rose" },
  { id: "CANCELLED", title: "Cancelled", color: "slate" },
];

export const KanbanView = ({ tasks, onTaskClick, onAddTask, onScheduleMeeting, onEditTask }: KanbanViewProps) => {
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const updateStatusMutation = useUpdateTaskStatus();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let targetStatus: TaskType["status"] | null = null;

    if (COLUMN_CONFIGS.some((c) => c.id === overId)) {
      targetStatus = overId as TaskType["status"];
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (activeTaskObj && targetStatus && activeTaskObj.status !== targetStatus) {
      updateStatusMutation.mutate({ id: activeId, status: targetStatus });
    }
  };

  return (
    <div className="relative">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-6 kanban-board-scroll items-start min-h-[600px]">
          {COLUMN_CONFIGS.map((col) => {
            const statusTasks = tasks.filter((t) => t.status === col.id);
            return (
              <TaskKanbanColumn 
                key={col.id} 
                id={col.id} 
                title={col.title} 
                tasks={statusTasks} 
                onTaskClick={onTaskClick}
                onAddTask={() => onAddTask?.(col.id)}
                onScheduleMeeting={onScheduleMeeting}
                onEditTask={onEditTask}
              />
            );
          })}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}>
          {activeTask ? (
            <TaskKanbanCard task={activeTask} onClick={onTaskClick} onScheduleMeeting={onScheduleMeeting} onEditTask={onEditTask} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
