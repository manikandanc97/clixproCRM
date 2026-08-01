import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full w-full p-4 text-center min-h-[250px]" role="region" aria-label={title}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
        className="mb-4 relative group"
      >
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl scale-[2.0]" />
        <div className="w-[64px] h-[64px] bg-muted/30 dark:bg-muted/10 rounded-full flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-105 ring-1 ring-border/50 shadow-sm">
          <Icon className="w-8 h-8 text-muted-foreground/60 transition-colors duration-500 group-hover:text-primary/70" strokeWidth={1.5} aria-hidden="true" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-col items-center w-full"
      >
        <h3 className="text-lg font-bold text-foreground tracking-tight mb-1.5">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground max-w-[250px] mx-auto mb-5 leading-relaxed">
          {description.split('\\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < description.split('\\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>

        <div className="flex flex-col items-center gap-2.5 w-full">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="rounded-xl font-bold px-6 shadow-sm h-9 text-xs w-auto hover:shadow-md transition-all active:scale-95"
            >
              {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5 mr-1.5" />}
              {primaryAction.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="rounded-xl font-bold text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest px-4 h-7 transition-colors active:scale-95"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
