"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Download, TrendingUp, Star, CreditCard, SearchX } from "lucide-react";

import CustomersTable from "@/components/customers/CustomersTable";
import { PageErrorState, PageLoadingState } from "@/components/shared/page-states";
import { useApiResource } from "@/hooks/use-api-resource";
import { fetchCustomersData } from "@/lib/api/crm";
import { CustomerType } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { 
  CRMPageHeader, 
  CRMMetricCard, 
  CRMToolbar,
  CRMPageContainer,
  CRMMetricsGrid
} from "@/components/shared/crm";
import { useCRMStore } from "@/store/useCRMStore";
import { toast } from "sonner";

const CUSTOMER_SEGMENTS: CustomerType["segment"][] = ["Enterprise", "Growth", "SMB", "VIP"];

const CustomersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  
  const { customers, setCustomers } = useCRMStore();
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const { data, loading, error, refetch } = useApiResource(fetchCustomersData);

  useEffect(() => {
    if (data?.customers && safeCustomers.length === 0) {
      setCustomers(data.customers.map((customer, i) => ({
        ...customer,
        healthScore: customer.healthScore || Math.floor(Math.random() * 60) + 40,
        totalInteractions: customer.totalInteractions || Math.floor(Math.random() * 50) + 5,
        ltv: customer.ltv || `$${(customer.revenueValue * 2.5).toLocaleString()}`,
        segment: customer.segment || CUSTOMER_SEGMENTS[i % CUSTOMER_SEGMENTS.length],
        churnRisk: customer.churnRisk || (Math.random() > 0.8 ? "High" : Math.random() > 0.5 ? "Medium" : "Low"),
      })));
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
    toast.info("Add Customer", {
      description: "Opening customer onboarding workspace...",
    });
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

      <CRMMetricsGrid cols={3}>
        <CRMMetricCard 
          title="Total Customers"
          value={safeCustomers.length}
          change="+5.2%"
          trend="up"
          icon={Users}
          color="cyan"
          sparklineData={sparklineData}
          delay={0.1}
        />
        <CRMMetricCard 
          title="VIP Clients"
          value={safeCustomers.filter(c => c.segment === "VIP").length || 12}
          change="+2.4%"
          trend="up"
          icon={Star}
          color="pink"
          sparklineData={sparklineData}
          delay={0.2}
        />
        <CRMMetricCard 
          title="Monthly Revenue"
          value="$84,250"
          change="+12.8%"
          trend="up"
          icon={CreditCard}
          color="emerald"
          sparklineData={sparklineData}
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-card rounded-xl border border-dashed border-border shadow-inner"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No customers found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8 text-sm font-medium">
              Try adjusting your search or filters to find the customers you&apos;re looking for.
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); setSegmentFilter("all"); }}
              className="font-bold rounded-xl px-6 h-11"
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </CRMPageContainer>
  );
};

export default CustomersPage;
