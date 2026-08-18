"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileCheck2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { downloadFailedRows } from "@/lib/bulk-import-utils";
import { ImportSummaryData, slideVariants } from "./import-types";

interface ImportSummaryStepProps {
  summary: ImportSummaryData;
  onClose: () => void;
}

export function ImportSummaryStep({
  summary,
  onClose,
}: ImportSummaryStepProps) {
  return (
    <motion.div
      key="step5"
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col h-full items-center justify-center py-4"
    >
      <div className="w-full max-w-2xl bg-card rounded-xl border border-border shadow-xl p-8 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent"></div>

        <div className="relative flex flex-col items-center z-10 text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-5 border-4 border-white dark:border-background relative">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping"></div>
            <FileCheck2 className="w-10 h-10 relative z-10" />
          </div>
          <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">
            Import Complete!
          </h3>
          <p className="text-muted-foreground font-medium text-base">
            Your data has been successfully processed.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
          <div className="p-6 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 text-center shadow-sm">
            <h4 className="text-4xl font-black text-emerald-600 mb-2">
              {summary.imported}
            </h4>
            <p className="text-[11px] font-bold text-emerald-700/70 uppercase tracking-wider">
              Imported
            </p>
          </div>
          <div className="p-6 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 text-center shadow-sm">
            <h4 className="text-4xl font-black text-amber-600 mb-2">
              {summary.skipped}
            </h4>
            <p className="text-[11px] font-bold text-amber-700/70 uppercase tracking-wider">
              Skipped
            </p>
          </div>
          <div className="p-6 rounded-xl bg-destructive/5 border border-destructive/20 text-center shadow-sm">
            <h4 className="text-4xl font-black text-destructive mb-2">
              {summary.failed}
            </h4>
            <p className="text-[11px] font-bold text-destructive/70 uppercase tracking-wider">
              Failed
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          {summary.failedRows.length > 0 && (
            <Button
              variant="outline"
              onClick={() => downloadFailedRows(summary.failedRows, "csv")}
              className="rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10 font-bold px-6 h-12"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Failed Rows
            </Button>
          )}
          <Button
            onClick={onClose}
            size="lg"
            className="rounded-xl font-bold px-12 h-12 shadow-lg shadow-primary/20 w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
