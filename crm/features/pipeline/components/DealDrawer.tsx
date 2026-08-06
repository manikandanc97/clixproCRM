"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { PipelineLeadType } from "@/shared/types/pipeline";
import { useUpdatePipelineItem } from "@/shared/hooks/use-crm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useCurrency } from "@/shared/hooks/use-currency";
import { DollarSign, IndianRupee, Flame, Clock, Calendar, Check, Save } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

interface DealDrawerProps {
  item: PipelineLeadType | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange?: (deal: PipelineLeadType, newStage: string) => void;
}

export function DealDrawer({ item, isOpen, onClose, onStageChange }: DealDrawerProps) {
  const { mutate: updateDeal, isPending } = useUpdatePipelineItem();
  const { formatCurrency, currency } = useCurrency();
  const CurrencyIcon = currency === "INR" ? IndianRupee : DollarSign;
  
  // Local state for editing
  const [formData, setFormData] = useState<Partial<PipelineLeadType>>({});
  const [prevItemId, setPrevItemId] = useState<string | undefined>(item?.id);

  // Sync item to formData on open (during render as recommended to avoid cascading renders)
  if (item?.id !== prevItemId) {
    setPrevItemId(item?.id);
    setFormData({});
  }

  if (!item) return null;

  const currentData = { ...item, ...formData };

  const stageToProbability: Record<string, number> = {
    "NEW": 10,
    "CONTACTED": 25,
    "PROPOSAL_SENT": 50,
    "WON": 100,
    "LOST": 0,
  };

  const hasChanges = Object.keys(formData).length > 0;

  const handleChange = (field: keyof PipelineLeadType, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const payload = {
      name: currentData.name,
      company: currentData.company,
      value: currentData.valueAmount,
      priority: currentData.priority,
    };

    // If stage was changed in the drawer, we save the other fields first,
    // then trigger the standard stage change flow (which handles Won/Lost modals)
    if (currentData.stage && currentData.stage !== item.stage && onStageChange) {
      updateDeal({
        id: item.id,
        data: payload
      }, {
        onSuccess: () => {
          toast.success("Deal updated successfully");
          onStageChange(item, currentData.stage as string);
        }
      });
      return;
    }

    updateDeal({
      id: item.id,
      data: payload
    }, {
      onSuccess: () => {
        toast.success("Deal updated successfully");
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[500px] p-0 flex flex-col max-h-[90vh] bg-background border-border overflow-hidden rounded-xl">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold tracking-tight">Deal Details</DialogTitle>
          <div className="flex gap-2 mt-3">
             <div className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-md font-bold">{currentData.stage}</div>
             <div className="text-xs px-2.5 py-1 bg-orange-500/10 text-orange-600 rounded-md font-bold">{currentData.priority} Priority</div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full h-full flex flex-col">
            <div className="px-6 pt-4 border-b border-border bg-background sticky top-0 z-10">
              <TabsList className="w-full flex items-center justify-start bg-transparent p-0 rounded-none h-auto gap-2 pb-4 overflow-x-auto border-none">
                <TabsTrigger value="overview" className="rounded-full text-xs font-bold px-4 py-1.5 border border-transparent data-[state=active]:border-primary/50 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm text-muted-foreground bg-transparent shadow-none">Overview</TabsTrigger>
                <TabsTrigger value="activities" className="rounded-full text-xs font-bold px-4 py-1.5 border border-transparent data-[state=active]:border-primary/50 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm text-muted-foreground bg-transparent shadow-none">Activities</TabsTrigger>
                <TabsTrigger value="tasks" className="rounded-full text-xs font-bold px-4 py-1.5 border border-transparent data-[state=active]:border-primary/50 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm text-muted-foreground bg-transparent shadow-none">Tasks</TabsTrigger>
                <TabsTrigger value="notes" className="rounded-full text-xs font-bold px-4 py-1.5 border border-transparent data-[state=active]:border-primary/50 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm text-muted-foreground bg-transparent shadow-none">Notes</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6 space-y-6 mt-0">
              {/* Editable Fields Grid */}
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deal Name</label>
                  <input 
                    type="text"
                    value={currentData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-semibold focus:border-primary outline-none transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Company</label>
                  <input 
                    type="text"
                    value={currentData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-semibold focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Value</label>
                  <div className="relative">
                    <CurrencyIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="number"
                      value={currentData.valueAmount || 0}
                      onChange={(e) => handleChange("valueAmount", Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm font-semibold focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stage</label>
                  <select
                    value={currentData.stage || item.stage}
                    onChange={(e) => {
                      const newStage = e.target.value;
                      handleChange("stage", newStage);
                      handleChange("probability", stageToProbability[newStage] || 0);
                    }}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-semibold focus:border-primary outline-none transition-colors"
                  >
                    <option value="NEW">New Lead</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority</label>
                  <select
                    value={currentData.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-semibold focus:border-primary outline-none transition-colors"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Probability (%)</label>
                  <input 
                    type="number"
                    min="0" max="100"
                    value={currentData.probability || 0}
                    onChange={(e) => handleChange("probability", Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm font-semibold focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="p-6">
              <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/10">
                <Clock className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm font-bold text-foreground">No recent activities</p>
                <p className="text-xs text-muted-foreground mt-1">Activities will appear here once logged.</p>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="p-6">
               <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/10">
                <Check className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm font-bold text-foreground">No tasks scheduled</p>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="p-6">
               <textarea 
                  placeholder="Type a note..."
                  className="w-full h-32 bg-muted/30 border border-border rounded-xl p-4 text-sm font-medium focus:border-primary outline-none transition-colors resize-none mb-4"
               />
               <Button className="w-full font-bold">Add Note</Button>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 border-t border-border bg-background">
           <Button onClick={handleSave} disabled={isPending || !hasChanges} className="w-full font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
             <Save className="w-4 h-4" /> {isPending ? "Saving..." : "Save Changes"}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
