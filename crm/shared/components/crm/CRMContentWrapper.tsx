"use client";

import { cn } from "@/shared/lib/utils";

interface CRMContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const CRMContentWrapper = ({
  children,
  className,
}: CRMContentWrapperProps) => {
  return (
    <div className={cn("w-full overflow-hidden", className)}>
      {children}
    </div>
  );
};











