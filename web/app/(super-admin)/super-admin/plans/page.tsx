"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Edit,
  X,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import { fetchPlatformOverview } from "@/shared/lib/api/super-admin.api";
import {
  CRMPageContainer,
  CRMPageHeader,
  CRMMetricsGrid,
  CRMMetricCard,
} from "@/shared/components/crm";

interface PlanConfig {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  billing: string;
  description: string;
  features: string[];
  maxUsers: string;
  maxLeads: string;
  storage: string;
  highlight?: boolean;
}

const INITIAL_PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free Sandbox",
    price: "₹0",
    priceNum: 0,
    billing: "forever",
    description: "Essential CRM tooling for solo founders and pre-revenue startups.",
    features: [
      "Up to 3 Team Members",
      "500 Leads & Contacts",
      "Standard Deal Pipeline",
      "Email Notifications",
      "Community Support",
    ],
    maxUsers: "3 Users",
    maxLeads: "500 Leads",
    storage: "1 GB",
  },
  {
    id: "starter",
    name: "Starter Growth",
    price: "₹1,999",
    priceNum: 1999,
    billing: "per month",
    description: "Empower growing sales teams with automation and lead tracking.",
    features: [
      "Up to 10 Team Members",
      "5,000 Leads & Contacts",
      "Custom Deal Stages & Kanban",
      "Automated Activity Reminders",
      "Standard Financial Invoicing",
      "Priority Email Support",
    ],
    maxUsers: "10 Users",
    maxLeads: "5,000 Leads",
    storage: "10 GB",
  },
  {
    id: "pro",
    name: "Professional",
    price: "₹4,999",
    priceNum: 4999,
    billing: "per month",
    description: "Advanced intelligence, deep analytics, and rupee invoicing.",
    features: [
      "Up to 30 Team Members",
      "Unlimited Leads & Deals",
      "AI Smart Summary & Copilot",
      "Advanced Revenue Analytics",
      "Rupee Invoicing (₹)",
      "Custom Role Permissions",
      "24/7 Priority Support",
    ],
    maxUsers: "30 Users",
    maxLeads: "Unlimited",
    storage: "50 GB",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹14,999",
    priceNum: 14999,
    billing: "per month",
    description: "Dedicated infrastructure, audit logs, and bespoke compliance for large orgs.",
    features: [
      "Unlimited Team Members",
      "Unlimited Leads & Quotations",
      "Full AI Document RAG Engine",
      "Complete Platform Audit Logs",
      "Dedicated Database Isolation",
      "Custom SLA & Dedicated Manager",
    ],
    maxUsers: "Unlimited",
    maxLeads: "Unlimited",
    storage: "500 GB",
  },
];

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_PLANS);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const overview = await fetchPlatformOverview();
      const dist: Record<string, number> = {};
      overview.planDistribution.forEach((p) => {
        dist[p.plan.toLowerCase()] = p.count;
      });
      setDistribution(dist);
    } catch (err: any) {
      toast.error("Failed to load subscription distribution.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setPlans((prev) =>
      prev.map((p) => (p.id === editingPlan.id ? editingPlan : p))
    );
    toast.success(`Plan "${editingPlan.name}" configuration updated.`);
    setEditingPlan(null);
  };

  const totalMonthlyMRR = plans.reduce((acc, plan) => {
    const count = distribution[plan.id] || 0;
    return acc + count * plan.priceNum;
  }, 0);

  return (
    <CRMPageContainer>
      {/* 1. Standard CRM Page Header */}
      <CRMPageHeader
        title="Plans & Subscriptions"
        subtitle="Configure multi-tenant subscription tiers, pricing models, and feature packaging."
        icon={CreditCard}
        badge="SaaS Pricing Engine"
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: loadData,
            variant: "outline",
          },
        ]}
      />

      {/* 2. Standard CRM KPI Metrics Grid */}
      <div className="shrink-0">
        <CRMMetricsGrid cols={3}>
          <CRMMetricCard
            title="Total Active Tiers"
            value={plans.length}
            change={`${plans.length} Configured Tiers`}
            trend="neutral"
            icon={Layers}
            color="blue"
            loading={loading}
          />
          <CRMMetricCard
            title="Estimated Monthly MRR"
            value={`₹${totalMonthlyMRR.toLocaleString()}`}
            change="Monthly Recurring SaaS"
            trend="up"
            icon={Zap}
            color="emerald"
            loading={loading}
          />
          <CRMMetricCard
            title="Projected Annual ARR"
            value={`₹${(totalMonthlyMRR * 12).toLocaleString()}`}
            change="12-Month Run Rate"
            trend="up"
            icon={CreditCard}
            color="purple"
            loading={loading}
          />
        </CRMMetricsGrid>
      </div>

      {/* 3. Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const tenantCount = distribution[plan.id] || 0;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl bg-card border p-6 flex flex-col justify-between shadow-card relative transition-all duration-200 hover:shadow-lg ${
                plan.highlight
                  ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                  : "border-border"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 min-h-[32px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      /{plan.billing}
                    </span>
                  </div>

                  <div className="mt-3 py-2 px-3 rounded-xl bg-muted/50 border border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">Active Tenants:</span>
                    <span className="font-black text-emerald-600">{tenantCount} orgs</span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4 space-y-2.5">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Included Features:
                  </p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-foreground/90 font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className={`w-full rounded-xl text-xs font-bold ${
                    plan.highlight
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                      : ""
                  }`}
                  onClick={() => setEditingPlan(plan)}
                >
                  Configure Tier
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Edit {editingPlan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Update tier pricing and configuration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tier Name</Label>
                <Input
                  value={editingPlan.name}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
                  }
                  className="rounded-xl h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Price Display</Label>
                  <Input
                    value={editingPlan.price}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, price: e.target.value })
                    }
                    className="rounded-xl h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Price (₹/mo)</Label>
                  <Input
                    type="number"
                    value={editingPlan.priceNum}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        priceNum: Number(e.target.value),
                      })
                    }
                    className="rounded-xl h-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <Input
                  value={editingPlan.description}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      description: e.target.value,
                    })
                  }
                  className="rounded-xl h-10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPlan(null)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save Configuration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CRMPageContainer>
  );
}
