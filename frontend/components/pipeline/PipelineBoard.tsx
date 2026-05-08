"use client";

import { useState, useEffect } from "react";
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
  SortableContext, 
  sortableKeyboardCoordinates, 
  horizontalListSortingStrategy 
} from "@dnd-kit/sortable";
import PipelineColumn from "./PipelineColumn";
import PipelineCard from "./PipelineCard";
import { PipelineLeadType } from "@/types/pipeline";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useCRMStore } from "@/store/useCRMStore";

const stages = ["New Lead", "Contacted", "Proposal Sent", "Won", "Lost"];

interface PipelineBoardProps {
  items: PipelineLeadType[];
}

const PipelineBoard = ({ items }: PipelineBoardProps) => {
  const [activeItem, setActiveItem] = useState<PipelineLeadType | null>(null);
  const { movePipelineItem, setPipelineItems } = useCRMStore();

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
    const item = items.find((i) => i.id === active.id);
    if (item) setActiveItem(item);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === "Card";
    const isOverACard = over.data.current?.type === "Card";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveACard) return;

    if (isOverACard) {
      const activeIndex = items.findIndex((i) => i.id === activeId);
      const overIndex = items.findIndex((i) => i.id === overId);

      if (items[activeIndex].stage !== items[overIndex].stage) {
        movePipelineItem(activeId as string, items[overIndex].stage);
      } else {
        const newItems = arrayMove(items, activeIndex, overIndex);
        setPipelineItems(newItems);
      }
    }

    if (isOverAColumn) {
      movePipelineItem(activeId as string, overId as any);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      const movedItem = items.find(i => i.id === activeId);
      if (movedItem) {
        toast.success(`Deal moved to ${movedItem.stage}`, {
          description: `${movedItem.name} stage updated successfully.`,
        });
      }
    }
  };

  const handleAddStage = () => {
    toast.info("Add Pipeline Stage", {
      description: "Opening stage configuration panel...",
    });
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
        <div className="flex gap-6 overflow-x-auto pb-4 kanban-board-scroll -mx-8 px-8 h-[calc(100vh-260px)] min-h-[600px] items-start">
          {stages.map((stage) => {
            const stageItems = items.filter((item) => item.stage === stage);

            return (
              <PipelineColumn 
                key={stage} 
                title={stage} 
                items={stageItems} 
              />
            );
          })}
          
          {/* Add Stage Placeholder */}
          <div 
            onClick={handleAddStage}
            className="min-w-[340px] h-[180px] rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-muted/40 transition-all cursor-pointer group shadow-sm"
          >
             <div className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
               <Plus className="w-5 h-5" />
             </div>
             <span className="text-xs font-bold uppercase tracking-widest">Add New Stage</span>
          </div>
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
          {activeItem ? (
            <PipelineCard item={activeItem} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default PipelineBoard;

