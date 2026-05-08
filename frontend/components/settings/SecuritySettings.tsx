"use client";

import React, { useState } from "react";
import { 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  History, 
  Globe, 
  AlertTriangle,
  ShieldAlert
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const activeSessions = [
  {
    id: 1,
    device: "Chrome on macOS",
    location: "San Francisco, US",
    ip: "192.168.1.1",
    current: true,
  },
  {
    id: 2,
    device: "Mobile App on iPhone 15",
    location: "London, UK",
    ip: "192.168.1.45",
    current: false,
  },
];

const loginHistory = [
  { id: 1, event: "Password Change", date: "2 days ago", status: "Success" },
  { id: 2, event: "Login Attempt", date: "4 days ago", status: "Blocked (Unusual IP)" },
  { id: 3, event: "New Device Added", date: "1 week ago", status: "Verified" },
];

const SecuritySettings = () => {
  const [passwordStrength, setPasswordStrength] = useState(65);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Password Update Card */}
        <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-slate-200/60">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Update Password
            </CardTitle>
            <CardDescription className="text-xs font-medium">Change your password to keep your account safe.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground ml-1">Current Password</Label>
                <Input type="password" placeholder="••••••••" className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:bg-white pl-4 py-5 rounded-xl transition-all" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground ml-1">New Password</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:bg-white pl-4 py-5 rounded-xl transition-all"
                  onChange={(e) => setPasswordStrength(Math.min(e.target.value.length * 10, 100))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Strength</span>
                <span className={passwordStrength > 70 ? "text-emerald-500" : "text-amber-500"}>
                  {passwordStrength > 70 ? "Strong" : "Medium"}
                </span>
              </div>
              <Progress value={passwordStrength} className="h-1.5" />
            </div>

            <Button className="w-full">
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* 2FA Card */}
        <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-slate-200/60">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              Two-Factor Auth
            </CardTitle>
            <CardDescription className="text-xs font-medium">Add an extra layer of security to your account.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs tracking-tight">Authenticator App</h4>
                <p className="text-[10px] text-muted-foreground font-medium">Use an app like Google Authenticator.</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50">
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-400 tracking-tight">SMS Verification</h4>
                <p className="text-[10px] text-muted-foreground font-medium">Receive codes via text message.</p>
              </div>
              <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest rounded-lg bg-slate-100/50 border-slate-200">Disabled</Badge>
            </div>

            <div className="p-3.5 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100/50 dark:border-amber-900/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
                You haven't set up 2FA yet. We strongly recommend enabling it to prevent unauthorized access.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-slate-200/60">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Active Sessions
            </CardTitle>
            <CardDescription className="text-xs font-medium">Devices that are currently logged into your account.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-2">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs flex items-center gap-2 tracking-tight text-slate-900 dark:text-white">
                      {session.device}
                      {session.current && <Badge className="bg-emerald-500 h-1.5 w-1.5 rounded-full p-0" />}
                    </h5>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{session.location} • {session.ip}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="xs" className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2 text-rose-500 hover:bg-rose-50">
              Sign out from all devices
            </Button>
          </CardContent>
        </Card>

        {/* Login History */}
        <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-slate-200/60">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              Security Audit
            </CardTitle>
            <CardDescription className="text-xs font-medium">Recent security events related to your account.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-1">
              {loginHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/50 transition-all border border-transparent hover:border-slate-50">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-xs tracking-tight">{item.event}</h5>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.date}</p>
                  </div>
                  <Badge variant={item.status.includes("Blocked") ? "destructive" : "secondary"} className="rounded-lg text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border-none">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4 text-primary hover:bg-primary/5">
              View Full Audit Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings;
