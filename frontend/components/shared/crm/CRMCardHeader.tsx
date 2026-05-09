"use client";

import { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <CardHeader className={cn("flex flex-row items-center justify-between z-10 relative pb-6 px-6 pt-6", className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={cn("p-2.5 rounded-xl transition-all duration-300 group-hover/card:scale-110", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        )}
        <div className="flex flex-col">
          <CardTitle className="text-base font-bold tracking-tight text-foreground/90 leading-none mb-1.5">
            {title}
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-xs font-medium text-muted-foreground/80 leading-none">
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
