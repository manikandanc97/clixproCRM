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
        "flex flex-col gap-8 p-6 mx-auto pb-16 w-full",
        maxWidth,
        className
      )}
    >
      {children}
    </motion.div>
  );
};
