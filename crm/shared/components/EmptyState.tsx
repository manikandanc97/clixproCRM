"use client";

import * as React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  size?: "default" | "sm";
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  size = "default",
  className,
  children,
}: EmptyStateProps) {
  const isSmall = size === "sm";
  const hasFooter = Boolean(action || children);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border/80 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 w-full flex-1",
        isSmall ? "p-5 sm:p-6 min-h-[180px]" : "p-6 sm:p-10 min-h-[280px]",
        className
      )}
      role="region"
      aria-label={title}
    >
      <div className="relative mb-4 group shrink-0">
        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl scale-125 transition-opacity opacity-70 group-hover:opacity-100" />
        <div 
          className={cn(
            "relative z-10 flex items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/20 text-primary shadow-sm transition-transform duration-300 group-hover:scale-105",
            isSmall ? "w-11 h-11" : "w-14 h-14 sm:w-16 sm:h-16"
          )}
        >
          <Icon className={cn(isSmall ? "w-5 h-5" : "w-7 h-7 sm:w-8 sm:h-8")} strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>

      <h3 className={cn(
        "font-bold tracking-tight text-foreground mb-2 shrink-0",
        isSmall ? "text-sm sm:text-base" : "text-base sm:text-lg lg:text-xl"
      )}>
        {title}
      </h3>

      <p className={cn(
        "font-medium text-muted-foreground leading-relaxed mx-auto shrink-0",
        hasFooter ? "mb-5" : "mb-0",
        isSmall ? "text-xs max-w-[240px]" : "text-xs sm:text-sm max-w-sm"
      )}>
        {description}
      </p>

      {hasFooter && (
        <div className="flex flex-col items-center justify-center gap-2.5 mt-1 shrink-0">
          {action && (
            <Button 
              onClick={action.onClick}
              variant={action.variant || "default"}
              size={isSmall ? "sm" : "default"}
              className={cn(
                "rounded-xl font-bold shadow-soft transition-all hover:shadow-md active:scale-95",
                isSmall ? "h-8 px-4 text-xs" : "h-9 sm:h-10 px-5 sm:px-6 text-xs sm:text-sm"
              )}
            >
              {action.icon && <action.icon className={cn(isSmall ? "mr-1.5 w-3.5 h-3.5" : "mr-2 w-4 h-4")} />}
              {action.label}
            </Button>
          )}
          {children}
        </div>
      )}
    </motion.div>
  );
}
