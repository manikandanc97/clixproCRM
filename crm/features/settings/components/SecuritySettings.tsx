"use client";

import React, { useState } from "react";
import {
  Lock,
  Smartphone,
  History,
  Globe,
  AlertTriangle,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { CRMCard } from "@/shared/components/crm";
import { EmptyStateCard, PageErrorState, ComponentLoadingState } from "@/shared/components/page-states";
import { useSecuritySettings, useUpdateSecuritySettings } from "@/shared/hooks/use-settings";
import { SecuritySessionType, SecurityAuditEventType } from "@/shared/types/settings";

const SecuritySettings = () => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { data, isLoading, error, refetch } = useSecuritySettings();
  const mutation = useUpdateSecuritySettings();

  if (isLoading) {
    return <ComponentLoadingState label="Loading security settings..." />;
  }

  if (error) {
    return <PageErrorState title="Security settings unavailable" message={(error as Error).message} onRetry={() => { void refetch(); }} />;
  }

  const activeSessions = data?.activeSessions ?? [];
  const loginHistory = data?.loginHistory ?? [];

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) return;
    alert("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setPasswordStrength(0);
  };


  const handleRevokeSession = (sessionId: string) => {
    if (!data) return;
    const newSessions = data.activeSessions.filter(s => s.id !== sessionId);
    mutation.mutate({ ...data, activeSessions: newSessions });
  };

  const handleSignOutAll = () => {
    if (!data) return;
    const newSessions = data.activeSessions.filter(s => s.current);
    mutation.mutate({ ...data, activeSessions: newSessions });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Password Update */}
        <CRMCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">Update Password</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Keep your account secure.</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Current Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordStrength(Math.min(e.target.value.length * 10, 100));
                }}
                className="h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-muted-foreground">Strength</span>
              <span className={passwordStrength > 70 ? "text-emerald-500" : passwordStrength > 40 ? "text-warning" : "text-destructive"}>
                {passwordStrength > 70 ? "Strong" : passwordStrength > 40 ? "Medium" : "Weak"}
              </span>
            </div>
            <Progress value={passwordStrength} className="h-1.5 bg-muted" />
          </div>

          <Button 
            className="w-full" 
            onClick={handleUpdatePassword} 
            disabled={!currentPassword || newPassword.length < 8}
          >
            Update Password
          </Button>
        </CRMCard>

        {/* 2FA Managed Externally */}
        <CRMCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">Two-Factor Auth</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Add an extra layer of protection.</p>
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/50 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
              Two-Factor Authentication is securely managed by our authentication provider. You can configure it during the sign-in process.
            </p>
          </div>
        </CRMCard>


        {/* Active Sessions */}
        <CRMCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">Active Sessions</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Devices logged into your account.</p>
            </div>
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
          </div>

          <div className="space-y-1.5 mb-4">
            {activeSessions.length === 0 ? (
              <EmptyStateCard title="No active sessions" message="Session records will appear when the backend provides them." />
            ) : activeSessions.map((session: SecuritySessionType) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-foreground flex items-center gap-2 tracking-tight">
                      {session.device}
                      {session.current && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
                    </h5>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {session.location} · {session.ip}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10 h-7 text-xs font-semibold" 
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={mutation.isPending}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-destructive hover:bg-destructive/5 border-destructive/20" 
            onClick={handleSignOutAll}
            disabled={mutation.isPending || activeSessions.length <= 1}
          >
            Sign out from all devices
          </Button>
        </CRMCard>

        {/* Security Audit */}
        <CRMCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">Security Audit</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Recent account security events.</p>
            </div>
          </div>

          <div className="space-y-1">
            {loginHistory.length === 0 ? (
              <EmptyStateCard title="No audit events" message="Security audit events will appear when they exist in the database." />
            ) : loginHistory.map((item: SecurityAuditEventType) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-all border border-transparent hover:border-border/40"
              >
                <div>
                  <h5 className="font-semibold text-xs text-foreground tracking-tight">{item.event}</h5>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-widest">{item.date}</p>
                </div>
                <Badge
                  variant={item.status.includes("Blocked") ? "destructive" : "secondary"}
                  className="rounded-md text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border-none"
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-4 text-primary hover:bg-primary/5" 
            onClick={() => { alert("Full audit log dialog/page"); }}
          >
            View Full Audit Log
          </Button>
        </CRMCard>
      </div>
    </div>
  );
};

export default SecuritySettings;
