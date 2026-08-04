"use client";

import { 
  Mail, 
  Phone, 
  MoreVertical, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Calendar, 
  User, 
  X,
  Trash2,
  Share2,
  SearchX,
  Clock,
  Tag,
  MessageCircle,
  Building,
  CheckCircle2,
  Edit2,
  Inbox,
  ArrowRight,
  RefreshCw,
  Globe,
  Smartphone,
  Users,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { FormModal } from "@/shared/components/form-modal";
import { LeadForm } from "@/features/forms/LeadForm";
import { TaskForm } from "@/features/forms/TaskForm";
import { CustomerForm } from "@/features/forms/CustomerForm";
import { MeetingForm } from "@/features/forms/MeetingForm";
import { StageTransitionModal } from "./StageTransitionModal";
import { ConfirmMoveModal } from "@/features/pipeline/components/ConfirmMoveModal";
import { WonLostModal, WonLostSubmitData } from "@/features/pipeline/components/WonLostModal";
import { useCurrency } from "@/shared/hooks/use-currency";
import { useUpdatePipelineItem } from "@/shared/hooks/use-crm";
import { updateLead } from "@/shared/lib/api/crm";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
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
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge, StatusVariant } from "@/shared/components/StatusBadge";
import { cn } from "@/shared/lib/utils";
import { useLeads } from "../hooks/useLeads";
import { Badge } from "@/shared/ui/badge";
import { AddNoteModal } from "./AddNoteModal";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { LeadDetailsDrawer } from "./LeadDetailsDrawer";
import { formatDistanceToNow } from "date-fns";
import { LeadEmptyState } from "./LeadEmptyState";

interface LeadsTableProps {
  leads: LeadType[];
  totalCount: number;
  rawTotalCount?: number;
  globalSearchQuery?: string;
  globalStatusFilter?: string;
  onActiveFiltersChange?: (hasFilters: boolean) => void;
  onClearFilters?: (clearFn: () => void) => void;
  onGlobalClearFilters?: () => void;
  onAddLead?: () => void;
  onImport?: () => void;
}

const statusVariantMap: Record<string, StatusVariant> = {
  "New": "blue",
  "Contacted": "amber",
  "Proposal Sent": "indigo",
  "Won": "emerald",
  "Lost": "rose",
};

const getPriorityColor = (p?: string) => {
  switch (p) {
    case "Urgent": return "bg-destructive text-destructive-foreground border-destructive";
    case "High": return "bg-destructive/10 text-destructive border-destructive/20";
    case "Medium": return "bg-primary/10 text-primary border-primary/20";
    case "Low": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

// Helper for follow-up date check
const isOverdue = (dateStr: string | null | undefined) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};


const LeadsTable = ({ 
  leads, 
  totalCount,
  rawTotalCount,
  globalSearchQuery,
  globalStatusFilter,
  onActiveFiltersChange, 
  onClearFilters,
  onGlobalClearFilters,
  onAddLead,
  onImport
}: LeadsTableProps) => {
  const {
    sortedLeads,
    selectedIds,
    setSelectedIds,
    handleSort,
    sortConfig,
    filters,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    toggleSelectAll,
    toggleSelect,
    handleDelete,
    handleBulkDelete,
    isDeletingBulk,
  } = useLeads(leads);

  useEffect(() => {
    onActiveFiltersChange?.(hasActiveFilters);
  }, [hasActiveFilters, onActiveFiltersChange]);

  useEffect(() => {
    if (onClearFilters) {
      onClearFilters(() => clearFilters);
    }
  }, [clearFilters, onClearFilters]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(sortedLeads.length / rowsPerPage);
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const [editingLead, setEditingLead] = useState<LeadType | null>(null);
  const [taskLead, setTaskLead] = useState<LeadType | null>(null);
  const [meetingLead, setMeetingLead] = useState<LeadType | null>(null);
  const [customerLead, setCustomerLead] = useState<LeadType | null>(null);
  const [deletingLead, setDeletingLead] = useState<LeadType | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [stageTransitionLead, setStageTransitionLead] = useState<LeadType | null>(null);
  const [addNoteLead, setAddNoteLead] = useState<string | null>(null);
  const [detailsLeadId, setDetailsLeadId] = useState<string | null>(null);
  
  const [confirmMoveModal, setConfirmMoveModal] = useState<{ isOpen: boolean; deal: any; targetStage: string | null; originalStage: string | null }>({ isOpen: false, deal: null, targetStage: null, originalStage: null });
  const [wonLostModal, setWonLostModal] = useState<{ isOpen: boolean; type: "Won" | "Lost" | null; deal: any; originalStage: string | null }>({ isOpen: false, type: null, deal: null, originalStage: null });

  const { mutate: updatePipelineItem, isPending: isUpdating } = useUpdatePipelineItem();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  const handleStageChange = (lead: LeadType, targetStage: string) => {
    const originalStage = lead.status;
    const deal = { ...lead, stage: originalStage };
    
    if (targetStage === "Lost" || targetStage === "Won") {
      setWonLostModal({
        isOpen: true,
        type: targetStage as "Won" | "Lost",
        deal: { ...deal, stage: targetStage },
        originalStage
      });
      return;
    }
    setConfirmMoveModal({
      isOpen: true,
      deal: { ...deal, stage: originalStage },
      targetStage,
      originalStage,
    });
  };

  const handleConfirmMoveSubmit = () => {
    if (!confirmMoveModal.deal || !confirmMoveModal.targetStage || !confirmMoveModal.originalStage) return;
    const { deal, targetStage, originalStage } = confirmMoveModal;
    const stageToEnum: Record<string, string> = { "New Lead": "NEW", "Contacted": "CONTACTED", "Proposal Sent": "PROPOSAL_SENT", "Won": "WON", "Lost": "LOST" };
    const stage = stageToEnum[targetStage] || "NEW";

    updatePipelineItem({ id: deal.id, data: { stage } }, {
      onSuccess: () => {
        toast.success(`Deal moved from ${originalStage} to ${targetStage}.`);
        setConfirmMoveModal(prev => ({ ...prev, isOpen: false }));
      },
      onError: () => {
        toast.error("Unable to update deal.");
        setConfirmMoveModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleWonLostSubmit = (data: WonLostSubmitData) => {
    if (!wonLostModal.deal || !wonLostModal.type) return;
    const stageToEnum: Record<string, string> = { "Won": "WON", "Lost": "LOST" };
    const stage = stageToEnum[wonLostModal.type] || "NEW";
    
    updatePipelineItem({
      id: wonLostModal.deal.id,
      data: {
        stage,
        ...(wonLostModal.type === "Won" 
            ? { wonReason: data.reason, wonDate: data.wonDate, actualRevenue: data.actualRevenue, notes: data.notes } 
            : { lostReason: data.reason, competitor: data.competitor, notes: data.notes })
      }
    }, {
      onSuccess: () => {
        toast.success(`Deal moved to ${wonLostModal.type}.`);
        setWonLostModal(prev => ({ ...prev, isOpen: false }));
      },
      onError: () => {
        toast.error("Unable to update deal.");
        setWonLostModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAction = (e: React.MouseEvent, action: string, leadName: string, lead?: LeadType) => {
    e.stopPropagation();

    if (action === "Email Draft" && lead?.email) {
      window.location.href = `mailto:${lead.email}`;
    } else if (action === "Call Initiated" && lead?.phone) {
      window.location.href = `tel:${lead.phone}`;
    }

    toast.success(`${action} Initiated`, {
      description: `Action applied to ${leadName}`,
    });
  };

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
      className: "w-[40px] pr-0",
    },
    {
      header: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground text-muted-foreground transition-colors text-xs font-semibold uppercase tracking-wider group">
              Lead Information
              <ChevronDown className={cn("w-3 h-3 transition-opacity", sortConfig?.key === "name" ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100")} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sort By</div>
            {[
              { label: "A to Z", val: "asc" },
              { label: "Z to A", val: "desc" }
            ].map(s => (
              <DropdownMenuItem key={s.val} onClick={() => handleSort("name", s.val as any)} className="text-xs cursor-pointer">
                {s.label}
                {sortConfig?.key === "name" && sortConfig.direction === s.val && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: (lead: LeadType) => (
        <div className="flex items-center gap-3 py-1 cursor-pointer group" onClick={(e) => { e.stopPropagation(); setDetailsLeadId(lead.id); }}>
          <Avatar className="w-10 h-10 rounded-full border border-border shadow-sm group-hover:border-primary/50 transition-colors">
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
              {lead.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground text-sm leading-none group-hover:text-primary transition-colors">{lead.name}</p>
              <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-medium">
                {lead.company}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {lead.email}
              </span>
            </div>
          </div>
        </div>
      ),
      className: "w-full min-w-[240px]",
    },
    {
      header: (
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stage</div>
      ),
      cell: (lead: LeadType) => (
        <StatusBadge 
          status={lead.status} 
          variant={statusVariantMap[lead.status] || "slate"} 
        />
      ),
      className: "w-[130px]",
    },
    {
      header: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground text-muted-foreground transition-colors text-xs font-semibold uppercase tracking-wider group">
              Priority
              <ChevronDown className={cn("w-3 h-3 transition-opacity", filters.priority !== "All Priorities" ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100")} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {["All Priorities", "Low", "Medium", "High"].map(p => (
              <DropdownMenuItem key={p} onClick={() => updateFilter("priority", p)} className="text-xs cursor-pointer">
                {p}
                {filters.priority === p && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: (lead: LeadType) => {
        return (
          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 h-4", getPriorityColor(lead.priority))}>
            {lead.priority || "Low"}
          </Badge>
        );
      },
      className: "w-[90px]",
    },
    {
      header: (
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</div>
      ),
      cell: (lead: LeadType) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
          {lead.phone || "N/A"}
        </div>
      ),
      className: "w-[130px]",
    },
    {
      header: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground text-muted-foreground transition-colors text-xs font-semibold uppercase tracking-wider group">
              Deal Value
              <ChevronDown className={cn("w-3 h-3 transition-opacity", sortConfig?.key === "valueAmount" ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100")} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sort By</div>
            {[
              { label: "High to Low", val: "desc" },
              { label: "Low to High", val: "asc" }
            ].map(s => (
              <DropdownMenuItem key={s.val} onClick={() => handleSort("valueAmount", s.val as any)} className="text-xs cursor-pointer">
                {s.label}
                {sortConfig?.key === "valueAmount" && sortConfig.direction === s.val && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: (lead: LeadType) => {
        const prob = lead.probability || 0;
        const val = lead.valueAmount ? formatCurrency(lead.valueAmount) : formatCurrency(Number(String(lead.value).replace(/[^0-9.-]+/g,"")));
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-foreground">{val}</span>
            <span className="text-xs font-semibold text-muted-foreground">{prob}%</span>
          </div>
        );
      },
      className: "w-[100px]",
    },
    {
      header: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground text-muted-foreground transition-colors text-xs font-semibold uppercase tracking-wider group">
              Activity
              <ChevronDown className={cn("w-3 h-3 transition-opacity", (filters.activity !== "All Activity" || sortConfig?.key === "activity") ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100")} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sort By</div>
            {[
              { label: "Newest Activity", val: "newest" },
              { label: "Oldest Activity", val: "oldest" },
              { label: "Upcoming Follow-up", val: "upcoming" },
              { label: "Overdue First", val: "overdue" },
            ].map(s => (
              <DropdownMenuItem key={s.val} onClick={() => handleSort("activity", s.val as any)} className="text-xs cursor-pointer">
                {s.label}
                {sortConfig?.key === "activity" && sortConfig.direction === s.val && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Filter By</div>
            {["All Activity", "Overdue", "Today", "Tomorrow", "This Week", "No Follow-up Scheduled", "No Activity"].map(f => (
              <DropdownMenuItem key={f} onClick={() => updateFilter("activity", f)} className="text-xs cursor-pointer">
                {f}
                {filters.activity === f && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: (lead: LeadType) => {
        const overdue = isOverdue(lead.followUpAt);
        const dateStr = lead.updatedAt || lead.createdAt;
        let formattedDate = "";
        if (dateStr) {
          try {
            formattedDate = new Intl.DateTimeFormat("en-US", {
              month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true
            }).format(new Date(dateStr));
          } catch(e) {}
        }
        
        return (
          <div className="flex flex-col gap-1.5">
            {lead.status === "Won" ? (
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-xs font-medium", overdue ? "text-rose-600 font-bold" : "text-foreground")}>
                  {lead.followUp || "No Follow-up Scheduled"}
                </span>
                {overdue && (
                  <span className="text-[10px] text-rose-500 flex items-center gap-1 font-semibold">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Overdue
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-col mt-1">
              {lead.notes && lead.notes.length > 0 ? (
                <>
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    📝 {lead.notes.length} Note{lead.notes.length !== 1 && 's'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[160px] leading-tight">
                    <span className="font-medium">Last Note:</span> {lead.notes[0].message}
                  </span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                    {formatDistanceToNow(new Date(lead.notes[0].createdAt), { addSuffix: true })}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-muted-foreground font-semibold">Last Activity</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                    {lead.lastActivity || formattedDate || "No notes"}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      },
      className: "hidden lg:table-cell w-[170px]",
      headerClassName: "hidden lg:table-cell",
    },
    {
      header: (
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Notes</div>
      ),
      cell: (lead: LeadType) => {
        const count = lead.notesCount || 0;
        return (
          <div className="flex justify-center">
            <Badge 
              variant={count > 0 ? "secondary" : "outline"} 
              className={cn(
                "cursor-pointer hover:opacity-80 transition-opacity gap-1.5 px-2.5 py-1 text-xs font-semibold",
                count > 0 ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-transparent" : "text-muted-foreground bg-transparent"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setDetailsLeadId(lead.id);
              }}
            >
              📝 {count}
            </Badge>
          </div>
        );
      },
      className: "w-[90px]",
    },
    {
      header: (
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meetings</div>
      ),
      cell: (lead: LeadType) => {
        const meeting = lead.upcomingMeeting;
        if (!meeting) {
          return <div className="text-[11px] text-muted-foreground font-medium">No Meeting</div>;
        }
        
        let timeStr = "";
        try {
          const date = new Date(meeting.startTime);
          timeStr = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }).format(date);
        } catch(e) {}
        
        return (
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Upcoming</span>
            <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
              📅 {timeStr}
            </span>
          </div>
        );
      },
      className: "w-[150px]",
    },
    {
      header: (
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</div>
      ),
      headerClassName: "text-right",
      cell: (lead: LeadType) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={(e) => handleAction(e, "Email Draft", lead.name, lead)}>
            <Mail className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" onClick={(e) => handleAction(e, "Call Initiated", lead.name, lead)}>
            <Phone className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-foreground hover:bg-muted ml-1">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-lg border-border/50">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingLead(lead); }} className="gap-2 text-xs cursor-pointer"><Edit2 className="w-3.5 h-3.5" /> Edit Lead</DropdownMenuItem>
              
              {lead.status === "Won" && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); if(lead.customerId) router.push(`/customers/${lead.customerId}`); else toast.error("Customer ID not found"); }} className="gap-2 text-xs text-blue-600 focus:text-blue-700 cursor-pointer">
                    <User className="w-3.5 h-3.5" /> View Customer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); if(lead.customerId) router.push(`/customers/${lead.customerId}`); else toast.error("Customer ID not found"); }} className="gap-2 text-xs text-blue-600 focus:text-blue-700 cursor-pointer">
                    <Building className="w-3.5 h-3.5" /> Open Customer Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); if(lead.customerId) router.push(`/customers/${lead.customerId}`); else toast.error("Customer ID not found"); }} className="gap-2 text-xs text-blue-600 focus:text-blue-700 cursor-pointer">
                    <Tag className="w-3.5 h-3.5" /> View Customer Details
                  </DropdownMenuItem>
                </>
              )}

              {lead.status !== "Won" && lead.status !== "Lost" && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStageChange(lead, "Won"); }} className="gap-2 text-xs text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950 cursor-pointer font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Convert to Customer (Mark Won)
                </DropdownMenuItem>
              )}

              {lead.status === "Lost" ? (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setStageTransitionLead(lead); }} className="gap-2 text-xs cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> Reopen Lead</DropdownMenuItem>
              ) : lead.status !== "Won" ? (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setStageTransitionLead(lead); }} className="gap-2 text-xs cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> Move Stage</DropdownMenuItem>
              ) : null}

              <DropdownMenuSeparator />

              {lead.status !== "Lost" && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setTaskLead(lead); }} className="gap-2 text-xs cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" /> Create Task</DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setMeetingLead(lead); }} className="gap-2 text-xs cursor-pointer"><Calendar className="w-3.5 h-3.5" /> Schedule Meeting</DropdownMenuItem>
              
              {lead.status !== "Lost" && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction(e, "Email Draft", lead.name, lead); }} className="gap-2 text-xs cursor-pointer"><Mail className="w-3.5 h-3.5" /> Send Email</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction(e, "Call Initiated", lead.name, lead); }} className="gap-2 text-xs cursor-pointer"><Phone className="w-3.5 h-3.5" /> Call</DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); setDeletingLead(lead); }}
                variant="destructive"
                className="gap-2 text-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right w-[110px]",
    },
  ];

  if (sortedLeads.length === 0) {
    const activeFiltersContext = [];
    if (globalSearchQuery) activeFiltersContext.push({ label: "Search", value: globalSearchQuery });
    if (globalStatusFilter && globalStatusFilter !== "all") activeFiltersContext.push({ label: "Global Stage", value: globalStatusFilter });
    if (filters.stage !== "All Stages") activeFiltersContext.push({ label: "Stage", value: filters.stage });
    if (filters.priority !== "All Priorities") activeFiltersContext.push({ label: "Priority", value: filters.priority });
    if (filters.activity !== "All Activity") activeFiltersContext.push({ label: "Activity", value: filters.activity });
    
    return (
      <LeadEmptyState 
        totalLeads={rawTotalCount ?? leads.length}
        searchQuery={globalSearchQuery}
        hasFilters={Boolean(hasActiveFilters || (globalStatusFilter && globalStatusFilter !== "all"))}
        activeFilters={activeFiltersContext}
        onClearSearch={onGlobalClearFilters}
        onClearFilters={() => {
          clearFilters();
          if (onGlobalClearFilters) onGlobalClearFilters();
        }}
        onResetAll={() => {
          clearFilters();
          if (onGlobalClearFilters) onGlobalClearFilters();
        }}
        onAddLead={onAddLead || (() => {})} 
        onImport={onImport || (() => toast.info("Import feature coming soon."))}
      />
    );
  }

  return (
    <div className="flex-auto flex flex-col min-h-0 relative">


      {/* Desktop & Tablet Table View */}
      <div className="hidden md:flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden h-auto max-h-[calc(100vh-360px)]">
        <DataTable 
          data={paginatedLeads}
          columns={columns}
          wrapperClassName="flex-auto overflow-auto relative"
          rowClassName="h-16 hover:bg-muted/30 transition-colors"
          emptyTitle="No leads found"
          emptyDescription="No leads match the current search or filters."
        />
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden flex-auto overflow-y-auto pr-1">
        {paginatedLeads.map((lead) => (
          <div key={lead.id} className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={selectedIds.includes(lead.id)}
                  onCheckedChange={() => toggleSelect(lead.id)}
                />
                <Avatar className="w-10 h-10 rounded-full border shadow-sm">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                    {lead.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">{lead.company}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingLead(lead); }}>Edit Lead</DropdownMenuItem>
                  
                  {lead.status === "Won" && (
                    <>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); if(lead.customerId) router.push(`/customers/${lead.customerId}`); else toast.error("Customer ID not found"); }}>View Customer</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); if(lead.customerId) router.push(`/customers/${lead.customerId}`); else toast.error("Customer ID not found"); }}>Open Customer Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); if(lead.customerId) router.push(`/customers/${lead.customerId}`); else toast.error("Customer ID not found"); }}>View Customer Details</DropdownMenuItem>
                    </>
                  )}

                  {lead.status === "Lost" ? (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setStageTransitionLead(lead); }}>Reopen Lead</DropdownMenuItem>
                  ) : lead.status !== "Won" ? (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setStageTransitionLead(lead); }}>Move Stage</DropdownMenuItem>
                  ) : null}

                  <DropdownMenuSeparator />

                  {lead.status !== "Lost" && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setTaskLead(lead); }}>Create Task</DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setMeetingLead(lead); }}>Schedule Meeting</DropdownMenuItem>
                  
                  {lead.status !== "Lost" && (
                    <>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction(e, "Email Draft", lead.name, lead); }}>Send Email</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction(e, "Call Initiated", lead.name, lead); }}>Call</DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeletingLead(lead); }} variant="destructive">Delete Lead</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Stage</span>
                <div>
                  <StatusBadge status={lead.status} variant={statusVariantMap[lead.status] || "slate"} />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Value</span>
                <p className="text-sm font-bold text-foreground">{lead.valueAmount ? formatCurrency(lead.valueAmount) : formatCurrency(Number(String(lead.value).replace(/[^0-9.-]+/g,"")))}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Priority</span>
                <div>
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getPriorityColor(lead.priority))}>
                    {lead.priority || "Low"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Next Follow-up</span>
                {lead.status === "Won" ? (
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </p>
                ) : (
                  <p className={cn("text-xs font-medium", isOverdue(lead.followUpAt) ? "text-rose-600" : "text-foreground")}>
                    {lead.followUp}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Button variant="outline" size="sm" className="flex-1 gap-2 h-9 text-xs" onClick={(e) => handleAction(e, "Email Draft", lead.name, lead)}>
                <Mail className="w-3.5 h-3.5" /> Email
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-2 h-9 text-xs" onClick={(e) => handleAction(e, "Call Initiated", lead.name, lead)}>
                <Phone className="w-3.5 h-3.5" /> Call
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {sortedLeads.length > 10 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 bg-card border border-border rounded-xl p-4 shadow-sm flex-shrink-0">
          <div className="text-sm text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
            Showing <span className="font-bold text-foreground">{(currentPage - 1) * rowsPerPage + 1}</span>–<span className="font-bold text-foreground">{Math.min(currentPage * rowsPerPage, sortedLeads.length)}</span> of <span className="font-bold text-foreground">{new Intl.NumberFormat().format(sortedLeads.length)}</span> Leads
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Rows per page:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 font-semibold">
                    {rowsPerPage} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[4rem]">
                  {[10, 25, 50, 100].map(size => (
                    <DropdownMenuItem key={size} onClick={() => { setRowsPerPage(size); setCurrentPage(1); }} className="font-medium text-sm cursor-pointer hover:bg-muted">
                      {size}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center justify-center px-4 text-sm font-semibold text-foreground min-w-[5rem]">
                Page {currentPage}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 50, opacity: 0, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 w-[90%] md:w-auto"
          >
            <div className="bg-foreground text-background rounded-xl px-6 py-4 shadow-premium flex flex-col md:flex-row items-center gap-4 md:gap-6 border border-border/10 backdrop-blur-xl">
               <div className="flex items-center gap-3 md:pr-6 md:border-r border-background/20 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs shadow-sm">
                      {selectedIds.length}
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap">Leads Selected</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="h-8 w-8 p-0 md:hidden text-muted hover:text-background">
                    <X className="w-4 h-4" />
                  </Button>
               </div>
               <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                 <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10 h-9 whitespace-nowrap" onClick={(e) => handleAction(e, "Bulk Email", `${selectedIds.length} Leads`)}>
                   <Mail className="size-4 mr-2" /> Email
                 </Button>
                 <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10 h-9 whitespace-nowrap" onClick={(e) => handleAction(e, "Bulk Update Stage", `${selectedIds.length} Leads`)}>
                   <Edit2 className="size-4 mr-2" /> Update Stage
                 </Button>
                 <Button variant="ghost" size="sm" className="hover:bg-background/10 h-9 whitespace-nowrap text-rose-400 hover:text-rose-300" onClick={() => setIsBulkDeleting(true)}>
                   <Trash2 className="size-4 mr-2" /> Delete
                 </Button>
                 <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="h-9 w-9 p-0 hidden md:flex text-muted hover:text-background">
                   <X className="size-4" />
                 </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FormModal
        title="Edit Lead"
        description="Update the details of this lead."
        isOpen={!!editingLead}
        onOpenChange={(open) => !open && setEditingLead(null)}
        size="lg"
      >
        {editingLead && (
          <LeadForm 
            initialData={editingLead}
            onSuccess={() => setEditingLead(null)} 
            onCancel={() => setEditingLead(null)} 
          />
        )}
      </FormModal>

      <FormModal
        title="Create Task"
        description={`Create a new task for ${taskLead?.name}.`}
        isOpen={!!taskLead}
        onOpenChange={(open) => !open && setTaskLead(null)}
        size="md"
      >
        {taskLead && (
          <TaskForm 
            onSuccess={() => setTaskLead(null)} 
            onCancel={() => setTaskLead(null)} 
          />
        )}
      </FormModal>

      <FormModal
        title="Schedule Meeting"
        description={`Schedule a meeting with ${meetingLead?.name}.`}
        isOpen={!!meetingLead}
        onOpenChange={(open) => !open && setMeetingLead(null)}
        size="md"
      >
        {meetingLead && (
          <MeetingForm 
            onSuccess={() => setMeetingLead(null)} 
            onCancel={() => setMeetingLead(null)} 
          />
        )}
      </FormModal>

      <FormModal
        title="Convert to Customer"
        description={`Convert ${customerLead?.name} to a customer.`}
        isOpen={!!customerLead}
        onOpenChange={(open) => !open && setCustomerLead(null)}
        size="lg"
      >
        {customerLead && (
          <CustomerForm 
            initialData={{
              name: customerLead.name,
              company: customerLead.company,
              email: customerLead.email,
              status: "ACTIVE",
              revenueValue: customerLead.valueAmount || 0,
              createdAt: customerLead.createdAt,
              updatedAt: customerLead.updatedAt,
            } as any}
            onSuccess={async () => {
              // Mark lead as Won
              try {
                await updateLead(customerLead.id, { status: "Won" });
                queryClient.invalidateQueries({ queryKey: ["leads"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                toast.success(`${customerLead.name} has been marked as Won.`);
              } catch {
                toast.error("Failed to update lead status to Won.");
              }
              setCustomerLead(null);
            }}
            onCancel={() => setCustomerLead(null)} 
          />
        )}
      </FormModal>

      <StageTransitionModal
        isOpen={!!stageTransitionLead}
        onClose={() => setStageTransitionLead(null)}
        deal={stageTransitionLead ? { ...stageTransitionLead, stage: stageTransitionLead.status } as any : null}
        onSelectTargetStage={(deal, targetStage) => {
          setStageTransitionLead(null);
          setTimeout(() => handleStageChange(stageTransitionLead!, targetStage), 150);
        }}
      />

      <ConfirmMoveModal 
        isOpen={confirmMoveModal.isOpen}
        deal={confirmMoveModal.deal}
        targetStage={confirmMoveModal.targetStage}
        onClose={() => setConfirmMoveModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleConfirmMoveSubmit}
        isLoading={isUpdating}
      />

      <WonLostModal 
        isOpen={wonLostModal.isOpen}
        type={wonLostModal.type}
        deal={wonLostModal.deal}
        onClose={() => setWonLostModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleWonLostSubmit}
        isLoading={isUpdating}
      />

      <AlertDialog open={!!deletingLead} onOpenChange={(open) => !open && setDeletingLead(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lead <strong>{deletingLead?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive" 
              onClick={() => {
                if (deletingLead) {
                  handleDelete(deletingLead.id, deletingLead.name);
                  setDeletingLead(null);
                }
              }}
            >
              Delete Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleting} onOpenChange={(open) => !isDeletingBulk && setIsBulkDeleting(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Leads?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedIds.length} selected leads? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBulk}>Cancel</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={async () => {
                await handleBulkDelete(selectedIds);
                setIsBulkDeleting(false);
              }}
              disabled={isDeletingBulk}
            >
              {isDeletingBulk ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Leads"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddNoteModal 
        isOpen={!!addNoteLead} 
        onOpenChange={(open) => !open && setAddNoteLead(null)} 
        leadId={addNoteLead} 
      />
      
      <LeadDetailsDrawer
        isOpen={!!detailsLeadId}
        onOpenChange={(open) => !open && setDetailsLeadId(null)}
        leadId={detailsLeadId}
      />
    </div>
  );
};

export default LeadsTable;
