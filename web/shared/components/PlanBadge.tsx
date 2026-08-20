"use client";

import * as React from "react";
import { Sparkles, Zap, ShieldCheck, Box } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface PlanBadgeProps {
  plan?: string | null;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

interface PlanStyleConfig {
  bg: string;
  text: string;
  border: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
}

const getPlanConfig = (rawPlan?: string | null): PlanStyleConfig => {
  const normalized = (rawPlan || "").trim().toLowerCase();

  if (normalized.includes("pro") || normalized.includes("professional")) {
    return {
      bg: "bg-purple-500/10 hover:bg-purple-500/15 dark:bg-purple-500/20",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-500/25 dark:border-purple-500/30",
      icon: Sparkles,
      label: rawPlan?.toUpperCase() === "PRO" ? "PRO" : "Pro",
    };
  }

  if (normalized.includes("enterprise") || normalized.includes("custom") || normalized.includes("business")) {
    return {
      bg: "bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/25 dark:border-amber-500/30",
      icon: ShieldCheck,
      label: "Enterprise",
    };
  }

  if (normalized.includes("starter") || normalized.includes("growth")) {
    return {
      bg: "bg-sky-500/10 hover:bg-sky-500/15 dark:bg-sky-500/20",
      text: "text-sky-700 dark:text-sky-300",
      border: "border-sky-500/25 dark:border-sky-500/30",
      icon: Zap,
      label: "Starter",
    };
  }

  if (normalized.includes("free") || normalized.includes("sandbox") || normalized === "") {
    return {
      bg: "bg-slate-500/10 hover:bg-slate-500/15 dark:bg-slate-500/20",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-500/25 dark:border-slate-500/30",
      icon: Box,
      label: "Free",
    };
  }

  return {
    bg: "bg-muted/80 hover:bg-muted dark:bg-muted/60",
    text: "text-foreground",
    border: "border-border",
    label: rawPlan || "Free",
  };
};

export function PlanBadge({
  plan,
  size = "md",
  showIcon = true,
  className,
}: PlanBadgeProps) {
  const config = getPlanConfig(plan);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-xs px-3 py-1.5 gap-1.5 font-semibold",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-lg border shadow-xs transition-colors",
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && Icon && (
        <Icon className={cn("shrink-0 opacity-80", iconSizes[size])} />
      )}
      <span className="capitalize">{rawDisplayPlan(plan, config.label)}</span>
    </span>
  );
}

function rawDisplayPlan(original?: string | null, fallbackLabel: string = "Free") {
  if (!original) return fallbackLabel;
  const upper = original.toUpperCase();
  if (upper === "PRO") return "PRO";
  if (upper === "FREE") return "Free";
  return original.charAt(0).toUpperCase() + original.slice(1);
}
