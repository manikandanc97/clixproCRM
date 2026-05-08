"use client";

import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Smartphone,
  History,
  Globe,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CRMCard } from "@/components/shared/crm";

const activeSessions = [
  { id: 1, device: "Chrome on macOS", location: "San Francisco, US", ip: "192.168.1.1", current: true },
  { id: 2, device: "Mobile App on iPhone 15", location: "London, UK", ip: "192.168.1.45", current: false },
];

const loginHistory = [
  { id: 1, event: "Password Change", date: "2 days ago", status: "Success" },
  { id: 2, event: "Login Attempt", date: "4 days ago", status: "Blocked (Unusual IP)" },
  { id: 3, event: "New Device Added", date: "1 week ago", status: "Verified" },
];

const SecuritySettings = () => {
  const [passwordStrength, setPasswordStrength] = useState(65);

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
            {[
              { label: "Current Password", onChange: undefined },
              {
                label: "New Password",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordStrength(Math.min(e.target.value.length * 10, 100)),
              },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">{field.label}</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  onChange={field.onChange}
                  className="h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-muted-foreground">Strength</span>
              <span className={passwordStrength > 70 ? "text-emerald-500" : "text-warning"}>
                {passwordStrength > 70 ? "Strong" : "Medium"}
              </span>
            </div>
            <Progress value={passwordStrength} className="h-1.5 bg-muted" />
          </div>

          <Button className="w-full">Update Password</Button>
        </CRMCard>

        {/* 2FA */}
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

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-primary/5 border border-primary/15">
              <div>
                <h4 className="font-semibold text-xs text-foreground tracking-tight">Authenticator App</h4>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Use Google Authenticator or similar.</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <h4 className="font-semibold text-xs text-muted-foreground tracking-tight">SMS Verification</h4>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Receive codes via text message.</p>
              </div>
              <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest rounded-md bg-muted/50 border-border">
                Disabled
              </Badge>
            </div>
          </div>

          <div className="p-3 bg-warning/8 rounded-lg border border-warning/20 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-[10px] text-warning-foreground/80 leading-relaxed font-medium">
              2FA is not enabled. We strongly recommend enabling it to prevent unauthorized access.
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
          </div>

          <div className="space-y-1.5 mb-4">
            {activeSessions.map((session) => (
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
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-7 text-xs font-semibold">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/5 border-destructive/20">
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
            {loginHistory.map((item) => (
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

          <Button variant="ghost" size="sm" className="w-full mt-4 text-primary hover:bg-primary/5">
            View Full Audit Log
          </Button>
        </CRMCard>
      </div>
    </div>
  );
};

export default SecuritySettings;
