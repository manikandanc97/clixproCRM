"use client";

import { PipelineLeadType } from "@/types/pipeline";
import PipelineCard from "./PipelineCard";
import { Plus, MoreHorizontal, TrendingUp, DollarSign, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  items: PipelineLeadType[];
}

const PipelineColumn = ({ title, items }: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
    data: { type: 'Column', title }
  });

  const totalValue = items.reduce((sum, item) => sum + item.valueAmount, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalValue);

  const getHeaderIconColor = (t: string) => {
    switch (t) {
      case "Won": return "bg-success";
      case "Lost": return "bg-destructive";
      case "Proposal Sent": return "bg-primary";
      case "Contacted": return "bg-warning";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-muted/30 rounded-xl min-w-[340px] max-w-[340px] h-full border border-border transition-all duration-300 overflow-hidden",
        isOver && "ring-2 ring-primary/40 bg-muted/50 shadow-lg"
      )}
    >
      {/* Column Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={cn("w-2 h-2 rounded-full", getHeaderIconColor(title))} />
            <h2 className="font-bold text-foreground tracking-tight text-sm">{title}</h2>
            <Badge variant="secondary" className="bg-background text-muted-foreground border-border shadow-sm rounded-full h-5 px-1.5 min-w-[20px] justify-center text-[10px] font-bold">
              {items.length}
            </Badge>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between bg-background/50 rounded-xl p-3 border border-border shadow-sm">
           <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Value</span>
              <span className="text-sm font-bold text-foreground tabular-nums leading-none">{formattedTotal}</span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Efficiency</span>
              <div className="flex items-center gap-1 text-success font-bold text-[11px] leading-none">
                 <TrendingUp className="w-3 h-3" />
                 84%
              </div>
           </div>
        </div>
      </div>

      {/* Cards Area */}
      <div className="flex-1 px-3 pt-4 space-y-4 overflow-y-auto kanban-board-scroll pb-6">
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <PipelineCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-xl bg-background/20 group hover:border-primary/30 transition-all">
               <div className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all mb-3">
                  <Target className="w-5 h-5" />
               </div>
               <p className="text-[11px] font-bold text-muted-foreground">No deals in this stage</p>
               <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-wider">Drag deals here</p>
            </div>
          )}
        </SortableContext>
        
        <button className="w-full py-4 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-background/50 transition-all flex items-center justify-center gap-2 group mt-2">
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold tracking-tight">Add New Deal</span>
        </button>
      </div>

      {/* Column Footer Analytics */}
      <div className="px-5 py-3 bg-background/40 border-t border-border flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
               <DollarSign className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg: <span className="text-foreground">${items.length ? Math.floor(totalValue/items.length).toLocaleString() : 0}</span></span>
         </div>
      </div>
    </div>
  );
};

export default PipelineColumn;
