"use client";

import { PipelineLeadType } from "@/shared/types/pipeline";
import { 
  MoreHorizontal, 
  Calendar, 
  DollarSign, 
  Flame, 
  Clock, 
  MessageSquare, 
  UserPlus, 
  Zap,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/shared/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/shared/lib/utils";

interface Props {
  item: PipelineLeadType;
  isOverlay?: boolean;
}

const PipelineCard = ({ item, isOverlay }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, data: { type: 'Card', item } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High": return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTempIcon = (t: string) => {
    switch (t) {
      case "Hot": return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case "Warm": return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="bg-muted/50 rounded-xl border-2 border-dashed border-border h-[200px] w-full"
      />
    );
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing",
        isOverlay && "shadow-elevated ring-2 ring-primary/20 scale-105 opacity-90"
      )}
    >
      {/* Stuck Alert */}
      {item.isStuck && (
        <div className="absolute -top-1.5 -left-1.5 z-10">
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <div className="w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg animate-bounce">
                   <Clock className="w-3.5 h-3.5" />
                 </div>
               </TooltipTrigger>
               <TooltipContent>
                 <p className="text-[10px] font-bold">STUCK: No activity for 10 days</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1.5">
          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 h-5 w-fit", getPriorityColor(item.priority))}>
            {item.priority} Priority
          </Badge>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight text-sm">
            {item.name}
          </h3>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
             <DropdownMenuItem>
               <MessageSquare className="w-3.5 h-3.5 mr-2" /> Quick Note
             </DropdownMenuItem>
             <DropdownMenuItem>
               <UserPlus className="w-3.5 h-3.5 mr-2" /> Assign Owner
             </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem className="text-primary focus:text-primary">
               <Zap className="w-3.5 h-3.5 mr-2" /> AI Summary
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden">
           <img 
             src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.company}&backgroundColor=f1f5f9&textColor=64748b`} 
             alt={item.company}
             className="w-full h-full object-cover"
           />
        </div>
        <p className="text-[11px] font-bold text-muted-foreground truncate tracking-tight">{item.company}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
           <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Value</span>
           <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
             <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-success">
               <DollarSign className="w-3 h-3" />
             </div>
             {item.value}
           </div>
        </div>
        <div className="flex flex-col gap-1">
           <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Probability</span>
           <div className="flex items-center gap-2">
             <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${item.probability}%` }}
                 className={cn(
                   "h-full rounded-full",
                   item.probability > 70 ? 'bg-success' : item.probability > 30 ? 'bg-primary' : 'bg-muted-foreground'
                 )}
               />
             </div>
             <span className="text-[10px] font-bold text-foreground">{item.probability}%</span>
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <Avatar className="w-7 h-7 rounded-lg border border-border bg-muted flex items-center justify-center font-bold text-[10px]">
               <AvatarFallback>
                 {item.assignedTo.split(' ').map(n => n[0]).join('')}
               </AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Owner</span>
                <span className="text-[10px] font-bold text-foreground truncate max-w-[60px] leading-none">{item.assignedTo.split(' ')[0]}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 border border-border/50">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground">{item.activityCount}</span>
                 </div>
               </TooltipTrigger>
               <TooltipContent>
                 <p className="text-[10px] font-bold">Recent Activities</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>

           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <div className={cn(
                   "w-7 h-7 rounded-lg flex items-center justify-center border shadow-sm",
                   item.temperature === "Hot" ? "bg-orange-500/10 border-orange-500/20 text-orange-500" : 
                   item.temperature === "Warm" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : 
                   "bg-blue-500/10 border-blue-500/20 text-blue-500"
                 )}>
                   {getTempIcon(item.temperature)}
                 </div>
               </TooltipTrigger>
               <TooltipContent>
                 <p className="text-[10px] font-bold uppercase tracking-wider">{item.temperature} Lead</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>
        </div>
      </div>

      {/* Hover Quick Actions Bar */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-30 px-3">
         <div className="bg-foreground text-background rounded-xl shadow-elevated p-1 flex items-center justify-around ring-4 ring-foreground/5 mt-1">
            <button className="flex-1 py-1.5 rounded-lg hover:bg-background/10 transition-colors flex items-center justify-center gap-2">
               <Zap className="w-3.5 h-3.5 text-primary" />
               <span className="text-[9px] font-bold uppercase tracking-widest">AI Insight</span>
            </button>
            <div className="w-px h-4 bg-background/20" />
            <button className="flex-1 py-1.5 rounded-lg hover:bg-background/10 transition-colors flex items-center justify-center gap-2">
               <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
               <span className="text-[9px] font-bold uppercase tracking-widest">Details</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default PipelineCard;












