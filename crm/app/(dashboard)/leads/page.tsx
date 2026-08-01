"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";

const LeadsTable = dynamic(() => import("@/features/leads/components/LeadsTable"), {
  loading: () => <div className="h-[400px] skeleton rounded-xl" />
});
import { 
  SearchX, 
  UserPlus, 
  Mail, 
  Sparkles, 
  Zap, 
  Download, 
  Users, 
  TrendingUp,
  ChevronRight,
  UploadCloud,
  X
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageErrorState } from "@/shared/components/page-states";
import { LeadsSkeleton } from "@/features/leads/components/LeadsSkeleton";
import { useLeads } from "@/shared/hooks/use-crm";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/shared/ui/badge";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMToolbar,
  CRMCard,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { toast } from "sonner";
import { FormModal } from "@/shared/components/form-modal";
const LeadForm = dynamic(() => import("@/features/forms/LeadForm").then(mod => ({ default: mod.LeadForm })), {
  loading: () => <div className="h-[300px] skeleton rounded-xl" />
});
import { BulkImportModal } from "@/features/leads/components/BulkImportModal";
import { useSearchParams } from "next/navigation";

const LeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const { leads, setLeads } = useCRMStore();
  
  const safeLeads = useMemo(() => Array.isArray(leads) ? leads : [], [leads]);
  
  const { data, isLoading: loading, error, refetch } = useLeads();

  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [tableHasFilters, setTableHasFilters] = useState(false);
  const [tableClearFiltersFn, setTableClearFiltersFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      const timer = setTimeout(() => {
        setIsAddModalOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (data?.leads) {
      setLeads(data.leads);
    }
  }, [data?.leads, setLeads]);
  
  const filteredLeads = useMemo(() => {
    return safeLeads.filter((lead) => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        lead.status.toLowerCase() === statusFilter.toLowerCase() ||
        (statusFilter.toLowerCase() === "new" && lead.status.toLowerCase() === "new lead");

      return matchesSearch && matchesStatus;
    });
  }, [safeLeads, searchQuery, statusFilter]);

  const handleAddLead = () => {
    setIsAddModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Data Export Initiated", {
      description: `Exporting ${filteredLeads.length} leads to CSV format.`,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    if (tableClearFiltersFn) {
      tableClearFiltersFn();
    }
  };

  if (loading && safeLeads.length === 0) {
    return <LeadsSkeleton />;
  }

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
    ? `${Math.round((safeLeads.filter((lead) => lead.status === "Won").length / safeLeads.length) * 1000) / 10}%`
    : "0%";

  return (
    <CRMPageContainer className="min-h-full !pb-4 md:!pb-6 space-y-0 gap-4 md:gap-6 flex flex-col">
      <CRMPageHeader 
        title="Leads Management"
        subtitle="Track, qualify, and convert potential opportunities into customers with AI-driven insights."
        icon={Users}
        badge="Lead Intelligence"
        actions={[
          {
            label: "Import",
            icon: UploadCloud,
            onClick: () => setIsImportModalOpen(true),
            variant: "outline"
          },
          {
            label: "Export",
            icon: Download,
            onClick: handleExport,
            variant: "outline"
          },
          {
            label: "Add Lead",
            icon: UserPlus,
            onClick: handleAddLead,
            variant: "default"
          }
        ]}
      />

      <div className="shrink-0">
        <CRMMetricsGrid cols={3}>
          <CRMMetricCard 
            title="Total Leads"
            value={safeLeads.length}
            change="0%"
            trend="up"
            icon={Users}
            color="indigo"
            delay={0.1}
          />
          <CRMMetricCard 
            title="New This Month"
            value={newThisMonth}
            change="0%"
            trend="up"
            icon={UserPlus}
            color="emerald"
            delay={0.2}
          />
          <CRMMetricCard 
            title="Conversion Rate"
            value={conversionRate}
            change="0%"
            trend="up"
            icon={TrendingUp}
            color="orange"
            delay={0.3}
          />
        </CRMMetricsGrid>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="shrink-0 mb-2 sticky top-0 z-40 bg-background/95 backdrop-blur-md py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <CRMToolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            placeholder="Search leads, companies, or emails..."
          >
            <div className="flex items-center gap-2">
              {(searchQuery !== "" || statusFilter !== "all" || tableHasFilters) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-3 text-xs font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear Filters
                </Button>
              )}
              {["All", "New", "Contacted", "Proposal Sent", "Won", "Lost"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status.toLowerCase() ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(status.toLowerCase())}
                  className="h-8 px-3 text-xs font-semibold"
                >
                  {status}
                </Button>
              ))}
            </div>
          </CRMToolbar>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {viewMode === "list" ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col min-h-0"
              >
                <LeadsTable 
                  leads={filteredLeads} 
                  totalCount={filteredLeads.length} 
                  onActiveFiltersChange={setTableHasFilters}
                  onClearFilters={setTableClearFiltersFn}
                />
              </motion.div>
            ) : filteredLeads.length > 0 ? (
            <motion.div 
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredLeads.map((lead, idx) => (
                <CRMCard key={lead.id} delay={idx * 0.05} className="group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 rounded-xl border border-border bg-muted flex items-center justify-center font-bold text-lg">
                        <AvatarFallback>{lead.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{lead.name}</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{lead.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg text-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{lead.status}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {lead.email}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" /> 
                        Next: <span className="text-foreground font-semibold">{lead.followUp}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-background">
                        {lead.status}
                      </Badge>
                      <p className="text-sm font-bold text-foreground">{lead.value}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-10 font-bold text-xs rounded-xl">
                      Quick Edit
                    </Button>
                    <Button className="h-10 font-bold text-xs rounded-xl group/btn">
                      Profile <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CRMCard>
              ))}
            </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-card rounded-xl border border-dashed border-border shadow-inner"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No matching leads</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8 text-sm font-medium">
              We couldn&apos;t find any leads matching your current filters. Try resetting or adjusting your search.
            </p>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="font-bold rounded-xl px-6 h-11"
            >
              Reset All Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>

      <FormModal
        title="Create New Lead"
        description="Fill in the details below to add a new lead to your sales pipeline."
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        size="lg"
      >
        <LeadForm 
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </FormModal>

      <BulkImportModal 
        isOpen={isImportModalOpen} 
        onOpenChange={setIsImportModalOpen}
        onSuccess={() => {
          setIsImportModalOpen(false);
          refetch();
        }}
      />
    </CRMPageContainer>
  );
};

export default LeadsPage;
