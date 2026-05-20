"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { DashboardWidgetSkeleton } from "@/shared/components/skeletons";
import { useAuth } from "@/features/auth/components/auth-provider";

interface DashboardWidgetWrapperProps {
  id: string;
  title: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  children: ReactNode;
  skeletonRows?: number;
  className?: string;
  delay?: number;
}

/**
 * A standardized wrapper for dashboard widgets that handles:
 * 1. Independent loading states (skeletons)
 * 2. Independent error states with retry
 * 3. RBAC (Access Control)
 * 4. Mount animations
 */
export function DashboardWidgetWrapper({
  id,
  title,
  isLoading,
  isError,
  onRetry,
  children,
  skeletonRows = 3,
  className = "w-full h-full",
  delay = 0,
}: DashboardWidgetWrapperProps) {
  const { access } = useAuth();
  
  // RBAC Check: If user doesn't have permission for this widget, don't render it at all.
  const hasAccess = access.dashboardWidgets.includes(id);
  
  if (!hasAccess) {
    console.warn(`[Dashboard] Access denied for widget: ${id}`);
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn("min-h-[200px]", className)}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <DashboardWidgetSkeleton rows={skeletonRows} />
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-center h-full min-h-[200px]"
          >
            <AlertCircle className="w-8 h-8 text-destructive mb-3 opacity-50" />
            <h4 className="text-sm font-bold text-foreground mb-1">{title} Failed</h4>
            <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">We couldn&apos;t load this widget&apos;s data.</p>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="h-8 text-xs font-bold gap-2 rounded-xl border-destructive/20 hover:bg-destructive/10 transition-all active:scale-95"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
