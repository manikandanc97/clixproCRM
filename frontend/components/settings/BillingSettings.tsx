"use client";

import React from "react";
import { 
  CreditCard, 
  Check, 
  Download, 
  Clock, 
  Zap,
  TrendingUp,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "$29",
    features: ["Up to 1,000 Leads", "Basic Analytics", "Email Support"],
    current: false,
  },
  {
    name: "Professional",
    price: "$79",
    features: ["Unlimited Leads", "Advanced AI Insights", "Priority Support", "Team Collaboration"],
    current: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["SSO & Security", "Custom Integrations", "Dedicated Manager", "White-labeling"],
    current: false,
  },
];

const BillingSettings = () => {
  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card className="border-none bg-gradient-to-br from-primary to-indigo-600 text-white shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none rounded-md px-3 py-0.5 font-bold text-[10px] uppercase tracking-widest">
                Professional Plan
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                $79 <span className="text-lg font-normal text-white/70">/ month</span>
              </h2>
              <div className="flex items-center gap-4 text-white/80 text-[11px] font-bold uppercase tracking-widest">
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  Renews June 12, 2026
                </div>
                <div className="flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-2" />
                  Visa • 4242
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-white text-primary hover:bg-white/90 rounded-lg px-4 h-10 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95">
                Manage Billing
              </Button>
              <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-lg px-4 h-10 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95">
                View History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-200/60">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <Badge variant="outline" className="rounded-md bg-blue-50/50 border-none text-[9px] font-bold uppercase tracking-widest text-blue-600">85% Used</Badge>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Volume</h4>
              <p className="text-xl font-bold tracking-tight mt-0.5 text-slate-900 dark:text-white">8,500 / 10,000</p>
            </div>
            <Progress value={85} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-200/60">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-500" />
              </div>
              <Badge variant="outline" className="rounded-md bg-purple-50/50 border-none text-[9px] font-bold uppercase tracking-widest text-purple-600">30% Used</Badge>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Credits</h4>
              <p className="text-xl font-bold tracking-tight mt-0.5 text-slate-900 dark:text-white">300 / 1,000</p>
            </div>
            <Progress value={30} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-200/60">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-500" />
              </div>
              <Badge variant="outline" className="rounded-md bg-emerald-50/50 border-none text-[9px] font-bold uppercase tracking-widest text-emerald-600">2/5 Seats</Badge>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Seats</h4>
              <p className="text-xl font-bold tracking-tight mt-0.5 text-slate-900 dark:text-white">2 Members</p>
            </div>
            <Progress value={40} className="h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight px-1">Upgrade your plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-xl border ${
                plan.current 
                  ? "border-primary/50 bg-primary/5 shadow-md" 
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
              } relative flex flex-col`}
            >
              {plan.current && (
                <div className="absolute top-0 right-6 -translate-y-1/2">
                  <Badge className="bg-primary text-white rounded-md px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest">Current</Badge>
                </div>
              )}
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">{plan.name}</h4>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-bold tracking-tight">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-xs text-muted-foreground font-medium">/mo</span>}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    <Check className="w-3.5 h-3.5 mr-2 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                variant={plan.current ? "secondary" : "outline"} 
                className={`w-full rounded-lg h-10 text-[10px] font-bold uppercase tracking-widest ${plan.current ? "bg-white text-primary border-primary/10" : ""}`}
                disabled={plan.current}
              >
                {plan.current ? "Currently Active" : "Choose Plan"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card className="border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-sm rounded-xl overflow-hidden border border-slate-200/60">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-bold tracking-tight">Billing History</CardTitle>
          <CardDescription className="text-xs">Download your previous invoices and tax receipts.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Download className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs tracking-tight">Invoice #CR-000{i}</h5>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">May 1{i}, 2026 • $79.00</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-md h-8 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Download PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSettings;
