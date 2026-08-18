"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, AlertTriangle, Trash2 } from "lucide-react";
import { CRMCard } from "@/shared/components/crm";
import { useSecuritySettings } from "@/shared/hooks/use-settings";
import { PageErrorState, ComponentLoadingState } from "@/shared/components/page-states";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DeleteAccountModal } from "./DeleteAccountModal";

const SecuritySettings = () => {
  const { isLoading, error, refetch } = useSecuritySettings();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

      {/* Danger Zone */}
      <CRMCard className="border-destructive/30 bg-destructive/5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Danger Zone
              </h3>
              <Badge variant="destructive" className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                Irreversible
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Permanently delete your account, workspace, and all associated CRM records.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="font-bold text-xs gap-2 shrink-0 h-9 px-4 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </div>
      </CRMCard>

      <DeleteAccountModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </div>
  );
};

export default SecuritySettings;
