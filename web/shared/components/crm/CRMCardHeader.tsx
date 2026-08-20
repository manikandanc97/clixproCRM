"use client";

import { ReactNode, ElementType } from "react";
import { cn } from "@/shared/lib/utils";
import { CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { LucideIcon } from "lucide-react";

interface CRMCardHeaderProps {
  title: string;
  subtitle?: ReactNode;
  icon?: LucideIcon | ElementType;
  actions?: ReactNode;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}


export function CRMCardHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  className,
}: CRMCardHeaderProps) {
  return (
    <CardHeader className={cn("flex flex-row items-center justify-between z-10 relative pb-3 px-4 sm:px-5 pt-4 sm:pt-5", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("p-2 rounded-lg transition-all duration-300 group-hover/card:scale-105", iconBg)}>
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
        )}
        <div className="flex flex-col">
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground leading-tight mb-1">
            {title}
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-xs text-muted-foreground leading-normal">
              {subtitle}
            </CardDescription>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </CardHeader>
  );
}











