"use client";

import React from "react";
import { CheckCircle2, Key, Package } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CRMCard } from "@/shared/components/crm";
import { EmptyStateCard, PageErrorState, PageLoadingState } from "@/shared/components/page-states";
import { useBillingSettings } from "@/shared/hooks/use-settings";

const BillingSettings = () => {
  const { data, isLoading, error, refetch } = useBillingSettings();

  if (isLoading) {
    return <PageLoadingState label="Loading billing settings..." />;
  }

  if (error) {
    return <PageErrorState title="Billing settings unavailable" message={(error as Error).message} onRetry={() => { void refetch(); }} />;
  }

  const licenseDetails = data?.licenseDetails ?? [];
  const modules = data?.modules ?? [];

  return (
    <div className="space-y-5">
      <CRMCard className="bg-primary text-primary-foreground border-primary/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div className="space-y-2.5">
            <Badge className="bg-white/15 text-white hover:bg-white/20 border-none rounded-md text-[10px] font-bold uppercase tracking-widest">
              {data?.status ?? "Not configured"}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">{data?.plan ?? "No billing plan configured"}</h2>
            <p className="text-white/75 text-[11px] font-bold uppercase tracking-widest">
              Billing data is loaded from the backend.
            </p>
          </div>
          <Button variant="outline" className="bg-transparent border-white/25 text-white hover:bg-white/10 rounded-lg px-4 h-9 text-xs font-bold uppercase tracking-widest">
            <Key className="w-3.5 h-3.5 mr-2" />
            View License
          </Button>
        </div>
      </CRMCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {licenseDetails.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-4">
            <EmptyStateCard title="No license details" message="License details will appear when they are configured in the backend." />
          </div>
        ) : licenseDetails.map((detail) => (
          <CRMCard key={detail.id} className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{detail.label}</p>
              <p className="text-sm font-bold tracking-tight text-foreground mt-0.5">{detail.value ?? "Not configured"}</p>
            </div>
          </CRMCard>
        ))}
      </div>

      <div>
        <h3 className="text-base font-bold tracking-tight text-foreground mb-4">Activated Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <EmptyStateCard title="No module data" message="Activated modules will appear when the backend provides billing module records." />
            </div>
          ) : modules.map((module) => (
            <CRMCard key={module.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <p className="flex-1 text-xs font-bold text-foreground truncate">{module.label}</p>
              {module.enabled && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            </CRMCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
