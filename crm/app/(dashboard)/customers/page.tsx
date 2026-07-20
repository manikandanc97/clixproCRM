"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Download, Star, CreditCard, SearchX } from "lucide-react";

import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { PageErrorState, PageLoadingState } from "@/shared/components/page-states";
import { useCustomers } from "@/shared/hooks/use-crm";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { 
  CRMMetricCard, 
  CRMToolbar,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/shared/components/crm";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { toast } from "sonner";
import { FormModal } from "@/shared/components/form-modal";
import { CustomerForm } from "@/features/forms/CustomerForm";
import { useSearchParams } from "next/navigation";

const CustomersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  
  const { customers, setCustomers } = useCRMStore();
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const { data, isLoading: loading, error, refetch } = useCustomers();

  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    if (data?.customers && safeCustomers.length === 0) {
      setCustomers(data.customers);
    }
  }, [data, safeCustomers.length, setCustomers]);

  const filteredCustomers = useMemo(() => {
    return safeCustomers.filter((customer) => {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch =
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.company.toLowerCase().includes(normalizedQuery) ||
        customer.email.toLowerCase().includes(normalizedQuery);
      
      const matchesStatus =
        statusFilter === "all" || customer.status.toLowerCase() === statusFilter.toLowerCase();
      
      const matchesSegment = 
        segmentFilter === "all" || customer.segment === segmentFilter;

      return matchesSearch && matchesStatus && matchesSegment;
    });
  }, [safeCustomers, searchQuery, statusFilter, segmentFilter]);

  const handleNewCustomer = () => {
    setIsAddModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Customer Export Ready", {
      description: `Downloading relationship data for ${filteredCustomers.length} clients.`,
    });
  };

  if (loading && safeCustomers.length === 0) {
    return <PageLoadingState label="Initializing relationship intelligence engine..." />;
  }

  if (error && safeCustomers.length === 0) {
    return (
      <PageErrorState
        title="CRM Intelligence Offline"
        message={(error as Error).message || "An error occurred"}
        onRetry={() => { refetch(); }}
      />
    );
  }

  const monthlyRevenue = safeCustomers.reduce((sum, customer) => sum + (customer.revenueValue ?? 0), 0);

  return (
    <CRMPageContainer>
      <PageHeader 
        title="Customers"
        subtitle="Manage your client relationships and monitor account health with AI-powered analytics."
        icon={Users}
        badge="Relationship Intelligence"
        actions={[
          {
            label: "Export",
            icon: Download,
            onClick: handleExport,
            variant: "outline"
          },
          {
            label: "New Customer",
            icon: UserPlus,
            onClick: handleNewCustomer,
            variant: "default"
          }
        ]}
      />

      <CRMMetricsGrid>
        <CRMMetricCard 
          title="Total Customers"
          value={safeCustomers.length}
          change="0%"
          trend="up"
          icon={Users}
          color="blue"
          delay={0.1}
        />
        <CRMMetricCard 
          title="VIP Clients"
          value={safeCustomers.filter(c => c.status === "Premium").length}
          change="0%"
          trend="up"
          icon={Star}
          color="pink"
          delay={0.2}
        />
        <CRMMetricCard 
          title="Monthly Revenue"
          value={monthlyRevenue.toLocaleString("en-US")}
          change="0%"
          trend="up"
          icon={CreditCard}
          color="emerald"
          delay={0.3}
        />
      </CRMMetricsGrid>

      <CRMToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search customers, companies..."
      >
        <div className="flex items-center gap-2">
          {["All", "Active", "Premium"].map((status) => (
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
        {filteredCustomers.length > 0 ? (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CustomersTable customers={filteredCustomers} />
          </motion.div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No customers found"
            description="Try adjusting your search or filters to find the customers you're looking for."
            action={{
              label: "Clear All Filters",
              onClick: () => { setSearchQuery(""); setStatusFilter("all"); setSegmentFilter("all"); }
            }}
          />
        )}
      </AnimatePresence>

      <FormModal
        title="Register New Customer"
        description="Add a new client to your CRM database."
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        size="lg"
      >
        <CustomerForm 
          onSuccess={() => setIsAddModalOpen(false)} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </FormModal>
    </CRMPageContainer>
  );
};

export default CustomersPage;
