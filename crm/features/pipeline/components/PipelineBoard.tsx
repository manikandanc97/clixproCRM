"use client";

import { useState, useRef } from "react";
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
import PipelineColumn from "./PipelineColumn";
import PipelineCard from "./PipelineCard";
import { PipelineLeadType } from "@/shared/types/pipeline";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { useUpdatePipelineItem } from "@/shared/hooks/use-crm";
import { DealDrawer } from "./DealDrawer";
import { WonLostModal, WonLostSubmitData } from "./WonLostModal";
import { ConfirmMoveModal } from "./ConfirmMoveModal";

const stages: PipelineLeadType["stage"][] = ["New Lead", "Contacted", "Proposal Sent", "Won", "Lost"];

interface PipelineBoardProps {
  items: PipelineLeadType[];
  onAddDeal?: (stage: string) => void;
}

const PipelineBoard = ({ items, onAddDeal }: PipelineBoardProps) => {
  const [activeItem, setActiveItem] = useState<PipelineLeadType | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<PipelineLeadType | null>(null);
  const [wonLostModal, setWonLostModal] = useState<{ isOpen: boolean; type: "Won" | "Lost" | null; deal: PipelineLeadType | null; originalStage: PipelineLeadType["stage"] | null }>({
    isOpen: false,
    type: null,
    deal: null,
    originalStage: null,
  });
  const [confirmMoveModal, setConfirmMoveModal] = useState<{ isOpen: boolean; deal: PipelineLeadType | null; targetStage: string | null; originalStage: string | null }>({
    isOpen: false,
    deal: null,
    targetStage: null,
    originalStage: null,
  });
  const originalStageRef = useRef<PipelineLeadType["stage"] | null>(null);
  
  const { movePipelineItem, setPipelineItems } = useCRMStore();
  const { mutate: updatePipelineItem, isPending: isUpdating } = useUpdatePipelineItem();

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
    if (item) {
      setActiveItem(item);
      originalStageRef.current = item.stage;
    }
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

    if (isOverAColumn && stages.includes(overId as PipelineLeadType["stage"])) {
      movePipelineItem(activeId as string, overId as PipelineLeadType["stage"]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    // Capture the original stage reliably
    const originalStage = originalStageRef.current || activeItem?.stage || active.data.current?.item?.stage || "New Lead";
    setActiveItem(null);
    originalStageRef.current = null;

    if (!over) {
      movePipelineItem(active.id as string, originalStage);
      return;
    }

    const activeId = active.id;

    // Always read from the most up-to-date store state directly,
    // since handleDragOver already moved the item to the new column synchronously.
    const currentStoreItems = useCRMStore.getState().pipelineItems;
    const movedItem = currentStoreItems.find(i => i.id === activeId);

    if (movedItem) {
      const targetStage = movedItem.stage;
      // Unified entry point for handling stage changes (from Drag & Drop or Dropdown)
      handleStageChange(movedItem, targetStage, originalStage);
    }
  };

  const handleStageChange = (deal: PipelineLeadType, targetStage: string, originalStage: string) => {
    // Prevent API call if dropped in the same column, but ensure visual state is correct
    if (targetStage === originalStage) {
      movePipelineItem(deal.id as string, originalStage as any);
      return;
    }

    if (targetStage === "Lost" || targetStage === "Won") {
      setWonLostModal({
        isOpen: true,
        type: targetStage as "Won" | "Lost",
        deal: { ...deal, stage: targetStage as any },
        originalStage: originalStage as any
      });
      return;
    }

    // Regular stage change
    setConfirmMoveModal({
      isOpen: true,
      deal: { ...deal, stage: originalStage as any },
      targetStage,
      originalStage,
    });
  };

  const handleConfirmMoveSubmit = () => {
    if (!confirmMoveModal.deal || !confirmMoveModal.targetStage || !confirmMoveModal.originalStage) return;
    
    const deal = confirmMoveModal.deal;
    const targetStage = confirmMoveModal.targetStage;
    const originalStage = confirmMoveModal.originalStage;


    const stageToEnum: Record<string, string> = {
      "New Lead": "NEW",
      "Contacted": "CONTACTED",
      "Proposal Sent": "PROPOSAL_SENT",
      "Won": "WON",
      "Lost": "LOST",
    };
    const stage = stageToEnum[targetStage] || "NEW";


    // Update local state to reflect the move visually before API if not already done
    movePipelineItem(deal.id as string, targetStage as any);
    
    updatePipelineItem({ 
      id: deal.id as string, 
      data: { stage } 
    }, {
      onSuccess: () => {
        if (originalStage === "Won") {
          toast.success(`Deal moved from Won to ${targetStage}.`, {
            description: "Customer status updated successfully.",
          });
        } else {
          toast.success(`Deal moved from ${originalStage} to ${targetStage}.`);
        }
        setConfirmMoveModal(prev => ({ ...prev, isOpen: false }));
      },
      onError: () => {
        movePipelineItem(deal.id as string, originalStage as any);
        toast.error("Unable to update deal. No changes were saved.");
        setConfirmMoveModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleConfirmMoveCancel = () => {
    if (confirmMoveModal.deal && confirmMoveModal.originalStage) {
      movePipelineItem(confirmMoveModal.deal.id as string, confirmMoveModal.originalStage as any);
    }
    setConfirmMoveModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleAddStage = () => {
    toast.info("Add Pipeline Stage", {
      description: "Opening stage configuration panel...",
    });
  };

  const handleWonLostSubmit = (data: WonLostSubmitData) => {
    if (!wonLostModal.deal || !wonLostModal.type) return;
    
    const stageToEnum: Record<string, string> = { "Won": "WON", "Lost": "LOST" };
    const stage = stageToEnum[wonLostModal.type] || "NEW";
    
    // Update locally
    movePipelineItem(wonLostModal.deal.id as string, wonLostModal.type);

    updatePipelineItem({
      id: wonLostModal.deal.id as string,
      data: {
        stage,
        ...(wonLostModal.type === "Won" 
            ? { wonReason: data.reason, wonDate: data.wonDate, actualRevenue: data.actualRevenue, notes: data.notes } 
            : { lostReason: data.reason, competitor: data.competitor, notes: data.notes })
      }
    }, {
      onSuccess: () => {
        if (wonLostModal.type === "Won") {
          toast.success(`Deal moved from ${wonLostModal.originalStage} to Won.`, {
            description: "Lead successfully converted to Customer.",
          });
        } else {
          if (wonLostModal.originalStage === "Won") {
            toast.success(`Deal moved from Won to Lost.`, {
              description: "Customer status updated successfully.",
            });
          } else {
            toast.success(`Deal moved from ${wonLostModal.originalStage} to Lost.`);
          }
        }
        setWonLostModal(prev => ({ ...prev, isOpen: false }));
      },
      onError: () => {
        if (wonLostModal.originalStage && wonLostModal.deal) {
          movePipelineItem(wonLostModal.deal.id as string, wonLostModal.originalStage);
        }
        toast.error("Unable to update deal. No changes were saved.");
        setWonLostModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleWonLostCancel = () => {
    if (wonLostModal.deal && wonLostModal.originalStage) {
      // Revert the move
      movePipelineItem(wonLostModal.deal.id as string, wonLostModal.originalStage);
    }
    setWonLostModal(prev => ({ ...prev, isOpen: false }));
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
                onSelectDeal={setSelectedDeal}
                onAddDeal={onAddDeal}
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
      
      <DealDrawer 
        item={selectedDeal} 
        isOpen={!!selectedDeal} 
        onClose={() => setSelectedDeal(null)} 
        onStageChange={(deal, targetStage) => {
          setSelectedDeal(null);
          // Briefly timeout to allow drawer to close before opening the modal
          setTimeout(() => handleStageChange(deal, targetStage, deal.stage), 150);
        }}
      />
      
      <ConfirmMoveModal 
        isOpen={confirmMoveModal.isOpen}
        deal={confirmMoveModal.deal}
        targetStage={confirmMoveModal.targetStage}
        onClose={handleConfirmMoveCancel}
        onSubmit={handleConfirmMoveSubmit}
        isLoading={isUpdating}
      />

      <WonLostModal 
        isOpen={wonLostModal.isOpen}
        type={wonLostModal.type}
        deal={wonLostModal.deal}
        onClose={handleWonLostCancel}
        onSubmit={handleWonLostSubmit}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default PipelineBoard;
