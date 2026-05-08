"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CRMStatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const toneClasses: Record<CRMStatusTone, string> = {
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
  neutral: "badge-neutral",
  primary: "badge-primary",
};

interface CRMStatusBadgeProps {
  children: React.ReactNode;
  tone?: CRMStatusTone;
  className?: string;
}

export const CRMStatusBadge = ({
  children,
  tone = "neutral",
  className,
}: CRMStatusBadgeProps) => {
  return (
    <Badge variant="outline" className={cn(toneClasses[tone], className)}>
      {children}
    </Badge>
  );
};
