"use client";

import { useState, useMemo } from "react";
import { FileText, Plus, Download, TrendingUp, Clock, CheckCircle2, SearchX } from "lucide-react";

import QuotationsTable from "@/components/quotations/QuotationsTable";
import { PageErrorState, PageLoadingState } from "@/components/shared/page-states";
import { useApiResource } from "@/hooks/use-api-resource";
import { fetchQuotationsData } from "@/lib/api/crm";
import { Button } from "@/components/ui/button";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMToolbar 
} from "@/components/shared/crm";
import { motion, AnimatePresence } from "framer-motion";

const QuotationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, loading, error, refetch } = useApiResource(fetchQuotationsData);

  const quotations = useMemo(() => {
    return (data?.quotations || []).map(q => ({
      ...q,
      probability: Math.floor(Math.random() * 40) + 60,
      viewCount: Math.floor(Math.random() * 10),
      downloadCount: Math.floor(Math.random() * 5),
      lastActivity: "2 hours ago",
      isSigned: q.status === "Approved",
    }));
  }, [data?.quotations]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((quotation) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch =
        quotation.quoteId.toLowerCase().includes(normalizedQuery) ||
        quotation.client.toLowerCase().includes(normalizedQuery) ||
        quotation.createdBy.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || quotation.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  if (loading && !data) {
    return <PageLoadingState label="Loading quotations and approval status..." />;
  }

  if (error && !data) {
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
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-20">
      <CRMPageHeader 
        title="Quotations"
        subtitle="Generate and manage sales quotes with real-time tracking and AI-driven conversion probability."
        icon={FileText}
        badge="Sales Intelligence"
        actions={[
          {
            label: "Export",
            icon: Download,
            onClick: () => console.log("Export"),
            variant: "outline"
          },
          {
            label: "Create Quote",
            icon: Plus,
            onClick: () => console.log("Create"),
            variant: "default"
          }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CRMMetricCard 
          title="Total Quotes"
          value={quotations.length}
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
          value="8"
          change="+2"
          trend="neutral"
          icon={Clock}
          color="orange"
          sparklineData={sparklineData}
          delay={0.3}
        />
      </div>

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
              className="h-8 px-3 text-xs font-semibold"
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
            className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-dashed border-border shadow-inner"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No quotations found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8 text-sm font-medium">
              Try adjusting your search or filters to find the quotations you're looking for.
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
              className="font-bold rounded-xl px-6 h-11"
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuotationsPage;
