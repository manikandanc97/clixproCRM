"use client";

import React, { useState, useEffect } from "react";
import { Building2, Hash, Globe, MapPin, IndianRupee, Save, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { CRMCard } from "@/shared/components/crm";
import { ClixProIcon } from "@/shared/ui/logo";
import Image from "next/image";

import { useWorkspace, useUpdateWorkspace } from "@/shared/hooks/use-settings";
import { PageErrorState, ComponentLoadingState } from "@/shared/components/page-states";
import { useCurrency } from "@/shared/hooks/use-currency";
import { useCRMStore } from "@/shared/store/useCRMStore";

const WorkspaceSettings = () => {
  const { data: workspace, isLoading: loading, error, refetch } = useWorkspace();
  const mutation = useUpdateWorkspace();
  const { currency, CurrencyIcon } = useCurrency();
  const setStoreCurrency = useCRMStore((state) => state.setCurrency);

  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    currency: "",
    timezone: "",
    address: "",
    logo: null as string | null
  });


  useEffect(() => {
    if (workspace) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: workspace.name || "",
        taxId: workspace.taxId || "",
        currency: workspace.currency || "INR",
        timezone: workspace.timezone || "ist",
        address: workspace.address || "",
        logo: workspace.logo || null
      });
      if (workspace.currency) {
        setStoreCurrency(workspace.currency);
      }
    }
  }, [workspace, setStoreCurrency]);

  if (loading) {
    return <ComponentLoadingState label="Loading workspace configuration..." />;
  }

  if (error) {
    return <PageErrorState title="Workspace settings unavailable" message={(error as Error).message} onRetry={() => { void refetch(); }} />;
  }

  const handleSave = () => {
    mutation.mutate(formData, {
      onSuccess: () => {
        setStoreCurrency(formData.currency);
      }
    });
  };


  const hasChanges = 
    formData.name !== (workspace?.name || "") ||
    formData.taxId !== (workspace?.taxId || "") ||
    formData.currency !== (workspace?.currency || "INR") ||
    formData.timezone !== (workspace?.timezone || "utc") ||
    formData.address !== (workspace?.address || "") ||
    formData.logo !== (workspace?.logo || null);

  return (
    <div className="space-y-5">
      {/* Branding */}
      <CRMCard>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground">Workspace Branding</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Customize how your workspace appears to team members.
            </p>
          </div>
          {workspace?.plan && (
            <Badge
              variant="outline"
              className="rounded-md px-2.5 py-0.5 bg-primary/8 text-primary border-primary/20 font-bold text-[9px] uppercase tracking-widest"
            >
              {workspace.plan}
            </Badge>
          )}
          </div>
  
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative group shrink-0">
              <div 
                className="w-20 h-20 rounded-xl bg-muted border border-dashed border-border flex items-center justify-center overflow-hidden transition-all"
              >
                {formData.logo ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={formData.logo} 
                      alt="Workspace Logo" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <ClixProIcon pixelSize={44} />
                )}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-xs font-bold text-foreground">Workspace Logo</h4>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  Custom logo upload is currently managed by the system administrator.
                </p>
              </div>
            </div>
          </div>
        </CRMCard>
        {/* Organization Details */}
        <CRMCard>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground">Organization Details</h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Manage your business identity and regional settings.
              </p>
            </div>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={!hasChanges || mutation.isPending}
              className="flex items-center gap-2"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Workspace Name</Label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
                />
              </div>
            </div>
  
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Tax ID / Registration</Label>
              <div className="relative group">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  value={formData.taxId}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                  className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
                />
              </div>
            </div>
  
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Default Currency</Label>
              <div className="relative">
                <CurrencyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select value={formData.currency} onValueChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}>
                  <SelectTrigger className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20 font-medium text-sm">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="INR" className="text-xs font-medium">INR – Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
  
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Timezone</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select value={formData.timezone} onValueChange={(val) => setFormData(prev => ({ ...prev, timezone: val }))}>
                  <SelectTrigger className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20 font-medium text-sm">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="utc" className="text-xs font-medium">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="ist" className="text-xs font-medium">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="est" className="text-xs font-medium">America/New_York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
  
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground">Business Address</Label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
                />
              </div>
            </div>
          </div>
        </CRMCard>
    </div>
  );
};

export default WorkspaceSettings;
