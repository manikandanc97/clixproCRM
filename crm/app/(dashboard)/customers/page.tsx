"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Download, Star, CreditCard, SearchX } from "lucide-react";

import dynamic from "next/dynamic";
const CustomersTable = dynamic(() => import("@/features/customers/components/CustomersTable").then(mod => ({ default: mod.CustomersTable })), {
  loading: () => <div className="h-[400px] skeleton rounded-xl" />
});
import { PageErrorState } from "@/shared/components/page-states";
import { CustomersSkeleton } from "@/features/customers/components/CustomersSkeleton";
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
const CustomerForm = dynamic(() => import("@/features/forms/CustomerForm").then(mod => ({ default: mod.CustomerForm })), {
  loading: () => <div className="h-[300px] skeleton rounded-xl" />
});
import { useSearchParams } from "next/navigation";

const CustomersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  
  const { customers, setCustomers } = useCRMStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const { data, isLoading: loading, error, refetch } = useCustomers();

  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

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
    if (data?.customers) {
      setCustomers(data.customers);
    }
  }, [data?.customers, setCustomers]);

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
    return <CustomersSkeleton />;
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
    <CRMPageContainer className="min-h-full !pb-4 md:!pb-6 space-y-0 gap-4 md:gap-6 flex flex-col">
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

      <div className="shrink-0">
        <CRMMetricsGrid cols={3}>
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
            value={safeCustomers.filter(c => c.status === "PREMIUM").length}
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
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="shrink-0 mb-2 sticky top-0 z-40 bg-background/95 backdrop-blur-md py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
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
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {filteredCustomers.length > 0 ? (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col min-h-0"
              >
            <CustomersTable 
              customers={filteredCustomers} 
              onEdit={(customer) => {
                setSelectedCustomer(customer);
                setIsAddModalOpen(true);
              }}
            />
          </motion.div>
        ) : (
          <EmptyState
            icon={Users}
            title="No customers found"
            description="No customers match the current search or filters."
          />
            )}
          </AnimatePresence>
        </div>
      </div>

      <FormModal
        title={selectedCustomer ? "Edit Customer" : "Register New Customer"}
        description={selectedCustomer ? "Update client details." : "Add a new client to your CRM database."}
        isOpen={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setSelectedCustomer(null);
        }}
        size="lg"
      >
        <CustomerForm 
          initialData={selectedCustomer || undefined}
          onSuccess={() => { setIsAddModalOpen(false); setSelectedCustomer(null); }} 
          onCancel={() => { setIsAddModalOpen(false); setSelectedCustomer(null); }} 
        />
      </FormModal>
    </CRMPageContainer>
  );
};

export default CustomersPage;
