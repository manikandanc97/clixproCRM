"use client";

import { cn } from "@/lib/utils";
import { crmSurface } from "@/lib/design-system";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CRMCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  noPadding?: boolean;
  animate?: boolean;
  delay?: number;
}

export const CRMCard = ({
  children,
  className,
  onClick,
  hoverable = true,
  noPadding = false,
  animate = true,
  delay = 0,
}: CRMCardProps) => {
  const Component = animate ? motion.div : "div";
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay }
  } : {};

  return (
    <Component
      {...animationProps}
      onClick={onClick}
      className={cn(
        "overflow-hidden",
        crmSurface.card,
        hoverable && crmSurface.interactive,
        !noPadding && "p-6",
        className,
        "rounded-xl"
      )}
    >
      {children}
    </Component>
  );
};
