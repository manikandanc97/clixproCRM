"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { PipelineLeadType } from "@/shared/types/pipeline";
import { PIPELINE_STAGE_LABELS } from "@/lib/crm-formatters";
import { cn } from "@/shared/lib/utils";

interface StageTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: PipelineLeadType | null;
  onSelectTargetStage: (deal: PipelineLeadType, targetStage: string) => void;
}

export function StageTransitionModal({ isOpen, onClose, deal, onSelectTargetStage }: StageTransitionModalProps) {
  const [selectedStage, setSelectedStage] = useState<string>("");

  if (!isOpen || !deal) return null;

  const stages = Object.values(PIPELINE_STAGE_LABELS);
  
  const handleConfirm = () => {
    if (selectedStage && selectedStage !== deal.stage) {
      onSelectTargetStage(deal, selectedStage);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Deal Stage</DialogTitle>
          <DialogDescription className="pt-2 text-sm text-foreground">
            Select the new stage for <strong>{deal.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            {stages.map((stage) => {
              const isCurrent = stage === deal.stage;
              const isSelected = stage === selectedStage;
              
              return (
                <button
                  key={stage}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => setSelectedStage(stage)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
                    isCurrent ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-60" 
                      : isSelected ? "bg-primary/10 border-primary text-primary" 
                      : "bg-background border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span>{stage}</span>
                    {isCurrent && <span className="text-xs uppercase tracking-wider font-bold">Current</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleConfirm} 
            disabled={!selectedStage || selectedStage === deal.stage}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
