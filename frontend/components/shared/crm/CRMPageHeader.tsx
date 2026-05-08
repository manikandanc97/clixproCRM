"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Action {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "premium" | "emerald";
}

interface CRMPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: string;
  actions?: Action[];
  className?: string;
}

export const CRMPageHeader = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  badge,
  actions,
  className,
}: CRMPageHeaderProps) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8", className)}>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-1.5"
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={cn("p-2 rounded-xl bg-background border shadow-sm", iconColor)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-lg border border-border/50">
              {badge}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm font-medium max-w-2xl">
            {subtitle}
          </p>
        )}
      </motion.div>

      {actions && actions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {actions.map((action, index) => {
            const isPrimary = index === actions.length - 1;
            return (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || (isPrimary ? "default" : "outline")}
                size={isPrimary ? "lg" : "default"}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </Button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
