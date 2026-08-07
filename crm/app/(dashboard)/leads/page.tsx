"use client";

import { LeadStatus } from "@/shared/types/lead";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";

const LeadsTable = dynamic(() => import("@/features/leads/components/LeadsTable"), {
  loading: () => <div className="h-[400px] skeleton rounded-xl" />
});
import { UserPlus, Mail, Phone, Sparkles, Zap, Download, Users, TrendingUp,
  ChevronRight, UploadCloud, X, MoreVertical, ChevronLeft, ChevronsLeft, ChevronsRight,
  Calendar, User, Trash2, Edit2, CheckCircle2, MessageCircle, FileText, RefreshCw, ChevronDown
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageErrorState } from "@/shared/components/page-states";
import { LeadsSkeleton } from "@/features/leads/components/LeadsSkeleton";
import { LeadEmptyState } from "@/features/leads/components/LeadEmptyState";
import { useLeads } from "@/shared/hooks/use-crm";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/shared/ui/badge";
import { 
  CRMPageHeader, CRMMetricCard, CRMToolbar, CRMCard, CRMPageContainer, CRMMetricsGrid
} from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { toast } from "sonner";
import { FormModal } from "@/shared/components/form-modal";
const LeadForm = dynamic(() => import("@/features/forms/LeadForm").then(mod => ({ default: mod.LeadForm })), {
  loading: () => <div className="h-[300px] skeleton rounded-xl" />
});
import { BulkImportModal } from "@/features/leads/components/BulkImportModal";
import { LeadType } from "@/shared/types/lead";
import { LeadDetailsDrawer } from "@/features/leads/components/LeadDetailsDrawer";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/shared/ui/checkbox";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

const getStageColor = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("new")) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  if (s.includes("contacted")) return "bg-purple-500/10 text-purple-600 border-purple-500/20";
  if (s.includes("proposal")) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
  if (s.includes("won")) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (s.includes("lost")) return "bg-rose-500/10 text-rose-600 border-rose-500/20";
  return "bg-slate-500/10 text-slate-600 border-slate-500/20";
};

const getPriorityColor = (p?: string) => {
  switch (p) {
    case "Urgent": return "text-rose-600";
    case "High": return "text-orange-600";
    case "Medium": return "text-blue-600";
    case "Low": return "text-slate-600";
    default: return "text-muted-foreground";
  }
};

import { useViewMode } from "@/shared/hooks/useViewMode";

const LeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useViewMode("leads", "cards");
  
  const { leads, setLeads } = useCRMStore();
  const safeLeads = useMemo(() => Array.isArray(leads) ? leads : [], [leads]);
  const { data, isLoading: loading, error, refetch } = useLeads();
  const searchParams = useSearchParams();
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadType | null>(null);
  const [detailsLeadId, setDetailsLeadId] = useState<string | null>(null);
  const [tableHasFilters, setTableHasFilters] = useState(false);
  const [tableClearFiltersFn, setTableClearFiltersFn] = useState<(() => void) | null>(null);

  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      const timer = setTimeout(() => {
        setIsAddModalOpen(true);
        window.history.replaceState({}, "", window.location.pathname);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (data?.leads) setLeads(data.leads);
  }, [data?.leads, setLeads]);
  
  const filteredLeads = useMemo(() => {
    return safeLeads.filter((lead) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        (lead.phone && lead.phone.toLowerCase().includes(q));
      
      const matchesStatus = statusFilter === "all" || 
        lead.status.toLowerCase() === statusFilter.toLowerCase() ||
        (statusFilter.toLowerCase() === "new" && lead.status.toLowerCase() === "new lead");

      return matchesSearch && matchesStatus;
    });
  }, [safeLeads, searchQuery, statusFilter]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(paginatedLeads.map(l => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    setSelectedLeads(prev => 
      checked ? [...prev, id] : prev.filter(l => l !== id)
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    if (tableClearFiltersFn) tableClearFiltersFn();
  };

  if (loading && safeLeads.length === 0) return <LeadsSkeleton />;
  if (error && safeLeads.length === 0) {
    return (
      <PageErrorState
        title="Leads unavailable"
        message={(error as Error).message || "An error occurred"}
        onRetry={() => { refetch(); }}
      />
    );
  }

  const now = new Date();
  const newThisMonth = safeLeads.filter((lead) => {
    const createdAt = lead.createdAt ? new Date(lead.createdAt) : null;
    return createdAt && createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;
  
  const conversionRate = safeLeads.length
    ? `${Math.round((safeLeads.filter((lead) => lead.stage === LeadStatus.WON).length / safeLeads.length) * 1000) / 10}%`
    : "0%";

  return (
    <CRMPageContainer className="min-h-full !pb-4 md:!pb-6 space-y-0 gap-4 md:gap-6 flex flex-col relative">
      <CRMPageHeader 
        title="Leads Management"
        subtitle="Track, qualify, and convert potential opportunities into customers with AI-driven insights."
        icon={Users}
        badge="Lead Intelligence"
        actions={[
          { label: "Import", icon: UploadCloud, onClick: () => setIsImportModalOpen(true), variant: "outline" },
          { label: "Export", icon: Download, onClick: () => toast.success("Export Initiated"), variant: "outline" },
          { label: "Add Lead", icon: UserPlus, onClick: () => setIsAddModalOpen(true), variant: "default" }
        ]}
      />

      <div className="shrink-0">
        <CRMMetricsGrid cols={3}>
          <CRMMetricCard title="Total Leads" value={safeLeads.length} change="0%" trend="up" icon={Users} color="indigo" delay={0.1} />
          <CRMMetricCard title="New This Month" value={newThisMonth} change="0%" trend="up" icon={UserPlus} color="emerald" delay={0.2} />
          <CRMMetricCard title="Conversion Rate" value={conversionRate} change="0%" trend="up" icon={TrendingUp} color="orange" delay={0.3} />
        </CRMMetricsGrid>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="shrink-0 mb-2 sticky top-0 z-40 bg-background/95 backdrop-blur-md py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <CRMToolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            placeholder="Search leads, companies, emails, or phones..."
          >
            <div className="flex items-center gap-2">
              {(searchQuery !== "" || statusFilter !== "all" || tableHasFilters) && (
                <Button
                  variant="ghost" size="sm" onClick={clearFilters}
                  className="h-8 px-3 text-xs font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Clear Filters
                </Button>
              )}
              {[
  { label: "All", value: "all" },
  { label: "New", value: LeadStatus.NEW },
  { label: "Contacted", value: LeadStatus.CONTACTED },
  { label: "Proposal Sent", value: LeadStatus.PROPOSAL_SENT },
  { label: "Won", value: LeadStatus.WON },
  { label: "Lost", value: LeadStatus.LOST }
].map((statusObj) => (
                <Button
                  key={statusObj.value}
                  variant={statusFilter === statusObj.value ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(statusObj.value)}
                  className="h-8 px-3 text-xs font-semibold"
                >
                  {statusObj.label}
                </Button>
              ))}
            </div>
          </CRMToolbar>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {viewMode === "list" || viewMode === "table" ? (
              <motion.div key="list-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-0">
                <LeadsTable 
                  leads={filteredLeads} 
                  totalCount={filteredLeads.length} 
                  rawTotalCount={safeLeads.length}
                  globalSearchQuery={searchQuery}
                  globalStatusFilter={statusFilter}
                  onActiveFiltersChange={setTableHasFilters} 
                  onClearFilters={setTableClearFiltersFn}
                  onGlobalClearFilters={clearFilters}
                  onAddLead={() => setIsAddModalOpen(true)}
                  onImport={() => setIsImportModalOpen(true)}
                />
              </motion.div>
            ) : filteredLeads.length > 0 ? (
              <motion.div key="grid-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
                  {paginatedLeads.map((lead, idx) => (
                <CRMCard key={lead.id} delay={idx * 0.05} className={cn("group relative", selectedLeads.includes(lead.id) && "ring-2 ring-primary ring-offset-2")}>
                  {/* Selection Checkbox */}
                  <div className={cn(
                    "absolute top-6 left-6 z-10 transition-opacity duration-200",
                    selectedLeads.includes(lead.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <Checkbox 
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={(c) => handleSelectLead(lead.id, !!c)}
                      className="w-5 h-5 rounded-[6px] data-[state=checked]:bg-primary data-[state=checked]:text-white shadow-sm"
                    />
                  </div>

                  <div className={cn("flex justify-between items-start mb-6 transition-all duration-300", selectedLeads.includes(lead.id) ? "ml-8" : "group-hover:ml-8")}>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 rounded-xl border border-border bg-muted flex items-center justify-center font-bold text-lg">
                        <AvatarFallback>{lead.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight cursor-pointer" onClick={() => setDetailsLeadId(lead.id)}>{lead.name}</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{lead.company}</p>
                      </div>
                    </div>
                    <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg border", getStageColor(lead.status))}>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{lead.status}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 opacity-70" /> {lead.email || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 opacity-70" /> {lead.phone || "—"}
                        </p>
                      </div>
                      
                      <div className="h-px w-full bg-border/50" />
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span className={cn("font-bold uppercase tracking-widest text-[10px]", getPriorityColor(lead.priority))}>{lead.priority || "Medium"}</span>
                        </p>
                        <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-foreground font-semibold truncate">{lead.owner?.name || "Unassigned"}</span>
                        </p>
                        <p className="text-muted-foreground font-medium flex items-center gap-1.5 col-span-2">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          Next: <span className="text-foreground font-semibold">{lead.followUp || "None"}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-background rounded-xl p-2.5 flex flex-col items-center justify-center border border-border/50 shadow-sm">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Value</span>
                        <span className="text-xs font-bold text-foreground">{lead.value || "—"}</span>
                      </div>
                      <div className="bg-background rounded-xl p-2.5 flex flex-col items-center justify-center border border-border/50 shadow-sm">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Notes</span>
                        <span className="text-xs font-bold text-foreground flex items-center gap-1"><FileText className="w-3 h-3 text-blue-500" /> {lead.notesCount || 0}</span>
                      </div>
                      <div className="bg-background rounded-xl p-2.5 flex flex-col items-center justify-center border border-border/50 shadow-sm">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Meetings</span>
                        <span className="text-xs font-bold text-foreground flex items-center gap-1"><Calendar className="w-3 h-3 text-purple-500" /> {lead.meetingsCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Button variant="default" className="h-10 font-bold text-xs rounded-xl flex-1 group/btn" onClick={() => setDetailsLeadId(lead.id)}>
                      View Details <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 w-10 p-0 rounded-xl">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl">
                        <DropdownMenuItem onClick={() => setEditingLead(lead)} className="text-xs font-medium cursor-pointer"><Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Lead</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-medium cursor-pointer"><User className="w-3.5 h-3.5 mr-2" /> Assign Owner</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-medium cursor-pointer"><Calendar className="w-3.5 h-3.5 mr-2" /> Schedule Meeting</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-medium cursor-pointer"><MessageCircle className="w-3.5 h-3.5 mr-2" /> Add Note</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs font-medium cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Convert to Customer</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-medium cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Lead</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CRMCard>
                  ))}
                </div>

                {/* Pagination */}
                {filteredLeads.length > 0 && (
                  <div className="mt-auto pt-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 pb-8">
                    <div className="text-sm text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
                      Showing <span className="font-bold text-foreground">{(currentPage - 1) * rowsPerPage + 1}</span>–<span className="font-bold text-foreground">{Math.min(currentPage * rowsPerPage, filteredLeads.length)}</span> of <span className="font-bold text-foreground">{new Intl.NumberFormat().format(filteredLeads.length)}</span> Leads
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-medium">Rows per page:</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1 font-semibold bg-background">
                              {rowsPerPage} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[4rem]">
                            {[12, 24, 48, 96].map(size => (
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
                          className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors bg-background"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          aria-label="First page"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors bg-background"
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
                          className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors bg-background"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages || totalPages === 0}
                          aria-label="Next page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors bg-background"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages || totalPages === 0}
                          aria-label="Last page"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <LeadEmptyState 
                totalLeads={safeLeads.length}
                searchQuery={searchQuery}
                hasFilters={statusFilter !== "all"}
                activeFilters={statusFilter !== "all" ? [{ label: "Stage", value: statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) }] : []}
                onClearSearch={() => setSearchQuery("")}
                onClearFilters={() => setStatusFilter("all")}
                onResetAll={clearFilters}
                onAddLead={() => setIsAddModalOpen(true)}
                onImport={() => setIsImportModalOpen(true)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Bulk Action Toolbar */}
      <AnimatePresence>
        {selectedLeads.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl border border-border/20"
          >
            <div className="flex items-center gap-3 pr-4 border-r border-background/20">
              <Badge variant="secondary" className="bg-background/20 text-background font-bold text-sm px-3 rounded-xl border-none">
                {selectedLeads.length} Selected
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLeads([])} className="h-8 text-xs font-bold text-background/70 hover:text-background hover:bg-background/20 rounded-xl">
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-9 px-3 rounded-xl text-sm font-semibold hover:bg-background/20 hover:text-background">
                <User className="w-4 h-4 mr-2" /> Assign
              </Button>
              <Button size="sm" variant="ghost" className="h-9 px-3 rounded-xl text-sm font-semibold hover:bg-background/20 hover:text-background">
                <RefreshCw className="w-4 h-4 mr-2" /> Change Stage
              </Button>
              <Button size="sm" variant="ghost" className="h-9 px-3 rounded-xl text-sm font-semibold hover:bg-background/20 hover:text-background text-rose-300 hover:text-rose-200">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-background/20 hover:text-background">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem className="cursor-pointer font-medium"><Download className="w-4 h-4 mr-2" /> Export Selected</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer font-medium"><Calendar className="w-4 h-4 mr-2" /> Schedule Meeting</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FormModal title="Create New Lead" description="Fill in the details below to add a new lead to your sales pipeline." isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen} size="lg">
        <LeadForm onSuccess={() => setIsAddModalOpen(false)} onCancel={() => setIsAddModalOpen(false)} />
      </FormModal>

      <BulkImportModal isOpen={isImportModalOpen} onOpenChange={setIsImportModalOpen} onSuccess={() => { setIsImportModalOpen(false); refetch(); }} />
      <LeadDetailsDrawer isOpen={!!detailsLeadId} onOpenChange={(open) => !open && setDetailsLeadId(null)} leadId={detailsLeadId || ""} />
      
      <FormModal title="Edit Lead" description="Update lead details" isOpen={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)} size="lg">
        {editingLead && <LeadForm initialData={editingLead} onSuccess={() => { setEditingLead(null); refetch(); }} onCancel={() => setEditingLead(null)} />}
      </FormModal>
    </CRMPageContainer>
  );
};

export default LeadsPage;
