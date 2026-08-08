"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Handshake, Plus, Download, TrendingUp, Target, Banknote } from "lucide-react";

import dynamic from "next/dynamic";
const DealsTable = dynamic(() => import("@/features/deals/components/DealsTable").then(mod => ({ default: mod.DealsTable })), {
  loading: () => <div className="h-[400px] skeleton rounded-xl" />
});
import { PageErrorState } from "@/shared/components/page-states";
import { DealsSkeleton } from "@/features/deals/components/DealsSkeleton";
import { useDeals } from "@/shared/hooks/use-crm";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { 
  CRMMetricCard, 
  CRMToolbar,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/shared/components/crm";
import { toast } from "sonner";
import { FormModal } from "@/shared/components/form-modal";
import { DealForm } from "@/features/forms/DealForm";
import { useSearchParams } from "next/navigation";

const DealsGrid = dynamic(() => import("@/features/deals/components/DealsGrid").then(mod => ({ default: mod.DealsGrid })), {
  loading: () => <div className="h-[400px] skeleton rounded-xl" />
});
import { useViewMode } from "@/shared/hooks/useViewMode";
import { formatCurrency } from "@/lib/crm-formatters";
import { useCRMStore } from "@/shared/store/useCRMStore";

const DealsPage = () => {
  const currency = useCRMStore((state) => state.currency);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [viewMode, setViewMode] = useViewMode("deals", "list");

  const { data, isLoading: loading, error, refetch } = useDeals();
  const safeDeals = Array.isArray(data?.deals) ? data.deals : [];

  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

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

  const filteredDeals = useMemo(() => {
    return safeDeals.filter((deal: any) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch =
        deal.name?.toLowerCase().includes(normalizedQuery) ||
        deal.company?.name?.toLowerCase().includes(normalizedQuery);
      
      const matchesStage =
        stageFilter === "all" || (deal.stage || "NEW").toLowerCase() === stageFilter.toLowerCase();
      
      return matchesSearch && matchesStage;
    });
  }, [safeDeals, searchQuery, stageFilter]);

  const handleNewDeal = () => {
    setIsAddModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Deals Export Ready", {
      description: `Downloading pipeline data for ${filteredDeals.length} opportunities.`,
    });
  };

  if (loading && safeDeals.length === 0) {
    return <DealsSkeleton />;
  }

  if (error && safeDeals.length === 0) {
    return (
      <PageErrorState
        title="Error Loading Deals"
        message={(error as Error).message || "An error occurred"}
        onRetry={() => { refetch(); }}
      />
    );
  }

  const totalValue = safeDeals.reduce((acc: number, d: any) => acc + (parseFloat(d.value) || 0), 0);
  const wonDeals = safeDeals.filter((d: any) => d.stage === "WON");
  const wonValue = wonDeals.reduce((acc: number, d: any) => acc + (parseFloat(d.value) || 0), 0);

  return (
    <CRMPageContainer className="min-h-full !pb-4 md:!pb-6 space-y-0 gap-4 md:gap-6 flex flex-col">
      <PageHeader 
        title="Deals"
        subtitle="Track sales opportunities, manage stages, and forecast revenue."
        icon={Handshake}
        badge="Sales Operations"
        actions={[
          {
            label: "Export",
            icon: Download,
            onClick: handleExport,
            variant: "outline"
          },
          {
            label: "New Deal",
            icon: Plus,
            onClick: handleNewDeal,
            variant: "default"
          }
        ]}
      />

      <div className="shrink-0">
        <CRMMetricsGrid cols={3}>
          <CRMMetricCard 
            title="Total Opportunities"
            value={safeDeals.length}
            change="0%"
            trend="up"
            icon={Target}
            color="blue"
            delay={0.1}
          />
          <CRMMetricCard 
            title="Deals Won"
            value={wonDeals.length}
            change="0%"
            trend="up"
            icon={TrendingUp}
            color="emerald"
            delay={0.2}
          />
          <CRMMetricCard 
            title="Pipeline Value"
            value={formatCurrency(totalValue, currency)}
            change="0%"
            trend="up"
            icon={Banknote}
            color="purple"
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
            placeholder="Search deals by name or company..."
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
              {["All", "New", "Proposal_Sent", "Won", "Lost"].map((stage) => (
                <Button
                  key={stage}
                  variant={stageFilter === stage.toLowerCase() ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStageFilter(stage.toLowerCase())}
                  className="h-8 px-3 text-xs font-semibold whitespace-nowrap"
                >
                  {stage.replace("_", " ")}
                </Button>
              ))}
            </div>
          </CRMToolbar>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {filteredDeals.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col min-h-0"
              >
                {viewMode === "list" || viewMode === "table" ? (
                  <DealsTable 
                    deals={filteredDeals} 
                    onEdit={(deal) => {
                      setSelectedDeal(deal);
                      setIsAddModalOpen(true);
                    }}
                  />
                ) : (
                  <DealsGrid 
                    deals={filteredDeals} 
                    onEdit={(deal) => {
                      setSelectedDeal(deal);
                      setIsAddModalOpen(true);
                    }}
                  />
                )}
              </motion.div>
            ) : (
              <EmptyState
                icon={Handshake}
                title="No deals found"
                description="No deals match the current search or filters."
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <FormModal
        title={selectedDeal ? "Edit Deal" : "Create New Deal"}
        description={selectedDeal ? "Update opportunity details." : "Add a new sales opportunity to your pipeline."}
        isOpen={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setSelectedDeal(null);
        }}
        size="lg"
      >
        <DealForm 
          initialData={selectedDeal || undefined}
          onSuccess={() => { setIsAddModalOpen(false); setSelectedDeal(null); refetch(); }} 
          onCancel={() => { setIsAddModalOpen(false); setSelectedDeal(null); }} 
        />
      </FormModal>
    </CRMPageContainer>
  );
};

export default DealsPage;
