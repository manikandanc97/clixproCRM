"use client";

import { cn } from "@/shared/lib/utils";
import { crmSurface } from "@/shared/lib/design-system";
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
  withAccent?: boolean;
  accentColor?: string;
  accentSeed?: string | number;
}

export const CRMCard = ({
  children,
  className,
  onClick,
  hoverable = true,
  noPadding = false,
  animate = true,
  delay = 0,
  withAccent = false,
  accentColor,
  accentSeed,
}: CRMCardProps) => {
  const Component = animate ? motion.div : "div";
  
  const accentColors = [
    "border-l-blue-500",
    "border-l-emerald-500",
    "border-l-violet-500",
    "border-l-amber-500",
    "border-l-rose-500",
    "border-l-cyan-500",
    "border-l-indigo-500",
    "border-l-purple-500",
    "border-l-pink-500",
    "border-l-orange-500",
  ];

  const getStableColor = (seed: string | number) => {
    const s = String(seed);
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return accentColors[Math.abs(hash) % accentColors.length];
  };

  const finalAccentColor = accentColor || (accentSeed !== undefined ? getStableColor(accentSeed) : "border-l-primary");

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
        withAccent && "border-l-4",
        withAccent && finalAccentColor,
        className,
        "rounded-xl"
      )}
    >
      {children}
    </Component>
  );
};











