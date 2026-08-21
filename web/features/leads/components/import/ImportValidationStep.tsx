"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { DuplicateStrategy, slideVariants } from "./import-types";

interface ImportValidationStepProps {
  validationResults: {
    valid: any[];
    invalid: any[];
  };
  duplicateStrategy: DuplicateStrategy;
  setDuplicateStrategy: (strategy: DuplicateStrategy) => void;
  onBack: () => void;
  onStartImport: () => void;
}

export function ImportValidationStep({
  validationResults,
  duplicateStrategy,
  setDuplicateStrategy,
  onBack,
  onStartImport,
}: ImportValidationStepProps) {
  return (
    <motion.div
      key="step3"
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col h-full overflow-hidden"
    >
      <div className="bg-muted/10 p-6 rounded-xl border border-border/50 flex flex-col h-full shadow-sm">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <FileCheck2 className="w-5 h-5 text-primary" />
              Validation Results
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Review the data before importing to prevent errors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 flex-shrink-0">
          <div className="p-5 rounded-xl border border-border bg-card flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 group-hover:w-2 transition-all"></div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 ml-3 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                Valid Rows
              </p>
              <h4 className="text-3xl font-black text-foreground">
                {validationResults.valid.length}
              </h4>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-destructive group-hover:w-2 transition-all"></div>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive ml-3 shadow-inner">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                Invalid Rows
              </p>
              <h4 className="text-3xl font-black text-foreground">
                {validationResults.invalid.length}
              </h4>
            </div>
          </div>
        </div>

        {validationResults.invalid.length > 0 && (
          <div className="flex-1 overflow-auto rounded-xl border border-destructive/20 bg-card mb-6 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-card sticky top-0 z-10 border-b border-destructive/20 shadow-xs">
                <tr>
                  <th className="px-6 py-3 font-bold text-destructive text-xs uppercase tracking-wider bg-card">
                    Error Reason
                  </th>
                  <th className="px-6 py-3 font-bold text-foreground text-xs uppercase tracking-wider bg-card">
                    Row Data Snippet
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {validationResults.invalid.slice(0, 50).map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-destructive/5 transition-colors"
                  >
                    <td className="px-6 py-3 text-destructive font-medium text-xs w-1/3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />{" "}
                        {row._errors}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground truncate max-w-[400px] font-mono text-xs">
                      {JSON.stringify(row).substring(0, 100)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-4 flex-shrink-0">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Duplicate Handling Strategy
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: "skip",
                label: "Skip Duplicates",
                desc: "Ignore records that already exist",
              },
              {
                id: "update",
                label: "Update Existing",
                desc: "Overwrite existing records with new data",
              },
              {
                id: "create",
                label: "Create Duplicate",
                desc: "Import anyway (not recommended)",
              },
            ].map((strat) => (
              <div
                key={strat.id}
                onClick={() =>
                  setDuplicateStrategy(strat.id as DuplicateStrategy)
                }
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  duplicateStrategy === strat.id
                    ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/10"
                    : "border-border hover:border-primary/30 bg-background hover:bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${duplicateStrategy === strat.id ? "border-primary bg-primary/10" : "border-muted-foreground/30 bg-background"}`}
                  >
                    {duplicateStrategy === strat.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <span
                    className={`font-bold text-sm ${duplicateStrategy === strat.id ? "text-primary" : "text-foreground"}`}
                  >
                    {strat.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground ml-8 leading-relaxed font-medium">
                  {strat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center flex-shrink-0 border-t border-border/50 pt-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="rounded-xl font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />{" "}
            {validationResults.invalid.length > 0 ? "Fix Mapping" : "Back"}
          </Button>
          <Button
            onClick={onStartImport}
            disabled={validationResults.valid.length === 0}
            size="lg"
            className="rounded-xl font-bold px-8 shadow-md"
          >
            {validationResults.invalid.length > 0
              ? "Skip Invalid & Import"
              : "Start Import"}{" "}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
