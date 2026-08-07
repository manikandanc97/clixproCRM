"use client";

import React, { useState } from 'react';
import { FormModal } from "@/shared/components/form-modal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { 
  UploadCloud, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  FileCheck2, 
  ArrowLeft,
  Settings2,
  FileSpreadsheet,
  ChevronDown,
  AlertTriangle,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { downloadSampleTemplate, downloadFailedRows, parseFile, IMPORT_TEMPLATE_HEADERS } from "@/lib/bulk-import-utils";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface BulkImportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CRM_FIELDS = [
  { key: "name", label: "Full Name *", required: true, advanced: false },
  { key: "company", label: "Company", required: false, advanced: false },
  { key: "email", label: "Email Address *", required: true, advanced: false },
  { key: "phone", label: "Phone Number", required: false, advanced: false },
  { key: "status", label: "Status (e.g., New Lead)", required: false, advanced: false },
  { key: "priority", label: "Priority", required: false, advanced: false },
  { key: "valueAmount", label: "Deal Value", required: false, advanced: false },
  { key: "probability", label: "Probability (%)", required: false, advanced: false },
  { key: "country", label: "Country", required: false, advanced: true },
  { key: "state", label: "State", required: false, advanced: true },
  { key: "city", label: "City", required: false, advanced: true },
  { key: "source", label: "Lead Source", required: false, advanced: true },
  { key: "pipeline", label: "Pipeline", required: false, advanced: true },
  { key: "currency", label: "Currency", required: false, advanced: true },
  { key: "assignedTo", label: "Assigned To", required: false, advanced: true },
  { key: "tags", label: "Tags", required: false, advanced: true },
  { key: "notes", label: "Notes", required: false, advanced: true }
];

const AUTO_MAP = {
  "first name": "name",
  "full name": "name",
  "full name *": "name",
  "name": "name",
  "company": "company",
  "organization": "company",
  "email": "email",
  "email *": "email",
  "email address": "email",
  "phone": "phone",
  "phone number": "phone",
  "mobile": "phone",
  "value": "valueAmount",
  "deal value": "valueAmount",
  "amount": "valueAmount",
  "status": "status",
  "stage": "status",
  "priority": "priority",
  "probability": "probability",
  "country": "country",
  "state": "state",
  "city": "city",
  "lead source": "source",
  "source": "source",
  "pipeline": "pipeline",
  "currency": "currency",
  "assigned to": "assignedTo",
  "owner": "assignedTo",
  "tags": "tags",
  "labels": "tags",
  "notes": "notes",
  "description": "notes",
  "remarks": "notes"
};

const STEPS = [
  { num: 1, label: "Upload File" },
  { num: 2, label: "Map Columns" },
  { num: 3, label: "Validate Data" },
  { num: 4, label: "Import" },
];

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onOpenChange, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ReturnType<typeof JSON.parse>[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({}); 
  
  const [isOfficialTemplate, setIsOfficialTemplate] = useState(false);
  const [showAdvancedMapping, setShowAdvancedMapping] = useState(false);

  const [validationResults, setValidationResults] = useState<{ valid: ReturnType<typeof JSON.parse>[], invalid: ReturnType<typeof JSON.parse>[] }>({ valid: [], invalid: [] });
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "update" | "create">("skip");
  
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<{ imported: number, skipped: number, failed: number, failedRows: ReturnType<typeof JSON.parse>[] } | null>(null);

  const resetState = () => {
    setStep(1);
    setFile(null);
    setParsedData([]);
    setFileHeaders([]);
    setMapping({});
    setIsOfficialTemplate(false);
    setShowAdvancedMapping(false);
    setValidationResults({ valid: [], invalid: [] });
    setDuplicateStrategy("skip");
    setImporting(false);
    setProgress(0);
    setSummary(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetState, 300);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const ext = uploadedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      toast.error("Unsupported file type. Please upload a CSV or Excel file.");
      return;
    }

    if (uploadedFile.size > 20 * 1024 * 1024) {
      toast.error("File exceeds 20MB limit.");
      return;
    }

    try {
      const data = await parseFile(uploadedFile);
      if (data.length === 0) {
        toast.error("The file is empty.");
        return;
      }

      const headers = Object.keys(data[0]);
      setFile(uploadedFile);
      setParsedData(data);
      setFileHeaders(headers);

      // Detect official template
      const isOfficial = IMPORT_TEMPLATE_HEADERS.every(h => headers.includes(h));
      setIsOfficialTemplate(isOfficial);

      const initialMapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase().trim();
        const crmKey = (AUTO_MAP as ReturnType<typeof JSON.parse>)[lowerHeader];
        if (crmKey && !initialMapping[crmKey]) {
          initialMapping[crmKey] = header;
        }
      });
      
      if (isOfficial) {
        // Force exact mapping for official template
        IMPORT_TEMPLATE_HEADERS.forEach(h => {
          const lowerHeader = h.toLowerCase().trim();
          const crmKey = (AUTO_MAP as ReturnType<typeof JSON.parse>)[lowerHeader];
          if (crmKey) initialMapping[crmKey] = h;
        });
      }
      
      setMapping(initialMapping);
      setStep(2);
      setShowAdvancedMapping(false);
    } catch (error) {
      toast.error("Failed to parse the file.");
      console.error(error);
    }
  };

  const handleValidation = () => {
    const valid: ReturnType<typeof JSON.parse>[] = [];
    const invalid: ReturnType<typeof JSON.parse>[] = [];

    parsedData.forEach((row) => {
      const mappedRow: ReturnType<typeof JSON.parse> = {};
      let hasError = false;
      const errors: string[] = [];

      CRM_FIELDS.forEach(field => {
        const fileCol = mapping[field.key];
        const val = fileCol ? row[fileCol] : undefined;
        
        if (field.required && (!val || String(val).trim() === "")) {
          hasError = true;
          errors.push(`Missing ${field.label}`);
        }
        
        if (field.key === "email" && val) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(val))) {
            hasError = true;
            errors.push("Invalid email format");
          }
        }
        
        if (field.key === "status" && val) {
          const statusStr = String(val).trim().toUpperCase();
          if (statusStr === "NEW LEAD") {
            mappedRow[field.key] = "NEW";
          } else {
            mappedRow[field.key] = statusStr.replace(/\s+/g, '_');
          }
        } else {
          mappedRow[field.key] = val;
        }
      });

      if (hasError) {
        invalid.push({ ...row, _errors: errors.join(", ") });
      } else {
        valid.push(mappedRow);
      }
    });

    setValidationResults({ valid, invalid });
    setStep(3);
  };

  const handleImport = async () => {
    if (validationResults.valid.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }

    setImporting(true);
    setStep(4);
    
    try {
      const chunkSize = 500;
      let totalImported = 0;
      let totalSkipped = 0;
      let totalFailed = 0;
      let allFailedRows: ReturnType<typeof JSON.parse>[] = [];

      const chunks = [];
      for (let i = 0; i < validationResults.valid.length; i += chunkSize) {
        chunks.push(validationResults.valid.slice(i, i + chunkSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        const res = await axios.post("/api/crm/leads/import", {
          leads: chunks[i],
          duplicateStrategy
        });

        const data = res.data.data;
        totalImported += data.imported;
        totalSkipped += data.skipped;
        totalFailed += data.failed;
        allFailedRows = [...allFailedRows, ...data.failedRows];
        
        setProgress(Math.round(((i + 1) / chunks.length) * 100));
      }

      const frontendFailed = validationResults.invalid.map(inv => {
        const { _errors, ...rest } = inv;
        return { ...rest, ErrorReason: _errors };
      });

      setSummary({
        imported: totalImported,
        skipped: totalSkipped,
        failed: totalFailed + frontendFailed.length,
        failedRows: [...frontendFailed, ...allFailedRows]
      });

      setStep(5);
      toast.success("Import completed successfully!");
      if (onSuccess) onSuccess();
    } catch (error: ReturnType<typeof JSON.parse>) {
      toast.error(error.response?.data?.message || "Failed to import leads.");
      setImporting(false);
      setStep(3);
    }
  };

  const slideVariants: ReturnType<typeof JSON.parse> = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
  };

  const getMissingRequiredFields = () => {
    return CRM_FIELDS.filter(f => f.required && !mapping[f.key]);
  };

  const getUnmappedFields = (fields: typeof CRM_FIELDS) => {
    return fields.filter(f => !mapping[f.key]);
  };

  const renderPreviewValue = (fieldKey: string) => {
    const fileCol = mapping[fieldKey];
    if (!fileCol || !parsedData[0]) return "-";
    const val = parsedData[0][fileCol];
    return val ? String(val) : "-";
  };

  const renderPreviewCard = () => {
    const emailVal = mapping["email"] ? String(parsedData[0]?.[mapping["email"]]) : "";
    const isEmailValid = mapping["email"] && parsedData[0]?.[mapping["email"]] && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    const hasRequired = mapping["name"] && mapping["email"];
    
    return (
      <div className="bg-background p-5 rounded-xl border border-border shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center mb-1 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Record Preview</h4>
          </div>
          {hasRequired && (mapping["email"] ? isEmailValid : true) ? (
            <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 font-bold px-2.5 py-0.5">✓ Valid</Badge>
          ) : (
            <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-bold px-2.5 py-0.5">⚠ Needs Fix</Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Full Name</p>
            <p className="font-medium text-sm truncate text-foreground" title={renderPreviewValue("name")}>{renderPreviewValue("name")}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Company</p>
            <p className="font-medium text-sm truncate text-foreground" title={renderPreviewValue("company")}>{renderPreviewValue("company")}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Email</p>
            <p className="font-medium text-sm truncate text-foreground" title={renderPreviewValue("email")}>{renderPreviewValue("email")}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Phone</p>
            <p className="font-medium text-sm truncate text-foreground" title={renderPreviewValue("phone")}>{renderPreviewValue("phone")}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Status</p>
            <p className="font-medium text-sm truncate text-foreground" title={renderPreviewValue("status")}>{renderPreviewValue("status")}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Deal Value</p>
            <p className="font-medium text-sm truncate text-foreground" title={renderPreviewValue("valueAmount")}>{renderPreviewValue("valueAmount")}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <FormModal
      title="Bulk Import Leads"
      description="Import multiple leads seamlessly from CSV or Excel files."
      isOpen={isOpen}
      onOpenChange={handleClose}
      size="xl" 
    >
      <div className="flex flex-col min-h-[600px] max-h-[85vh]">
        {/* Stepper Header */}
        <div className="relative mb-10 mt-4 px-12 flex-shrink-0">
          <div className="absolute top-5 left-16 right-16 h-1 bg-muted rounded-full -z-10 -translate-y-1/2">
             <div 
               className="h-full bg-primary transition-all duration-500 ease-in-out" 
               style={{ width: `${(Math.min(step, 4) - 1) / 3 * 100}%` }}
             />
          </div>
          <div className="flex justify-between">
            {STEPS.map((s) => {
              const isCompleted = step > s.num;
              const isActive = step === s.num;
              
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                      isCompleted ? "bg-primary text-primary-foreground shadow-md" :
                      isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-110" :
                      "bg-card border-2 border-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-xs mt-3 font-semibold tracking-wide ${isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative min-h-0 px-2 pb-2">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Upload */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full items-center justify-center py-6">
                <div className="w-full max-w-2xl relative">
                  <div 
                    onClick={() => document.getElementById('file-upload')?.click()}
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
                      Support for CSV and XLSX files. Maximum file size is 20MB. Make sure your headers match our format.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center relative z-10">
                      <Button 
                        size="lg" 
                        className="rounded-xl font-semibold px-8 shadow-md"
                        onClick={(e) => { e.stopPropagation(); document.getElementById('file-upload')?.click(); }}
                      >
                        Browse Files
                      </Button>
                      <Input 
                        id="file-upload" 
                        type="file" 
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={(e) => { e.stopPropagation(); downloadSampleTemplate('csv'); }} 
                        className="rounded-xl font-semibold bg-background hover:bg-muted/50 border-border"
                      >
                        <Download className="w-4 h-4 mr-2" /> Download Template
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Map Columns */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full overflow-hidden">
                <div className="bg-muted/10 p-6 rounded-xl border border-border/50 flex flex-col h-full shadow-sm relative overflow-hidden">
                  
                  {isOfficialTemplate ? (
                    // Official Template View
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center relative z-10 border-4 border-white dark:border-background shadow-xl">
                          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold mb-3 text-foreground">Official Template Detected</h3>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-8">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                            16 of 16 columns mapped automatically
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Custom File View
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <Settings2 className="w-5 h-5 text-primary" />
                            Map Columns
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-sm text-muted-foreground">Mapped Successfully</span>
                            <Badge variant="secondary" className="px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary border-none">
                              {Object.keys(mapping).length} of {CRM_FIELDS.length}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Summary Badges */}
                        <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-full border border-border shadow-sm">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Auto Mapped
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Manual
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <div className="w-2.5 h-2.5 rounded-full bg-destructive"></div> Missing
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
                        {/* Mapping Table Area */}
                        <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                          {(() => {
                            const unmappedBasic = getUnmappedFields(CRM_FIELDS.filter(f => !f.advanced));
                            const unmappedAdvanced = getUnmappedFields(CRM_FIELDS.filter(f => f.advanced));
                            const hasMissingRequired = getMissingRequiredFields().length > 0;
                            
                            // If everything basic is mapped and we aren't showing advanced
                            if (unmappedBasic.length === 0 && !showAdvancedMapping) {
                              return (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/10">
                                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
                                    <CheckCircle2 className="w-8 h-8" />
                                  </div>
                                  <h4 className="text-lg font-bold mb-2">No Action Required</h4>
                                  <p className="text-sm text-muted-foreground max-w-xs mb-6">All primary fields have been successfully mapped.</p>
                                  {unmappedAdvanced.length > 0 && (
                                    <Button variant="outline" size="sm" onClick={() => setShowAdvancedMapping(true)} className="rounded-xl font-semibold text-xs border-border bg-background shadow-sm hover:bg-muted">
                                      Show Advanced Mapping <ChevronDown className="w-3 h-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              );
                            }

                            // Show the table
                            return (
                              <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-muted/30 sticky top-0 backdrop-blur-md z-10 border-b border-border">
                                    <tr>
                                      <th className="px-6 py-4 font-bold text-foreground w-1/3">CRM Field</th>
                                      <th className="px-6 py-4 font-bold text-foreground">File Column</th>
                                      <th className="px-6 py-4 font-bold text-foreground text-center w-16">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border/50">
                                    {hasMissingRequired && (
                                      <tr>
                                        <td colSpan={3} className="px-6 py-3 bg-destructive/5 text-destructive text-xs font-semibold border-b border-destructive/10">
                                          <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Required fields are missing. Please map them to continue.
                                          </div>
                                        </td>
                                      </tr>
                                    )}

                                    {/* Unmapped Basic Fields */}
                                    {unmappedBasic.map(field => (
                                      <tr key={field.key} className="bg-destructive/5 hover:bg-destructive/10 transition-colors">
                                        <td className="px-6 py-4">
                                          <span className="font-semibold text-foreground">{field.label}</span>
                                          {field.required && <span className="ml-1 text-destructive font-bold">*</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                          <select 
                                            className="w-full max-w-[220px] bg-background border-2 border-destructive/30 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm cursor-pointer outline-none"
                                            value={mapping[field.key] || ""}
                                            onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                          >
                                            <option value="" className="text-muted-foreground">-- Ignore Column --</option>
                                            {fileHeaders.map(h => (
                                              <option key={h} value={h}>{h}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                          <div className="w-3 h-3 rounded-full bg-destructive mx-auto shadow-sm"></div>
                                        </td>
                                      </tr>
                                    ))}

                                    {/* Advanced Mapping Section */}
                                    {showAdvancedMapping && (
                                      <>
                                        <tr>
                                          <td colSpan={3} className="px-6 py-4 bg-muted/20 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-y border-border">
                                            Optional Mappings
                                          </td>
                                        </tr>
                                        {CRM_FIELDS.filter(f => f.advanced || (mapping[f.key] && !f.advanced)).map((field) => (
                                          <tr key={field.key} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                              <span className="font-medium text-foreground">{field.label}</span>
                                              {field.required && <span className="ml-1 text-destructive font-bold">*</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                              <select 
                                                className={`w-full max-w-[220px] bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm cursor-pointer outline-none ${!mapping[field.key] ? 'border-border text-muted-foreground' : 'border-primary/30 text-foreground'}`}
                                                value={mapping[field.key] || ""}
                                                onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                              >
                                                <option value="" className="text-muted-foreground">-- Ignore Column --</option>
                                                {fileHeaders.map(h => (
                                                  <option key={h} value={h}>{h}</option>
                                                ))}
                                              </select>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                              {mapping[field.key] ? (
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto shadow-sm"></div>
                                              ) : (
                                                <div className="w-3 h-3 rounded-full bg-amber-400 mx-auto shadow-sm"></div>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </>
                                    )}

                                    {!showAdvancedMapping && (
                                      <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center border-t border-border bg-card">
                                          <Button variant="ghost" size="sm" onClick={() => setShowAdvancedMapping(true)} className="text-xs font-semibold hover:bg-muted/50 rounded-xl">
                                            Show Advanced Mapping <ChevronDown className="w-3 h-3 ml-1" />
                                          </Button>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Preview Panel Area */}
                        <div className="w-full md:w-72 flex-shrink-0 flex flex-col gap-4">
                           {renderPreviewCard()}
                           <div className="bg-muted/20 p-5 rounded-xl border border-border shadow-sm">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Import Summary</h4>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground font-medium">Records Found</span>
                                  <span className="font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">{parsedData.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground font-medium">Mapped Columns</span>
                                  <span className="font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">{Object.keys(mapping).length} / {CRM_FIELDS.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground font-medium">Required Fields</span>
                                  <span className="font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">
                                    {CRM_FIELDS.filter(f => f.required && mapping[f.key]).length} / {CRM_FIELDS.filter(f => f.required).length}
                                  </span>
                                </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between items-center flex-shrink-0 border-t border-border/50 pt-6">
                    <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl font-semibold">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      onClick={handleValidation} 
                      disabled={getMissingRequiredFields().length > 0} 
                      size="lg" 
                      className={`rounded-xl font-semibold px-8 shadow-md transition-all ${isOfficialTemplate ? 'w-full max-w-xs text-md h-12' : ''}`}
                    >
                      Continue to Validation <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Validate */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full overflow-hidden">
                <div className="bg-muted/10 p-6 rounded-xl border border-border/50 flex flex-col h-full shadow-sm">
                  <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <FileCheck2 className="w-5 h-5 text-primary" />
                        Validation Results
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Review the data before importing to prevent errors.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 flex-shrink-0">
                    <div className="p-5 rounded-xl border border-border bg-card flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 group-hover:w-2 transition-all"></div>
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 ml-3 shadow-inner">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Valid Rows</p>
                        <h4 className="text-3xl font-black text-foreground">{validationResults.valid.length}</h4>
                      </div>
                    </div>
                    
                    <div className="p-5 rounded-xl border border-border bg-card flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-destructive group-hover:w-2 transition-all"></div>
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive ml-3 shadow-inner">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Invalid Rows</p>
                        <h4 className="text-3xl font-black text-foreground">{validationResults.invalid.length}</h4>
                      </div>
                    </div>
                  </div>

                  {validationResults.invalid.length > 0 && (
                    <div className="flex-1 overflow-auto rounded-xl border border-destructive/20 bg-card mb-6 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-destructive/5 sticky top-0 border-b border-destructive/10 backdrop-blur-md">
                          <tr>
                            <th className="px-6 py-3 font-bold text-destructive text-xs uppercase tracking-wider">Error Reason</th>
                            <th className="px-6 py-3 font-bold text-foreground text-xs uppercase tracking-wider">Row Data Snippet</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {validationResults.invalid.slice(0, 50).map((row, i) => (
                            <tr key={i} className="hover:bg-destructive/5 transition-colors">
                              <td className="px-6 py-3 text-destructive font-medium text-xs w-1/3">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-3 h-3 flex-shrink-0" /> {row._errors}
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Duplicate Handling Strategy</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: "skip", label: "Skip Duplicates", desc: "Ignore records that already exist" },
                        { id: "update", label: "Update Existing", desc: "Overwrite existing records with new data" },
                        { id: "create", label: "Create Duplicate", desc: "Import anyway (not recommended)" }
                      ].map((strat) => (
                        <div 
                          key={strat.id}
                          onClick={() => setDuplicateStrategy(strat.id as ReturnType<typeof JSON.parse>)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            duplicateStrategy === strat.id 
                              ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/10" 
                              : "border-border hover:border-primary/30 bg-background hover:bg-muted/20"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${duplicateStrategy === strat.id ? "border-primary bg-primary/10" : "border-muted-foreground/30 bg-background"}`}>
                              {duplicateStrategy === strat.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                            <span className={`font-bold text-sm ${duplicateStrategy === strat.id ? "text-primary" : "text-foreground"}`}>{strat.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground ml-8 leading-relaxed font-medium">{strat.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center flex-shrink-0 border-t border-border/50 pt-6">
                    <Button variant="ghost" onClick={() => setStep(2)} className="rounded-xl font-semibold">
                      <ArrowLeft className="w-4 h-4 mr-2" /> {validationResults.invalid.length > 0 ? "Fix Mapping" : "Back"}
                    </Button>
                    <Button onClick={handleImport} disabled={validationResults.valid.length === 0} size="lg" className="rounded-xl font-bold px-8 shadow-md">
                      {validationResults.invalid.length > 0 ? "Skip Invalid & Import" : "Start Import"} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Import Progress */}
            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full items-center justify-center py-16">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 rounded-full border-[8px] border-muted opacity-30"></div>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" 
                      strokeLinecap="round"
                      className="text-primary transition-all duration-500 ease-out drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-black text-foreground">{progress}%</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground animate-pulse">Importing Data...</h3>
                <p className="text-muted-foreground font-medium text-sm text-center max-w-xs">
                  Please do not close this window while we process your records.
                </p>
              </motion.div>
            )}

            {/* Step 5: Summary */}
            {step === 5 && summary && (
              <motion.div key="step5" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full items-center justify-center py-10">
                <div className="w-full max-w-2xl bg-card rounded-xl border border-border shadow-2xl p-12 relative overflow-hidden">
                  
                  {/* Decorative Background */}
                  <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-emerald-500/10 to-transparent"></div>
                  
                  <div className="relative flex flex-col items-center z-10 text-center mb-10">
                    <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-6 border-4 border-white dark:border-background relative">
                       <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping"></div>
                       <FileCheck2 className="w-12 h-12 relative z-10" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground tracking-tight mb-3">Import Complete!</h3>
                    <p className="text-muted-foreground font-medium text-lg">Your data has been successfully processed.</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-10 relative z-10">
                    <div className="p-6 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 text-center shadow-sm">
                      <h4 className="text-4xl font-black text-emerald-600 mb-2">{summary.imported}</h4>
                      <p className="text-[11px] font-bold text-emerald-700/70 uppercase tracking-wider">Imported</p>
                    </div>
                    <div className="p-6 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 text-center shadow-sm">
                      <h4 className="text-4xl font-black text-amber-600 mb-2">{summary.skipped}</h4>
                      <p className="text-[11px] font-bold text-amber-700/70 uppercase tracking-wider">Skipped</p>
                    </div>
                    <div className="p-6 rounded-xl bg-destructive/5 border border-destructive/20 text-center shadow-sm">
                      <h4 className="text-4xl font-black text-destructive mb-2">{summary.failed}</h4>
                      <p className="text-[11px] font-bold text-destructive/70 uppercase tracking-wider">Failed</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                    {summary.failedRows.length > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => downloadFailedRows(summary.failedRows, 'csv')} 
                        className="rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10 font-bold px-6 h-12"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Failed Rows
                      </Button>
                    )}
                    <Button onClick={handleClose} size="lg" className="rounded-xl font-bold px-12 h-12 shadow-lg shadow-primary/20 w-full sm:w-auto">
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </FormModal>
  );
};
