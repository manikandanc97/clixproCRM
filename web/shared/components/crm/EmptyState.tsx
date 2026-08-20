"use client";

import * as React from "react";
import {
  EmptyState as GlobalEmptyState,
  EmptyStateProps as GlobalEmptyStateProps,
  EmptyStateAction,
} from "@/shared/components/EmptyState";

export interface LegacyEmptyStateProps extends Omit<GlobalEmptyStateProps, "action"> {
  action?: EmptyStateAction;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
}

export function EmptyState(props: LegacyEmptyStateProps) {
  return <GlobalEmptyState {...props} />;
}

export * from "@/shared/components/EmptyState";
