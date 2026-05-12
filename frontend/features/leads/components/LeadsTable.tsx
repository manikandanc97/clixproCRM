"use client";

import { 
  Mail, 
  Phone, 
  MoreVertical, 
  Sparkles, 
  Calendar, 
  User, 
  ArrowUpRight, 
  X,
  Trash2,
  Share2,
  Clock,
  Tag,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/shared/ui/dropdown-menu";
import { LeadType } from "@/shared/types/lead";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/shared/ui/checkbox";
import { CommonTooltip } from "@/shared/components/CommonTooltip";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge, StatusVariant } from "@/shared/components/StatusBadge";
import { cn } from "@/shared/lib/utils";
import { useLeads } from "../hooks/useLeads";
import { toast } from "sonner";

interface LeadsTableProps {
  leads: LeadType[];
  totalCount: number;
}

const statusVariantMap: Record<string, StatusVariant> = {
  "New": "blue",
  "Contacted": "amber",
  "Proposal Sent": "indigo",
  "Won": "emerald",
  "Lost": "rose",
};

const priorityColors: Record<string, string> = {
  "High": "bg-rose-500",
  "Medium": "bg-amber-500",
  "Low": "bg-slate-400",
};

const LeadsTable = ({ leads, totalCount }: LeadsTableProps) => {
  const {
    sortedLeads,
    selectedIds,
    setSelectedIds,
    expandedId,
    sortConfig,
    handleSort,
    toggleSelectAll,
    toggleSelect,
    toggleExpand,
    handleDelete,
  } = useLeads(leads);

  const columns = [
    {
      header: (
        <Checkbox 
          checked={selectedIds.length === leads.length && leads.length > 0}
          onCheckedChange={toggleSelectAll}
        />
      ),
      cell: (lead: LeadType) => (
        <Checkbox 
          checked={selectedIds.includes(lead.id)}
          onCheckedChange={() => toggleSelect(lead.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      className: "w-[50px]",
    },
    {
      header: (
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => handleSort("name")}
        >
          Lead & Intelligence
        </div>
      ),
      cell: (lead: LeadType) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center font-bold text-xs">
              <AvatarFallback>{lead.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-background", priorityColors[lead.priority])} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground transition-colors text-sm">{lead.name}</p>
              <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                <Sparkles className="w-2.5 h-2.5" />
                <span className="text-[10px] font-bold">{lead.score}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{lead.company}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Status & Activity",
      cell: (lead: LeadType) => (
        <div className="space-y-1.5">
          <StatusBadge 
            status={lead.status} 
            variant={statusVariantMap[lead.status]} 
          />
          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lead.lastActivity}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {lead.source}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Deal Value",
      cell: (lead: LeadType) => (
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-foreground">{lead.value}</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            <ArrowUpRight className="w-3 h-3" />
            <span>24% Prob</span>
          </div>
        </div>
      ),
    },
    {
      header: "Rep",
      cell: (lead: LeadType) => (
        <CommonTooltip content={lead.assignedTo}>
          <Avatar className="w-7 h-7 rounded-md border border-border bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
            <AvatarFallback>{lead.assignedTo[0]}</AvatarFallback>
          </Avatar>
        </CommonTooltip>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cell: (lead: LeadType) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <div className="mr-2 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary">
              <Mail className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary">
              <Phone className="w-3.5 h-3.5" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem><User className="w-3.5 h-3.5 mr-2" /> Profile</DropdownMenuItem>
              <DropdownMenuItem><Calendar className="w-3.5 h-3.5 mr-2" /> Schedule</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(lead.id, lead.name)}
                className="text-rose-600 focus:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="relative">
      <DataTable 
        data={sortedLeads}
        columns={columns}
        onRowClick={(lead) => toggleExpand(lead.id)}
        rowClassName={(lead) => expandedId === lead.id ? "bg-muted/30" : ""}
      />

      {/* Detail View for Expanded Row */}
      <AnimatePresence>
        {expandedId && (
          <div className="w-full bg-muted/20 border-b border-border">
            {/* Intelligence detail could be a separate component */}
            <div className="p-6">
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-[11px] font-bold text-foreground uppercase tracking-widest">AI Intelligence</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI predicts a high conversion probability based on recent engagement and company growth metrics.
                  </p>
                </div>
                <div className="md:w-64">
                   <Button className="w-full font-bold h-10 text-[10px] uppercase tracking-widest">
                     Execute Suggestion
                   </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Action Toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 50, opacity: 0, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50"
          >
            <div className="bg-foreground text-background rounded-2xl px-6 py-4 shadow-premium flex items-center gap-6 border border-border/10 backdrop-blur-xl">
               <div className="flex items-center gap-3 pr-6 border-r border-background/20">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs">
                    {selectedIds.length}
                  </div>
                  <span className="text-xs font-bold">Leads Selected</span>
               </div>
               <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" className="hover:bg-background/10 h-9">
                   <Mail className="size-4 mr-2" /> Email
                 </Button>
                 <Button variant="ghost" size="sm" className="hover:bg-background/10 h-9">
                   <Share2 className="size-4 mr-2" /> Export
                 </Button>
                 <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="h-9 w-9 p-0">
                   <X className="size-4" />
                 </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadsTable;





