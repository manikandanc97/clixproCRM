"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CRMPageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const CRMPageContainer = ({
  children,
  className,
  maxWidth = "max-w-[1600px]",
}: CRMPageContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "mx-auto flex w-full flex-col gap-8 p-4 pb-16 sm:p-6 lg:p-8",
        maxWidth,
        className
      )}
    >
      {children}
    </motion.div>
  );
};
