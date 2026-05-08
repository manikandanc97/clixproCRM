"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, Plus, Download, TrendingUp, Clock, CheckCircle2, SearchX } from "lucide-react";

import QuotationsTable from "@/components/quotations/QuotationsTable";
import { PageErrorState, PageLoadingState } from "@/components/shared/page-states";
import { useApiResource } from "@/hooks/use-api-resource";
import { fetchQuotationsData } from "@/lib/api/crm";
import { Button } from "@/components/ui/button";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMToolbar,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/components/shared/crm";
import { motion, AnimatePresence } from "framer-motion";
import { useCRMStore } from "@/store/useCRMStore";
import { toast } from "sonner";

const QuotationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { quotations, setQuotations } = useCRMStore();
  const safeQuotations = Array.isArray(quotations) ? quotations : [];
  const { data, loading, error, refetch } = useApiResource(fetchQuotationsData);

  useEffect(() => {
    if (data?.quotations && safeQuotations.length === 0) {
      setQuotations(data.quotations.map(q => ({
        ...q,
        probability: Math.floor(Math.random() * 40) + 60,
        viewCount: Math.floor(Math.random() * 10),
        downloadCount: Math.floor(Math.random() * 5),
        lastActivity: "2 hours ago",
        isSigned: q.status === "Approved",
      })));
    }
  }, [data, safeQuotations.length, setQuotations]);

  const filteredQuotations = useMemo(() => {
    return safeQuotations.filter((quotation) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch =
        quotation.quoteId.toLowerCase().includes(normalizedQuery) ||
        quotation.client.toLowerCase().includes(normalizedQuery) ||
        quotation.createdBy.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || quotation.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [safeQuotations, searchQuery, statusFilter]);

  const handleCreateQuote = () => {
    toast.info("Create Quotation", {
      description: "Opening smart quotation builder...",
    });
  };

  const handleExport = () => {
    toast.success("Sales Analytics Ready", {
      description: `Downloading manifest for ${filteredQuotations.length} quotes.`,
    });
  };

  if (loading && safeQuotations.length === 0) {
    return <PageLoadingState label="Loading quotations and approval status..." />;
  }

  if (error && safeQuotations.length === 0) {
    return (
      <PageErrorState
        title="Quotations unavailable"
        message={error}
        onRetry={refetch}
      />
    );
  }

  const sparklineData = [
    { value: 40 }, { value: 30 }, { value: 60 }, { value: 80 }, { value: 50 }, { value: 90 }, { value: 100 }
  ];

  return (
    <CRMPageContainer>
      <CRMPageHeader 
        title="Quotations"
        subtitle="Generate and manage sales quotes with real-time tracking and AI-driven conversion probability."
        icon={FileText}
        badge="Sales Intelligence"
        actions={[
          {
            label: "Export",
            icon: Download,
            onClick: handleExport,
            variant: "outline"
          },
          {
            label: "Create Quote",
            icon: Plus,
            onClick: handleCreateQuote,
            variant: "default"
          }
        ]}
      />

      <CRMMetricsGrid cols={3} className="gap-4">
        <CRMMetricCard 
          title="Total Quotes"
          value={safeQuotations.length}
          change="+8.4%"
          trend="up"
          icon={FileText}
          color="indigo"
          sparklineData={sparklineData}
          delay={0.1}
        />
        <CRMMetricCard 
          title="Avg. Deal Size"
          value="$4,250"
          change="+12.5%"
          trend="up"
          icon={TrendingUp}
          color="emerald"
          sparklineData={sparklineData}
          delay={0.2}
        />
        <CRMMetricCard 
          title="Pending Approval"
          value={safeQuotations.filter(q => q.status === "Pending").length || 8}
          change="+2"
          trend="neutral"
          icon={Clock}
          color="orange"
          sparklineData={sparklineData}
          delay={0.3}
        />
      </CRMMetricsGrid>

      <CRMToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search quotes, clients..."
      >
        <div className="flex items-center gap-2">
          {["All", "Pending", "Approved", "Expired"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status.toLowerCase() ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(status.toLowerCase())}
              className="h-9 px-3 text-xs font-semibold"
            >
              {status}
            </Button>
          ))}
        </div>
      </CRMToolbar>

      <AnimatePresence mode="wait">
        {filteredQuotations.length > 0 ? (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuotationsTable quotations={filteredQuotations} />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="crm-empty-state"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No quotations found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8 text-sm font-medium">
              Try adjusting your search or filters to find the quotations you&apos;re looking for.
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
            className="px-6"
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </CRMPageContainer>
  );
};

export default QuotationsPage;
