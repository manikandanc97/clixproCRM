"use client";

import { cn } from "@/lib/utils";

interface CRMPageSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const CRMPageSection = ({
  children,
  className,
  title,
  subtitle,
}: CRMPageSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && <h2 className="crm-section-title">{title}</h2>}
          {subtitle && <p className="crm-description">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
