"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, Plus, Download, TrendingUp, Clock, SearchX } from "lucide-react";

import QuotationsTable from "@/features/quotations/components/QuotationsTable";
import { PageErrorState, PageLoadingState } from "@/shared/components/page-states";
import { useQuotations } from "@/shared/hooks/use-crm";
import { Button } from "@/shared/ui/button";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMToolbar,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/shared/components/crm";
import { motion, AnimatePresence } from "framer-motion";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";
import { FormModal } from "@/shared/components/form-modal";
import { QuoteForm } from "@/features/forms/QuoteForm";
import { useSearchParams } from "next/navigation";

const QuotationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { quotations, setQuotations } = useCRMStore();
  const safeQuotations = Array.isArray(quotations) ? quotations : [];
  const { data, isLoading: loading, error, refetch } = useQuotations();

  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsAddModalOpen(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (data?.quotations && safeQuotations.length === 0) {
      setQuotations(data.quotations);
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
    setIsAddModalOpen(true);
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
        message={(error as Error).message || "An error occurred"}
        onRetry={() => { refetch(); }}
      />
    );
  }

  const averageDealSize = safeQuotations.length
    ? Math.round(safeQuotations.reduce((sum, quote) => sum + (quote.amountValue ?? 0), 0) / safeQuotations.length)
    : 0;

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
          change="0%"
          trend="up"
          icon={FileText}
          color="indigo"
          delay={0.1}
        />
        <CRMMetricCard 
          title="Avg. Deal Size"
          value={averageDealSize.toLocaleString("en-US")}
          change="0%"
          trend="up"
          icon={TrendingUp}
          color="emerald"
          delay={0.2}
        />
        <CRMMetricCard 
          title="Pending Approval"
          value={safeQuotations.filter(q => q.status === "Pending").length}
          change="0%"
          trend="up"
          icon={Clock}
          color="orange"
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

      <FormModal
        title="Create Sales Quotation"
        description="Generate a professional quote for your client."
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        size="lg"
      >
        <QuoteForm 
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </FormModal>
    </CRMPageContainer>
  );
};

export default QuotationsPage;












