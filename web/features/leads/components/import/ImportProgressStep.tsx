"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { slideVariants } from "./import-types";

interface ImportProgressStepProps {
  progress: number;
  totalProcessed: number;
  validRowCount: number;
  currentImported: number;
  currentSkipped: number;
  currentFailed: number;
  isCancelling: boolean;
  onCancel: () => void;
}

export function ImportProgressStep({
  progress,
  totalProcessed,
  validRowCount,
  currentImported,
  currentSkipped,
  currentFailed,
  isCancelling,
  onCancel,
}: ImportProgressStepProps) {
  return (
    <motion.div
      key="step4"
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col h-full items-center justify-center py-16"
    >
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-[8px] border-muted opacity-30"></div>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-primary transition-all duration-500 ease-out drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-black text-foreground">
            {progress}%
          </span>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground animate-pulse">
        Importing Data...
      </h3>
      <p className="text-muted-foreground font-medium text-sm text-center max-w-xs mb-6">
        {totalProcessed} / {validRowCount} records processed
      </p>
      <div className="flex gap-6 text-sm font-semibold mb-8">
        <div className="flex flex-col items-center">
          <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">
            {currentImported}
          </span>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">
            Imported
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-amber-600 dark:text-amber-400 text-xl font-black">
            {currentSkipped}
          </span>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">
            Skipped
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-destructive text-xl font-black">
            {currentFailed}
          </span>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">
            Failed
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="lg"
        disabled={isCancelling}
        onClick={onCancel}
        className="rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10 font-bold px-8"
      >
        {isCancelling ? "Finishing current batch..." : "Cancel Import"}
      </Button>
    </motion.div>
  );
}
