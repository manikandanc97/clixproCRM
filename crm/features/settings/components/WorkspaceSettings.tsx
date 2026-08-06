"use client";

import React, { useState, useEffect, useRef } from "react";
import { Building2, Hash, Globe, MapPin, DollarSign, IndianRupee, Upload, AlertTriangle, Save, Loader2 } from "lucide-react";
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
import Image from "next/image";

import { useWorkspace, useUpdateWorkspace } from "@/shared/hooks/use-settings";
import { PageErrorState, ComponentLoadingState } from "@/shared/components/page-states";
import { useCurrency } from "@/shared/hooks/use-currency";

const WorkspaceSettings = () => {
  const { data: workspace, isLoading: loading, error, refetch } = useWorkspace();
  const mutation = useUpdateWorkspace();
  const { currency } = useCurrency();
  const CurrencyIcon = currency === "INR" ? IndianRupee : DollarSign;

  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    currency: "",
    timezone: "",
    address: "",
    logo: null as string | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        taxId: (workspace as any).taxId || "",
        currency: (workspace as any).currency || "INR",
        timezone: (workspace as any).timezone || "ist",
        address: (workspace as any).address || "",
        logo: (workspace as any).logo || null
      });
    }
  }, [workspace]);

  if (loading) {
    return <ComponentLoadingState label="Loading workspace configuration..." />;
  }

  if (error) {
    return <PageErrorState title="Workspace settings unavailable" message={(error as Error).message} onRetry={() => { void refetch(); }} />;
  }

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
    }
  };

  const handleDeleteWorkspace = () => {
    if (window.confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) {
      console.log("Workspace deletion triggered");
      alert("Workspace deletion initiated.");
    }
  };

  const hasChanges = 
    formData.name !== (workspace?.name || "") ||
    formData.taxId !== ((workspace as any)?.taxId || "") ||
    formData.currency !== ((workspace as any)?.currency || "USD") ||
    formData.timezone !== ((workspace as any)?.timezone || "utc") ||
    formData.address !== ((workspace as any)?.address || "") ||
    formData.logo !== ((workspace as any)?.logo || null);

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
            <Badge
              variant="outline"
              className="rounded-md px-2.5 py-0.5 bg-primary/8 text-primary border-primary/20 font-bold text-[9px] uppercase tracking-widest"
            >
              {(workspace as any)?.plan ?? "Pro Plan"}
            </Badge>
          </div>
  
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative group shrink-0">
              <div 
                className="w-20 h-20 rounded-xl bg-muted border border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
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
                  <Building2 className="w-7 h-7 text-muted-foreground/50" />
                )}
                <div className="absolute inset-0 bg-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl z-10">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-xs font-bold text-foreground">Workspace Logo</h4>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  Recommended 512×512px. PNG or SVG preferred.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Upload New</Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10" 
                  onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                >
                  Remove
                </Button>
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
                    <SelectItem value="USD" className="text-xs font-medium">USD – US Dollar</SelectItem>
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
  
      {/* Danger Zone */}
      <CRMCard className="border-destructive/20 bg-destructive/5 hover:border-destructive/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-destructive tracking-tight">Delete Workspace</h4>
              <p className="text-[11px] text-destructive/70 font-medium mt-0.5">
                Once deleted, all data will be permanently removed.
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDeleteWorkspace}>Delete</Button>
        </div>
      </CRMCard>
    </div>
  );
};

export default WorkspaceSettings;
