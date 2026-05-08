"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Package,
  Mail,
  Users,
  BarChart3,
  KanbanSquare,
  CalendarDays,
  FileText,
  Lightbulb,
  PhoneCall,
  Key,
  Server,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CRMCard } from "@/components/shared/crm";

const activatedModules = [
  { label: "Lead Management", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Pipeline & Deals", icon: KanbanSquare, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Customer Management", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Task Management", icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Reports & Analytics", icon: BarChart3, color: "text-rose-500", bg: "bg-rose-500/10" },
  { label: "Calendar & Meetings", icon: CalendarDays, color: "text-sky-500", bg: "bg-sky-500/10" },
  { label: "Quotations", icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "AI Insights", icon: Lightbulb, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const licenseDetails = [
  { label: "License Type", value: "Perpetual Business License", icon: Key },
  { label: "Deployment", value: "On-Premise / Cloud", icon: Server },
  { label: "Support Tier", value: "Priority Business Support", icon: PhoneCall },
  { label: "License Valid Until", value: "Lifetime Access", icon: Clock },
];

const BillingSettings = () => (
  <div className="space-y-5">
    {/* License Banner */}
    <CRMCard className="bg-gradient-to-br from-primary to-primary/80 border-primary/30 text-primary-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="space-y-2.5">
          <Badge className="bg-white/15 text-white hover:bg-white/20 border-none rounded-md text-[10px] font-bold uppercase tracking-widest">
            Custom Business Solution
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Lifetime Access
          </h2>
          <p className="text-white/75 text-[11px] font-bold uppercase tracking-widest">
            One-Time Purchase · Pay Once &amp; Own Forever
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            className="bg-white text-primary hover:bg-white/90 rounded-lg px-4 h-9 text-xs font-bold uppercase tracking-widest"
            onClick={() => window.open("mailto:sales@clientrisecrm.com")}
          >
            <Mail className="w-3.5 h-3.5 mr-2" />
            Contact for Pricing
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border-white/25 text-white hover:bg-white/10 rounded-lg px-4 h-9 text-xs font-bold uppercase tracking-widest"
          >
            <Key className="w-3.5 h-3.5 mr-2" />
            View License
          </Button>
        </div>
      </div>
    </CRMCard>

    {/* License Details */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {licenseDetails.map((detail) => {
        const Icon = detail.icon;
        return (
          <CRMCard key={detail.label} className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {detail.label}
              </p>
              <p className="text-sm font-bold tracking-tight text-foreground mt-0.5">
                {detail.value}
              </p>
            </div>
          </CRMCard>
        );
      })}
    </div>

    {/* Activated Modules */}
    <div>
      <h3 className="text-base font-bold tracking-tight text-foreground mb-4">
        Activated Modules
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activatedModules.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="flex items-center gap-3 p-4 rounded-xl border border-[var(--crm-border-subtle)] bg-card shadow-[var(--crm-card-shadow)] hover:border-primary/20 hover:shadow-[var(--crm-card-hover-shadow)] transition-all"
            >
              <div className={`w-8 h-8 rounded-lg ${mod.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${mod.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{mod.label}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            </motion.div>
          );
        })}
      </div>
    </div>

    {/* CTA / Support */}
    <CRMCard className="border-dashed border-primary/20 bg-primary/3">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-foreground tracking-tight">
            Need additional modules or a custom enterprise build?
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium mt-1">
            Our team builds tailor-made CRM solutions for small &amp; medium businesses. Get a quote with no recurring fees.
          </p>
        </div>
        <Button
          className="shrink-0 rounded-lg px-5 h-9 text-xs font-bold uppercase tracking-widest"
          onClick={() => window.open("mailto:sales@clientrisecrm.com")}
        >
          Contact for Pricing
        </Button>
      </div>
    </CRMCard>
  </div>
);

export default BillingSettings;
