"use client";

import React from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { CRMCard } from "@/shared/components/crm";
import { useSecuritySettings } from "@/shared/hooks/use-settings";
import { PageErrorState, ComponentLoadingState } from "@/shared/components/page-states";

const SecuritySettings = () => {
  const { isLoading, error, refetch } = useSecuritySettings();

  if (isLoading) {
    return <ComponentLoadingState label="Loading security settings..." />;
  }

  if (error) {
    return <PageErrorState title="Security settings unavailable" message={(error as Error).message} onRetry={() => { void refetch(); }} />;
  }

  return (
    <div className="space-y-5">
      <div className="mb-5">
        <h3 className="text-base font-bold tracking-tight text-foreground">Security & Privacy</h3>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your account access and security controls.</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CRMCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">Authentication & Access</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Your primary security controls.</p>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/50 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Managed Authentication</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium mt-1">
                  Authentication, password management, and two-factor authentication (2FA) are securely managed by our centralized authentication provider. 
                </p>
              </div>
            </div>
          </div>
        </CRMCard>
      </div>
    </div>
  );
};

export default SecuritySettings;
