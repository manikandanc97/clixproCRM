"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/shared/ui/badge";

interface Action {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  actions?: Action[];
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col justify-between gap-4 md:flex-row md:items-end mb-8", className)}>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1.5"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/20">
              <Icon className="size-5" />
            </div>
          )}
          {badge && (
            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-none">
              {badge}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-medium text-muted-foreground max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </motion.div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {children}
        {actions && actions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-center gap-2"
          >
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || (index === actions.length - 1 ? "default" : "outline")}
                disabled={action.loading}
                className="w-full sm:w-auto h-10 px-5 font-semibold shadow-sm transition-all"
              >
                {action.icon && <action.icon className="mr-2 size-4" />}
                {action.label}
              </Button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}





