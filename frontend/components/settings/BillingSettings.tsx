"use client";

import React from "react";
import { CreditCard, Check, Download, Clock, Zap, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { CRMCard } from "@/components/shared/crm";

const plans = [
  { name: "Starter", price: "$29", features: ["Up to 1,000 Leads", "Basic Analytics", "Email Support"], current: false },
  { name: "Professional", price: "$79", features: ["Unlimited Leads", "Advanced AI Insights", "Priority Support", "Team Collaboration"], current: true },
  { name: "Enterprise", price: "Custom", features: ["SSO & Security", "Custom Integrations", "Dedicated Manager", "White-labeling"], current: false },
];

const usage = [
  { label: "Lead Volume", value: "8,500 / 10,000", pct: 85, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "AI Credits", value: "300 / 1,000", pct: 30, icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Team Seats", value: "2 / 5 Members", pct: 40, icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const BillingSettings = () => (
  <div className="space-y-5">
    {/* Current plan banner */}
    <CRMCard className="bg-gradient-to-br from-primary to-primary/80 border-primary/30 text-primary-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="space-y-2.5">
          <Badge className="bg-white/15 text-white hover:bg-white/20 border-none rounded-md text-[10px] font-bold uppercase tracking-widest">
            Professional Plan
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            $79 <span className="text-lg font-normal opacity-70">/ month</span>
          </h2>
          <div className="flex flex-wrap gap-4 text-white/75 text-[11px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Renews June 12, 2026</div>
            <div className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />Visa · 4242</div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button className="bg-white text-primary hover:bg-white/90 rounded-lg px-4 h-9 text-xs font-bold uppercase tracking-widest">Manage Billing</Button>
          <Button variant="outline" className="bg-transparent border-white/25 text-white hover:bg-white/10 rounded-lg px-4 h-9 text-xs font-bold uppercase tracking-widest">History</Button>
        </div>
      </div>
    </CRMCard>

    {/* Usage */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {usage.map((m) => (
        <CRMCard key={m.label} className="space-y-3">
          <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center`}>
            <m.icon className={`w-4 h-4 ${m.color}`} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{m.label}</p>
            <p className="text-lg font-bold tracking-tight text-foreground mt-0.5">{m.value}</p>
          </div>
          <Progress value={m.pct} className="h-1.5 bg-muted" />
        </CRMCard>
      ))}
    </div>

    {/* Plans */}
    <div>
      <h3 className="text-base font-bold tracking-tight text-foreground mb-4">Upgrade your plan</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative flex flex-col p-5 rounded-[var(--crm-card-radius)] border transition-all ${
              plan.current
                ? "border-primary/40 bg-primary/5 shadow-[var(--crm-card-hover-shadow)]"
                : "border-[var(--crm-border-subtle)] bg-card shadow-[var(--crm-card-shadow)] hover:border-border"
            }`}
          >
            {plan.current && (
              <div className="absolute top-0 right-5 -translate-y-1/2">
                <Badge className="bg-primary text-primary-foreground rounded-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest">Current</Badge>
              </div>
            )}
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-2">{plan.name}</h4>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-2xl font-bold tracking-tight text-foreground">{plan.price}</span>
              {plan.price !== "Custom" && <span className="text-xs text-muted-foreground font-medium">/mo</span>}
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center text-xs font-medium text-muted-foreground">
                  <Check className="w-3.5 h-3.5 mr-2 text-primary shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button variant={plan.current ? "secondary" : "outline"} size="sm" className="w-full" disabled={plan.current}>
              {plan.current ? "Currently Active" : "Choose Plan"}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Billing history */}
    <CRMCard noPadding>
      <div className="px-5 py-4 border-b border-[var(--crm-border-subtle)]">
        <h3 className="text-sm font-bold tracking-tight text-foreground">Billing History</h3>
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Download your previous invoices and tax receipts.</p>
      </div>
      <div className="divide-y divide-[var(--crm-border-subtle)]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h5 className="font-semibold text-xs text-foreground tracking-tight">Invoice #CR-000{i}</h5>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-widest">May 1{i}, 2026 · $79.00</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Download PDF
            </Button>
          </div>
        ))}
      </div>
    </CRMCard>
  </div>
);

export default BillingSettings;
