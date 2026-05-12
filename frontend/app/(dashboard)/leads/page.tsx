"use client";

import { useState, useMemo, useEffect } from "react";
import LeadsTable from "@/features/leads/components/LeadsTable";
import { 
  SearchX, 
  UserPlus, 
  XCircle, 
  Mail, 
  Phone, 
  ArrowUpRight, 
  Sparkles, 
  Zap, 
  Download, 
  Users, 
  Filter,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageErrorState, PageLoadingState } from "@/shared/components/page-states";
import { useLeads } from "@/shared/hooks/use-crm";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/shared/ui/badge";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMToolbar, 
  CRMCard,
  CRMAIInsight,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { toast } from "sonner";

const LeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const { leads, setLeads } = useCRMStore();
  const safeLeads = Array.isArray(leads) ? leads : [];
  const { data, isLoading: loading, error, refetch } = useLeads();

  useEffect(() => {
    if (data?.leads && safeLeads.length === 0) {
      setLeads(data.leads);
    }
  }, [data, safeLeads.length, setLeads]);
  
  const filteredLeads = useMemo(() => {
    return safeLeads.filter((lead) => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || lead.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [safeLeads, searchQuery, statusFilter]);

  const handleAddLead = () => {
    toast.info("Add Lead", {
      description: "Opening lead creation workspace...",
    });
  };

  const handleExport = () => {
    toast.success("Data Export Initiated", {
      description: `Exporting ${filteredLeads.length} leads to CSV format.`,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  if (loading && safeLeads.length === 0) {
    return <PageLoadingState label="Loading intelligent lead records..." />;
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
    <CRMPageContainer>
      <CRMPageHeader 
        title="Leads Management"
        subtitle="Track, qualify, and convert potential opportunities into customers with AI-driven insights."
        icon={Users}
        badge="Lead Intelligence"
        actions={[
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

      <CRMMetricsGrid cols={3}>
        <CRMMetricCard 
          title="Total Leads"
          value={safeLeads.length}
          change="0%"
          trend="up"
          icon={Users}
          color="blue"
          delay={0.1}
        />
        <CRMMetricCard 
          title="New This Month"
          value={newThisMonth}
          change="0%"
          trend="up"
          icon={UserPlus}
          color="blue"
          delay={0.2}
        />
        <CRMMetricCard 
          title="Conversion Rate"
          value={conversionRate}
          change="0%"
          trend="up"
          icon={TrendingUp}
          color="indigo"
          delay={0.3}
        />
      </CRMMetricsGrid>

      <CRMToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        placeholder="Search leads, companies, or emails..."
      >
        <div className="flex items-center gap-2">
          {["All", "New", "Contacted", "Won"].map((status) => (
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

      <AnimatePresence mode="wait">
        {filteredLeads.length > 0 ? (
          viewMode === "list" ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LeadsTable leads={filteredLeads} totalCount={filteredLeads.length} />
            </motion.div>
          ) : (
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
          )
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
    </CRMPageContainer>
  );
};

export default LeadsPage;












