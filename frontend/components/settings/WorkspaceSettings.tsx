"use client";

import React, { useState } from "react";
import { Building2, Hash, Globe, MapPin, DollarSign, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WorkspaceSettings = () => {
  const [logo, setLogo] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Branding Section */}
      <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">Workspace Branding</CardTitle>
              <CardDescription className="text-xs font-medium">Customize how your workspace appears to team members.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-lg px-3 py-0.5 bg-primary/5 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-widest">
              Pro Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50">
                {logo ? (
                  <img src={logo} alt="Workspace Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setLogo(URL.createObjectURL(file));
                  }}
                />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Workspace Logo</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Recommend 512x512px. PNG or SVG preferred.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="xs">Upload New</Button>
                <Button variant="ghost" size="xs" className="text-destructive hover:bg-destructive/10">Remove</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-bold tracking-tight">Organization Details</CardTitle>
          <CardDescription className="text-xs font-medium">Manage your business identity and regional settings.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground ml-1">Workspace Name</Label>
              <div className="relative group">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input defaultValue="ClientRise CRM" className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-900 pl-10 py-5 rounded-xl transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground ml-1">Tax ID / Registration</Label>
              <div className="relative group">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input defaultValue="GST123456789" className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-900 pl-10 py-5 rounded-xl transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground ml-1">Default Currency</Label>
              <Select defaultValue="USD">
                <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:ring-primary/30 focus:bg-white dark:focus:bg-slate-900 pl-10 py-5 rounded-xl transition-all h-10 group font-medium text-sm">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <DollarSign className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="USD" className="text-xs font-medium">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR" className="text-xs font-medium">EUR - Euro</SelectItem>
                  <SelectItem value="INR" className="text-xs font-medium">INR - Indian Rupee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground ml-1">Timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:ring-primary/30 focus:bg-white dark:focus:bg-slate-900 pl-10 py-5 rounded-xl transition-all h-10 group font-medium text-sm">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="utc" className="text-xs font-medium">UTC (Coordinated Universal Time)</SelectItem>
                  <SelectItem value="ist" className="text-xs font-medium">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="est" className="text-xs font-medium">America/New_York (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold text-muted-foreground ml-1">Business Address</Label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input defaultValue="123 Business Ave, Suite 100, Silicon Valley, CA" className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-900 pl-10 py-5 rounded-xl transition-all" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-none bg-red-50/50 dark:bg-red-900/10 rounded-2xl overflow-hidden border border-red-100 dark:border-red-900/30">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-sm">
              <Info className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900 dark:text-red-400 tracking-tight">Delete Workspace</h4>
              <p className="text-[11px] text-red-700/70 dark:text-red-400/60 font-medium">Once deleted, all data will be permanently removed.</p>
            </div>
          </div>
          <Button variant="destructive" size="sm">Delete</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceSettings;
