"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center shadow-sm",
        className
      )}
    >
      {Icon && (
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground mb-6">
          <Icon className="size-8" />
        </div>
      )}
      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm font-medium text-muted-foreground max-w-sm leading-relaxed mb-8">
        {description}
      </p>
      {action && (
        <Button 
          onClick={action.onClick}
          className="rounded-xl h-11 px-6 font-bold shadow-soft transition-all hover:shadow-md"
        >
          {action.icon && <action.icon className="mr-2 size-4" />}
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}





