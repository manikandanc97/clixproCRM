"use client";

import React from "react";
import { motion } from "framer-motion";
import { UploadCloud, Download } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { downloadSampleTemplate } from "@/lib/bulk-import-utils";
import { slideVariants } from "./import-types";

interface ImportUploadStepProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportUploadStep({ onFileUpload }: ImportUploadStepProps) {
  return (
    <motion.div
      key="step1"
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col h-full items-center justify-center py-6"
    >
      <div className="w-full max-w-2xl relative">
        <div
          onClick={() => document.getElementById("file-upload")?.click()}
          className="relative flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-xl bg-card hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 p-16 text-center cursor-pointer group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 relative z-10">
            <UploadCloud className="w-10 h-10 text-primary" />
          </div>

          <h3 className="text-2xl font-bold mb-3 text-foreground relative z-10">
            Drag & Drop your file here
          </h3>
          <p className="text-muted-foreground mb-10 max-w-sm text-sm relative z-10">
            Support for CSV and XLSX files. Maximum file size is 20MB. Make sure
            your headers match our format.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center relative z-10">
            <Button
              size="lg"
              className="rounded-xl font-semibold px-8 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("file-upload")?.click();
              }}
            >
              Browse Files
            </Button>
            <Input
              id="file-upload"
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
              onChange={onFileUpload}
            />
            <Button
              variant="outline"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                downloadSampleTemplate("csv");
              }}
              className="rounded-xl font-semibold bg-background hover:bg-muted/50 border-border"
            >
              <Download className="w-4 h-4 mr-2" /> Download Template
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
