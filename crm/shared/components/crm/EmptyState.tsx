"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { EmptyState as GlobalEmptyState, EmptyStateAction } from "@/shared/components/EmptyState";

export interface LegacyEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: "default" | "sm";
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  primaryAction,
  size = "default",
  className,
  children,
}: LegacyEmptyStateProps) {
  const resolvedAction = action || (primaryAction ? {
    label: primaryAction.label,
    onClick: primaryAction.onClick,
    icon: primaryAction.icon,
  } : undefined);

  return (
    <GlobalEmptyState
      icon={icon}
      title={title}
      description={description}
      action={resolvedAction}
      size={size}
      className={className}
    >
      {children}
    </GlobalEmptyState>
  );
}

export * from "@/shared/components/EmptyState";
