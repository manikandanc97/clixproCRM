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
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useState, Fragment, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { LeadType } from "@/types/lead";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CRMDataTable, 
  CRMTableHeader, 
  CRMTableBody, 
  CRMTableRow, 
  CRMTableCell, 
  CRMTableHeaderCell 
} from "@/components/shared/crm";
import { cn } from "@/lib/utils";
import { useCRMStore } from "@/store/useCRMStore";
import { toast } from "sonner";

const statusColors: Record<string, { bg: string, text: string, pulse: string }> = {
  "New": { bg: "bg-blue-500/10", text: "text-blue-500", pulse: "bg-blue-500" },
  "Contacted": { bg: "bg-amber-500/10", text: "text-amber-500", pulse: "bg-amber-500" },
  "Proposal Sent": { bg: "bg-indigo-500/10", text: "text-indigo-500", pulse: "bg-indigo-500" },
  "Won": { bg: "bg-emerald-500/10", text: "text-emerald-500", pulse: "bg-emerald-500" },
  "Lost": { bg: "bg-rose-500/10", text: "text-rose-500", pulse: "bg-rose-500" },
};

const priorityColors: Record<string, string> = {
  "High": "bg-rose-500",
  "Medium": "bg-amber-500",
  "Low": "bg-slate-400",
};

interface LeadsTableProps {
  leads: LeadType[];
  totalCount: number;
}

type SortConfig = {
  key: keyof LeadType | "score";
  direction: "asc" | "desc";
} | null;

const LeadsTable = ({ leads, totalCount }: LeadsTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const { deleteLead } = useCRMStore();

  const sortedLeads = useMemo(() => {
    if (!sortConfig) return leads;
    return [...leads].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [leads, sortConfig]);

  const handleSort = (key: keyof LeadType | "score") => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    deleteLead(id);
    toast.error("Lead Deleted", {
      description: `${name} has been removed from the CRM.`,
    });
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteLead(id));
    toast.error("Bulk Deletion Successful", {
      description: `${selectedIds.length} leads have been removed.`,
    });
    setSelectedIds([]);
  };

  const handleBulkEmail = () => {
    toast.success("Bulk Email Drafted", {
      description: `Opening composer for ${selectedIds.length} recipients.`,
    });
  };

  const handleBulkExport = () => {
    toast.info("Exporting Data", {
      description: `Preparing CSV for ${selectedIds.length} selected leads.`,
    });
  };

  const handleAction = (action: string, lead: LeadType) => {
    toast.info(`${action}: ${lead.name}`, {
      description: `Executing ${action.toLowerCase()} protocol for ${lead.company}.`,
    });
  };

  const SortIcon = ({ column }: { column: keyof LeadType | "score" }) => {
    if (sortConfig?.key !== column) return <ChevronDown className="w-3 h-3 opacity-20 group-hover:opacity-50" />;
    return sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <CRMDataTable>
          <CRMTableHeader>
            <CRMTableRow className="hover:bg-transparent">
              <CRMTableHeaderCell className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === leads.length && leads.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </CRMTableHeaderCell>
              <CRMTableHeaderCell 
                className="cursor-pointer group select-none"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Lead & Intelligence <SortIcon column="name" />
                </div>
              </CRMTableHeaderCell>
              <CRMTableHeaderCell 
                className="cursor-pointer group select-none"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status & Activity <SortIcon column="status" />
                </div>
              </CRMTableHeaderCell>
              <CRMTableHeaderCell 
                className="cursor-pointer group select-none"
                onClick={() => handleSort("value")}
              >
                <div className="flex items-center gap-2">
                  Deal Value <SortIcon column="value" />
                </div>
              </CRMTableHeaderCell>
              <CRMTableHeaderCell>Rep</CRMTableHeaderCell>
              <CRMTableHeaderCell className="text-right">Actions</CRMTableHeaderCell>
            </CRMTableRow>
          </CRMTableHeader>

          <CRMTableBody>
            <AnimatePresence mode="popLayout">
              {sortedLeads.map((lead, idx) => {
                const status = statusColors[lead.status] || { bg: "bg-muted", text: "text-muted-foreground", pulse: "bg-muted-foreground" };
                const isSelected = selectedIds.includes(lead.id);
                const isExpanded = expandedId === lead.id;

                return (
                  <Fragment key={lead.id}>
                    <CRMTableRow
                      onMouseEnter={() => setHoveredRow(lead.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => toggleExpand(lead.id)}
                      className={cn(
                        isSelected && "bg-primary/5",
                        isExpanded && "bg-muted/50"
                      )}
                    >
                      <CRMTableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(lead.id)}
                        />
                      </CRMTableCell>
                      
                      <CRMTableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center font-bold text-xs">
                              <AvatarFallback>{lead.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-background", priorityColors[lead.priority])} />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{lead.name}</p>
                              <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span className="text-[10px] font-bold">{lead.score}</span>
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{lead.company}</p>
                          </div>
                        </div>
                      </CRMTableCell>

                      <CRMTableCell>
                        <div className="space-y-1.5">
                          <Badge variant="outline" className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-none shadow-sm", status.bg, status.text)}>
                            <span className="relative flex h-1.5 w-1.5">
                              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", status.pulse)} />
                              <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", status.pulse)} />
                            </span>
                            {lead.status}
                          </Badge>
                          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lead.lastActivity}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {lead.source}</span>
                          </div>
                        </div>
                      </CRMTableCell>

                      <CRMTableCell>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-foreground">{lead.value}</p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase tracking-wider">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>24% Prob</span>
                          </div>
                        </div>
                      </CRMTableCell>

                      <CRMTableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="w-7 h-7 rounded-md border border-border bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              <AvatarFallback>{lead.assignedTo[0]}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-[10px] font-bold uppercase tracking-wider">{lead.assignedTo}</p>
                          </TooltipContent>
                        </Tooltip>
                      </CRMTableCell>

                      <CRMTableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className={cn(
                            "flex items-center gap-1 mr-2 transition-all duration-300",
                            hoveredRow === lead.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
                          )}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { e.stopPropagation(); handleAction("Email", lead); }}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { e.stopPropagation(); handleAction("Call", lead); }}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                            >
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
                              <DropdownMenuItem onClick={() => handleAction("View Profile", lead)}>
                                <User className="w-3.5 h-3.5 mr-2" /> Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("Schedule Meeting", lead)}>
                                <Calendar className="w-3.5 h-3.5 mr-2" /> Schedule
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => handleDelete(e as any, lead.id, lead.name)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CRMTableCell>
                    </CRMTableRow>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-muted/30"
                        >
                          <CRMTableCell colSpan={6} className="px-6 py-0">
                            <div className="pb-6 pt-2">
                              <div className="bg-card rounded-xl border border-border p-5 shadow-sm flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <h4 className="text-[11px] font-bold text-foreground uppercase tracking-widest">AI Intelligence</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {lead.aiInsights?.summary}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                                      Convert: {lead.aiInsights?.conversionProbability}%
                                    </Badge>
                                    <Badge variant="secondary" className="bg-success/10 text-success border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                                      High Intent
                                    </Badge>
                                  </div>
                                </div>
                                <div className="md:w-64 space-y-3">
                                  <div className="p-4 rounded-xl bg-foreground text-background space-y-2 relative overflow-hidden group">
                                    <div className="relative z-10">
                                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Recommended</p>
                                      <p className="text-xs font-bold leading-snug">{lead.aiInsights?.recommendation}</p>
                                    </div>
                                    <ArrowUpRight className="absolute -bottom-1 -right-1 w-12 h-12 text-background/10 transition-transform group-hover:scale-110" />
                                  </div>
                                  <Button 
                                    onClick={() => handleAction("AI Execution", lead)}
                                    className="w-full font-bold h-10 text-[10px] uppercase tracking-widest shadow-sm"
                                  >
                                    Execute Suggestion
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CRMTableCell>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                );
              })}
            </AnimatePresence>
          </CRMTableBody>
        </CRMDataTable>

        {/* Bulk Action Toolbar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0, x: "-50%" }}
              animate={{ y: 0, opacity: 1, x: "-50%" }}
              exit={{ y: 50, opacity: 0, x: "-50%" }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-foreground text-background rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-5 border border-border backdrop-blur-xl ring-4 ring-foreground/5">
                <div className="flex items-center gap-3 pr-5 border-r border-background/20">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs">
                    {selectedIds.length}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Selected</span>
                    <span className="text-xs font-bold tracking-tight">Bulk Action</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" className="flex flex-col gap-1 items-center h-auto py-1.5 px-3 rounded-lg hover:bg-background/10 text-muted-foreground hover:text-background transition-all group">
                    <User className="w-3.5 h-3.5 group-hover:scale-110" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Assign</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleBulkEmail}
                    className="flex flex-col gap-1 items-center h-auto py-1.5 px-3 rounded-lg hover:bg-background/10 text-muted-foreground hover:text-background transition-all group"
                  >
                    <Mail className="w-3.5 h-3.5 group-hover:scale-110" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Email</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleBulkExport}
                    className="flex flex-col gap-1 items-center h-auto py-1.5 px-3 rounded-lg hover:bg-background/10 text-muted-foreground hover:text-background transition-all group"
                  >
                    <Share2 className="w-3.5 h-3.5 group-hover:scale-110" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Export</span>
                  </Button>
                  <div className="w-px h-6 bg-background/20 mx-1" />
                  <Button 
                    variant="ghost" 
                    onClick={handleBulkDelete}
                    className="flex flex-col gap-1 items-center h-auto py-1.5 px-3 rounded-lg hover:bg-destructive/20 text-destructive hover:text-destructive-foreground transition-all group"
                  >
                    <Trash2 className="w-3.5 h-3.5 group-hover:scale-110" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Delete</span>
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedIds([])}
                  className="w-8 h-8 rounded-lg hover:bg-background/10 text-muted-foreground ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default LeadsTable;

