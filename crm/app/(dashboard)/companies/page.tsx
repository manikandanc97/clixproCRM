"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, Download, Factory, Briefcase } from "lucide-react";

import dynamic from "next/dynamic";
const CompaniesTable = dynamic(() => import("@/features/companies/components/CompaniesTable").then(mod => ({ default: mod.CompaniesTable })), {
  loading: () => <div className="h-[400px] skeleton rounded-xl" />
});
import { PageErrorState } from "@/shared/components/page-states";
import { CompaniesSkeleton } from "@/features/companies/components/CompaniesSkeleton";
import { useCompanies } from "@/shared/hooks/use-crm";
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
import { CompanyForm } from "@/features/forms/CompanyForm";
import { useSearchParams } from "next/navigation";

const CompaniesGrid = dynamic(() => import("@/features/companies/components/CompaniesGrid").then(mod => ({ default: mod.CompaniesGrid })), {
  loading: () => <div className="h-[400px] skeleton rounded-xl" />
});
import { useViewMode } from "@/shared/hooks/useViewMode";

const CompaniesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useViewMode("companies", "list");

  const { data, isLoading: loading, error, refetch } = useCompanies();
  const safeCompanies = Array.isArray(data?.companies) ? data.companies : [];

  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

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

  const filteredCompanies = useMemo(() => {
    return safeCompanies.filter((company: any) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch =
        company.name?.toLowerCase().includes(normalizedQuery) ||
        company.industry?.toLowerCase().includes(normalizedQuery);
      
      const matchesStatus =
        statusFilter === "all" || (company.status || "ACTIVE").toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [safeCompanies, searchQuery, statusFilter]);

  const handleNewCompany = () => {
    setIsAddModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Companies Export Ready", {
      description: `Downloading data for ${filteredCompanies.length} accounts.`,
    });
  };

  if (loading && safeCompanies.length === 0) {
    return <CompaniesSkeleton />;
  }

  if (error && safeCompanies.length === 0) {
    return (
      <PageErrorState
        title="Error Loading Companies"
        message={(error as Error).message || "An error occurred"}
        onRetry={() => { refetch(); }}
      />
    );
  }

  const activeCount = safeCompanies.filter((c: any) => c.status === "ACTIVE").length;
  const totalCustomers = safeCompanies.reduce((acc: number, c: any) => acc + (c._count?.customers || 0), 0);

  return (
    <CRMPageContainer className="min-h-full !pb-4 md:!pb-6 space-y-0 gap-4 md:gap-6 flex flex-col">
      <PageHeader 
        title="Companies"
        subtitle="Manage B2B accounts, track pipeline value, and view customer health at the company level."
        icon={Building2}
        badge="Account Management"
        actions={[
          {
            label: "Export",
            icon: Download,
            onClick: handleExport,
            variant: "outline"
          },
          {
            label: "New Company",
            icon: Plus,
            onClick: handleNewCompany,
            variant: "default"
          }
        ]}
      />

      <div className="shrink-0">
        <CRMMetricsGrid cols={3}>
          <CRMMetricCard 
            title="Total Companies"
            value={safeCompanies.length}
            change="0%"
            trend="up"
            icon={Building2}
            color="blue"
            delay={0.1}
          />
          <CRMMetricCard 
            title="Active Accounts"
            value={activeCount}
            change="0%"
            trend="up"
            icon={Factory}
            color="emerald"
            delay={0.2}
          />
          <CRMMetricCard 
            title="Total Linked Customers"
            value={totalCustomers}
            change="0%"
            trend="up"
            icon={Briefcase}
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
            placeholder="Search companies by name or industry..."
          >
            <div className="flex items-center gap-2">
              {["All", "Active", "Inactive"].map((status) => (
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
            {filteredCompanies.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col min-h-0"
              >
                {viewMode === "list" || viewMode === "table" ? (
                  <CompaniesTable 
                    companies={filteredCompanies} 
                    onEdit={(company) => {
                      setSelectedCompany(company);
                      setIsAddModalOpen(true);
                    }}
                  />
                ) : (
                  <CompaniesGrid 
                    companies={filteredCompanies} 
                    onEdit={(company) => {
                      setSelectedCompany(company);
                      setIsAddModalOpen(true);
                    }}
                  />
                )}
              </motion.div>
            ) : (
              <EmptyState
                icon={Building2}
                title="No companies found"
                description="No companies match the current search or filters."
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <FormModal
        title={selectedCompany ? "Edit Company" : "Add New Company"}
        description={selectedCompany ? "Update company details." : "Add a new company account to your CRM database."}
        isOpen={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setSelectedCompany(null);
        }}
        size="lg"
      >
        <CompanyForm 
          initialData={selectedCompany || undefined}
          onSuccess={() => { setIsAddModalOpen(false); setSelectedCompany(null); refetch(); }} 
          onCancel={() => { setIsAddModalOpen(false); setSelectedCompany(null); }} 
        />
      </FormModal>
    </CRMPageContainer>
  );
};

export default CompaniesPage;
