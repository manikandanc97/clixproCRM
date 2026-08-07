"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, Plus, Download, TrendingUp, Clock } from "lucide-react";

import dynamic from "next/dynamic";
const QuotationsTable = dynamic(() => import("@/features/quotations/components/QuotationsTable"), {
  loading: () => <div className="h-[400px] skeleton rounded-xl" />
});
const QuotationsGrid = dynamic(() => import("@/features/quotations/components/QuotationsGrid").then(mod => ({ default: mod.QuotationsGrid })), {
  loading: () => <div className="h-[400px] skeleton rounded-xl" />
});
import { useViewMode } from "@/shared/hooks/useViewMode";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageErrorState } from "@/shared/components/page-states";
import { QuotationsSkeleton } from "@/features/quotations/components/QuotationsSkeleton";
import { useQuotations } from "@/shared/hooks/use-crm";
import { useCurrency } from "@/shared/hooks/use-currency";
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
const QuoteForm = dynamic(() => import("@/features/forms/QuoteForm").then(mod => ({ default: mod.QuoteForm })), {
  loading: () => <div className="h-[300px] skeleton rounded-xl" />
});
import { useRouter, useSearchParams } from "next/navigation";
import { QuotationType } from "@/shared/types/quotation";

const QuotationsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useViewMode("quotations", "list");
  const { formatCurrency } = useCurrency();

  const { quotations, setQuotations } = useCRMStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeQuotations = Array.isArray(quotations) ? quotations : [];
  const { data, isLoading: loading, error, refetch } = useQuotations();

  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editQuote, setEditQuote] = useState<QuotationType | null>(null);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && data?.quotations) {
      const q = data.quotations.find((q) => q.id === editId || q.quoteId === editId);
      if (q) {
        setEditQuote(q);
        setIsAddModalOpen(true);
      }
      // Remove edit param from url
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("edit");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams, data?.quotations]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      const timer = setTimeout(() => {
        setEditQuote(null);
        setIsAddModalOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (data?.quotations) {
      setQuotations(data.quotations);
    }
  }, [data?.quotations, setQuotations]);

  const filteredQuotations = useMemo(() => {
    return safeQuotations.filter((quotation) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch =
        quotation.quoteId.toLowerCase().includes(normalizedQuery) ||
        quotation.client.toLowerCase().includes(normalizedQuery) ||
        "System".toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || quotation.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [safeQuotations, searchQuery, statusFilter]);

  const handleCreateQuote = () => {
    setEditQuote(null);
    setIsAddModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Sales Analytics Ready", {
      description: `Downloading manifest for ${filteredQuotations.length} quotes.`,
    });
  };

  if (loading && safeQuotations.length === 0) {
    return <QuotationsSkeleton />;
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
    <CRMPageContainer className="min-h-full !pb-4 md:!pb-6 space-y-0 gap-4 md:gap-6 flex flex-col">
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

      <div className="shrink-0">
        <CRMMetricsGrid cols={4} className="gap-4">
          <CRMMetricCard 
            title="Total Quotations"
            value={data?.stats?.[0]?.value || safeQuotations.length}
            change="0%"
            trend="up"
            icon={FileText}
            color="indigo"
            delay={0.1}
          />
          <CRMMetricCard 
            title="Total Quote Value"
            value={data?.stats?.[1]?.valueAmount !== undefined ? formatCurrency(data.stats[1].valueAmount) : formatCurrency(safeQuotations.reduce((sum, q) => sum + (q.amountValue ?? 0), 0))}
            change="0%"
            trend="up"
            icon={TrendingUp}
            color="emerald"
            delay={0.2}
          />
          <CRMMetricCard 
            title="Pending Quotes"
            value={data?.stats?.[2]?.value || safeQuotations.filter(q => q.status === "SENT").length}
            change="0%"
            trend="neutral"
            icon={Clock}
            color="orange"
            delay={0.3}
          />
          <CRMMetricCard 
            title="Approved Quotes"
            value={data?.stats?.[3]?.value || safeQuotations.filter(q => q.status === "ACCEPTED").length}
            change="0%"
            trend="up"
            icon={FileText}
            color="emerald"
            delay={0.4}
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
            placeholder="Search quotes, clients..."
          >
            <div className="flex items-center gap-2">
              {["All", "Draft", "Sent", "Accepted", "Rejected", "Expired"].map((status) => (
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
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {filteredQuotations.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col min-h-0"
              >
                {viewMode === "list" || viewMode === "table" ? (
                  <QuotationsTable quotations={filteredQuotations} />
                ) : (
                  <QuotationsGrid quotations={filteredQuotations} />
                )}
              </motion.div>
            ) : (
              <EmptyState 
                icon={FileText}
                title="No quotations found"
                description="Create your first quotation to send a professional proposal to your customer."
              />
            )}
      </AnimatePresence>
        </div>
      </div>

      <FormModal
        title={editQuote ? "Edit Sales Quotation" : "Create Sales Quotation"}
        description={editQuote ? "Update the details of your existing quotation." : "Generate a professional quote for your client."}
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        size="lg"
      >
        <QuoteForm 
          initialData={editQuote || undefined}
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </FormModal>
    </CRMPageContainer>
  );
};

export default QuotationsPage;
