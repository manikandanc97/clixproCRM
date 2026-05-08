"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CRMCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  noPadding?: boolean;
  animate?: boolean;
  delay?: number;
}

export const CRMCard = ({
  children,
  className,
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
      className={cn(
        "bg-card text-card-foreground rounded-[var(--crm-card-radius)] border border-[var(--crm-border-subtle)] shadow-[var(--crm-card-shadow)] overflow-hidden transition-all duration-300",
        hoverable && "hover:shadow-[var(--crm-card-hover-shadow)] hover:border-border",
        !noPadding && "p-6",
        className
      )}
    >
      {children}
    </Component>
  );
};
