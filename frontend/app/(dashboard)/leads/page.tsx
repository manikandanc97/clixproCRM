"use client";

import { useState, useMemo } from "react";
import LeadsTable from "@/components/leads/LeadsTable";
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
import { Button } from "@/components/ui/button";
import { PageErrorState, PageLoadingState } from "@/components/shared/page-states";
import { useApiResource } from "@/hooks/use-api-resource";
import { fetchLeadsData } from "@/lib/api/crm";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMToolbar, 
  CRMCard,
  CRMAIInsight
} from "@/components/shared/crm";

const LeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { data, loading, error, refetch } = useApiResource(fetchLeadsData);
  
  const leads = useMemo(() => {
    return (data?.leads || []).map(lead => ({
      ...lead,
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      priority: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)] as "High" | "Medium" | "Low",
      source: ["LinkedIn", "Website", "Referral", "Google Ads"][Math.floor(Math.random() * 4)],
      lastActivity: "2 hours ago",
      aiInsights: {
        summary: `${lead.name} is showing high intent based on recent website activity and email engagement.`,
        conversionProbability: Math.floor(Math.random() * 30) + 70,
        recommendation: "Schedule a demo call within 24 hours."
      }
    }));
  }, [data?.leads]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  if (loading && !data) {
    return <PageLoadingState label="Loading intelligent lead records..." />;
  }

  if (error && !data) {
    return (
      <PageErrorState
        title="Leads unavailable"
        message={error}
        onRetry={refetch}
      />
    );
  }

  // Mock sparkline data
  const sparklineData = [
    { value: 40 }, { value: 30 }, { value: 60 }, { value: 80 }, { value: 50 }, { value: 90 }, { value: 100 }
  ];

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-20">
      <CRMPageHeader 
        title="Leads Management"
        subtitle="Track, qualify, and convert potential opportunities into customers with AI-driven insights."
        icon={Users}
        badge="Lead Intelligence"
        actions={[
          {
            label: "Export",
            icon: Download,
            onClick: () => console.log("Export"),
            variant: "outline"
          },
          {
            label: "Add Lead",
            icon: UserPlus,
            onClick: () => console.log("Add Lead"),
            variant: "default"
          }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CRMMetricCard 
          title="Total Leads"
          value={leads.length}
          change="+12.5%"
          trend="up"
          icon={Users}
          color="blue"
          sparklineData={sparklineData}
          delay={0.1}
        />
        <CRMMetricCard 
          title="New This Month"
          value="24"
          change="+18.2%"
          trend="up"
          icon={UserPlus}
          color="cyan"
          sparklineData={sparklineData}
          delay={0.2}
        />
        <CRMMetricCard 
          title="Conversion Rate"
          value="14.2%"
          change="-2.4%"
          trend="down"
          icon={TrendingUp}
          color="indigo"
          sparklineData={sparklineData}
          delay={0.3}
        />
      </div>

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
              <LeadsTable leads={filteredLeads} totalCount={data?.summary.total || 0} />
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
                      <span className="text-[11px] font-bold">{lead.score}</span>
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
            className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-dashed border-border shadow-inner"
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
  );
};

export default LeadsPage;
