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
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  arrayMove, 
  sortableKeyboardCoordinates, 
} from "@dnd-kit/sortable";
import { TaskType } from "@/types/task";
import { TaskKanbanColumn } from "./TaskKanbanColumn";
import { TaskKanbanCard } from "./TaskKanbanCard";
import { useCRMStore } from "@/store/useCRMStore";
import { toast } from "sonner";

interface KanbanViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
}

export const KanbanView = ({ tasks, onTaskClick }: KanbanViewProps) => {
  const statuses = ["Pending", "In Progress", "Completed"];
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const { updateTask, setTasks } = useCRMStore();

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

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveATask) return;

    if (isOverATask) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (tasks[activeIndex].status !== tasks[overIndex].status) {
        updateTask(activeId as string, { status: tasks[overIndex].status as any });
      }
    }

    if (isOverAColumn) {
      updateTask(activeId as string, { status: overId as any });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      const movedTask = tasks.find(t => t.id === activeId);
      if (movedTask) {
        toast.success(`Task moved to ${movedTask.status}`, {
          description: `"${movedTask.title}" updated successfully.`,
        });
      }
    }
  };

  return (
    <div className="relative">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 kanban-board-scroll items-start min-h-[600px]">
          {statuses.map((status) => {
            const statusTasks = tasks.filter((t) => t.status === status);
            return (
              <TaskKanbanColumn 
                key={status} 
                id={status} 
                title={status} 
                tasks={statusTasks} 
                onTaskClick={onTaskClick} 
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
            <TaskKanbanCard task={activeTask} onClick={onTaskClick} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};


