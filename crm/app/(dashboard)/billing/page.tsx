"use client";

import {
  Package,
  Users,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Globe,
  CalendarDays,
  Zap,
  Lock,
  Server,
  Building2,
} from "lucide-react";
import {
  CRMPageContainer,
  CRMPageHeader,
  CRMMetricsGrid,
  BaseStatCard,
  CRMCard,
  CRMPageSection,
} from "@/shared/components/crm";
import { motion, Variants } from "framer-motion";
import { cn } from "@/shared/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Static license data (replace with API call once backend is ready)
// ─────────────────────────────────────────────────────────────────────────────
const licenseKPIs = [
  {
    id: "tier",
    title: "License Tier",
    value: "Business Elite",
    change: "Lifetime",
    trend: "up" as const,
    icon: ShieldCheck,
    color: "violet" as const,
    comparisonText: "one-time purchase",
  },
  {
    id: "seats",
    title: "Active Users",
    value: "12 / 50",
    change: "38 remaining",
    trend: "neutral" as const,
    icon: Users,
    color: "indigo" as const,
    comparisonText: "seats available",
  },
  {
    id: "storage",
    title: "Storage Used",
    value: "4.2 GB",
    change: "15.8 GB free",
    trend: "neutral" as const,
    icon: HardDrive,
    color: "cyan" as const,
    comparisonText: "of 20 GB quota",
  },
  {
    id: "modules",
    title: "Active Modules",
    value: "9 / 12",
    change: "+3 available",
    trend: "up" as const,
    icon: Layers,
    color: "emerald" as const,
    comparisonText: "upgrade to unlock",
  },
];

const activatedModules = [
  { name: "CRM Core", status: "active", icon: Building2 },
  { name: "Lead Management", status: "active", icon: Users },
  { name: "Pipeline & Deals", status: "active", icon: Zap },
  { name: "Analytics Suite", status: "active", icon: Globe },
  { name: "Employee HR", status: "active", icon: Users },
  { name: "Role & Permissions", status: "active", icon: Lock },
  { name: "AI Insights", status: "active", icon: Zap },
  { name: "Reports Engine", status: "active", icon: Layers },
  { name: "Task Manager", status: "active", icon: CheckCircle2 },
  { name: "Attendance Module", status: "inactive", icon: CalendarDays },
  { name: "Support Tickets", status: "inactive", icon: Server },
  { name: "Billing Gateway", status: "inactive", icon: Package },
];

const deploymentInfo = [
  { label: "License Key", value: "CR-ELT-****-****-A9F2" },
  { label: "Activation Date", value: "Jan 15, 2025" },
  { label: "License Type", value: "Perpetual (Lifetime)" },
  { label: "Build Version", value: "v3.2.1" },
  { label: "Environment", value: "Production" },
  { label: "Support Until", value: "Jan 15, 2027" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function BillingPage() {
  return (
    <CRMPageContainer>
      <CRMPageHeader
        title="Software License"
        subtitle="View your one-time purchase license details, activated modules, and deployment information."
        badge="Business License"
        icon={Package}
      />

      {/* ── KPI Cards ── */}
      <CRMMetricsGrid>
        {licenseKPIs.map((kpi, i) => (
          <BaseStatCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
            color={kpi.color}
            comparisonText={kpi.comparisonText}
            delay={i * 0.08}
          />
        ))}
      </CRMMetricsGrid>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Activated Modules ── */}
        <div className="lg:col-span-2">
          <CRMPageSection title="Activated Modules">
            <CRMCard className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {activatedModules.map((mod, i) => {
                  const ModIcon = mod.icon;
                  const isActive = mod.status === "active";
                  return (
                    <motion.div
                      key={mod.name}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200",
                        isActive
                          ? "bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10"
                          : "bg-muted/30 border-border/50 opacity-60"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                          isActive
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                            : "bg-muted border-border text-muted-foreground"
                        )}
                      >
                        <ModIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {mod.name}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            isActive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                      {isActive && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CRMCard>
          </CRMPageSection>
        </div>

        {/* ── Deployment Info ── */}
        <div className="space-y-6">
          <CRMPageSection title="Deployment Details">
            <CRMCard className="p-6 divide-y divide-border/50">
              {deploymentInfo.map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 shrink-0">
                    {item.label}
                  </span>
                  <span className="text-xs font-semibold text-foreground text-right truncate">
                    {item.value}
                  </span>
                </motion.div>
              ))}
            </CRMCard>
          </CRMPageSection>

          {/* ── License Badge ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-6 text-center"
          >
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <ShieldCheck className="h-6 w-6 text-violet-500" />
            </div>
            <h4 className="text-sm font-bold text-foreground tracking-tight">
              Genuine License Verified
            </h4>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Your ClixProCRM is activated with a valid Business Elite lifetime license.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                License Active
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </CRMPageContainer>
  );
}
