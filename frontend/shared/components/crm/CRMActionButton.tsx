"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface CRMActionButtonProps {
  label?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  iconOnly?: boolean;
}

export const CRMActionButton = ({
  label,
  icon: Icon,
  onClick,
  variant = "outline",
  iconOnly = false,
}: CRMActionButtonProps) => {
  return (
    <Button
      variant={variant}
      size={iconOnly ? "icon" : "default"}
      onClick={onClick}
      aria-label={iconOnly ? label : undefined}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {!iconOnly && label}
    </Button>
  );
};











