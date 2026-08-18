"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Settings2,
  ChevronDown,
  AlertTriangle,
  FileText,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { CRM_FIELDS, CRMField, slideVariants } from "./import-types";

interface ImportMappingStepProps {
  isOfficialTemplate: boolean;
  fileHeaders: string[];
  mapping: Record<string, string>;
  setMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  parsedData: any[];
  showAdvancedMapping: boolean;
  setShowAdvancedMapping: React.Dispatch<React.SetStateAction<boolean>>;
  onBack: () => void;
  onContinue: () => void;
}

export function ImportMappingStep({
  isOfficialTemplate,
  fileHeaders,
  mapping,
  setMapping,
  parsedData,
  showAdvancedMapping,
  setShowAdvancedMapping,
  onBack,
  onContinue,
}: ImportMappingStepProps) {
  const getMissingRequiredFields = () => {
    return CRM_FIELDS.filter((f) => f.required && !mapping[f.key]);
  };

  const getUnmappedFields = (fields: CRMField[]) => {
    return fields.filter((f) => !mapping[f.key]);
  };

  const renderPreviewValue = (fieldKey: string) => {
    const fileCol = mapping[fieldKey];
    if (!fileCol || !parsedData[0]) return "-";
    const val = parsedData[0][fileCol];
    return val ? String(val) : "-";
  };

  const renderPreviewCard = () => {
    const emailVal = mapping["email"]
      ? String(parsedData[0]?.[mapping["email"]])
      : "";
    const isEmailValid =
      mapping["email"] &&
      parsedData[0]?.[mapping["email"]] &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    const hasRequired = mapping["name"] && mapping["email"];

    return (
      <div className="bg-background p-5 rounded-xl border border-border shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center mb-1 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Record Preview
            </h4>
          </div>
          {hasRequired && (mapping["email"] ? isEmailValid : true) ? (
            <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 font-bold px-2.5 py-0.5">
              ✓ Valid
            </Badge>
          ) : (
            <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-bold px-2.5 py-0.5">
              ⚠ Needs Fix
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Full Name
            </p>
            <p
              className="font-medium text-sm truncate text-foreground"
              title={renderPreviewValue("name")}
            >
              {renderPreviewValue("name")}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Company
            </p>
            <p
              className="font-medium text-sm truncate text-foreground"
              title={renderPreviewValue("company")}
            >
              {renderPreviewValue("company")}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Email
            </p>
            <p
              className="font-medium text-sm truncate text-foreground"
              title={renderPreviewValue("email")}
            >
              {renderPreviewValue("email")}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Phone
            </p>
            <p
              className="font-medium text-sm truncate text-foreground"
              title={renderPreviewValue("phone")}
            >
              {renderPreviewValue("phone")}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Status
            </p>
            <p
              className="font-medium text-sm truncate text-foreground"
              title={renderPreviewValue("status")}
            >
              {renderPreviewValue("status")}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Deal Value
            </p>
            <p
              className="font-medium text-sm truncate text-foreground"
              title={renderPreviewValue("valueAmount")}
            >
              {renderPreviewValue("valueAmount")}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      key="step2"
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col h-full overflow-hidden"
    >
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
              <h3 className="text-3xl font-bold mb-3 text-foreground">
                Official Template Detected
              </h3>
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
                  <span className="text-sm text-muted-foreground">
                    Mapped Successfully
                  </span>
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary border-none"
                  >
                    {Object.keys(mapping).length} of {CRM_FIELDS.length}
                  </Badge>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-full border border-border shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>{" "}
                  Auto Mapped
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>{" "}
                  Manual
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive"></div>{" "}
                  Missing
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
              {/* Mapping Table Area */}
              <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {(() => {
                  const unmappedBasic = getUnmappedFields(
                    CRM_FIELDS.filter((f) => !f.advanced),
                  );
                  const unmappedAdvanced = getUnmappedFields(
                    CRM_FIELDS.filter((f) => f.advanced),
                  );
                  const hasMissingRequired =
                    getMissingRequiredFields().length > 0;

                  // If everything basic is mapped and we aren't showing advanced
                  if (unmappedBasic.length === 0 && !showAdvancedMapping) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/10">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold mb-2">
                          No Action Required
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-xs mb-6">
                          All primary fields have been successfully mapped.
                        </p>
                        {unmappedAdvanced.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAdvancedMapping(true)}
                            className="rounded-xl font-semibold text-xs border-border bg-background shadow-sm hover:bg-muted"
                          >
                            Show Advanced Mapping{" "}
                            <ChevronDown className="w-3 h-3 ml-1" />
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
                            <th className="px-6 py-4 font-bold text-foreground w-1/3">
                              CRM Field
                            </th>
                            <th className="px-6 py-4 font-bold text-foreground">
                              File Column
                            </th>
                            <th className="px-6 py-4 font-bold text-foreground text-center w-16">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {hasMissingRequired && (
                            <tr>
                              <td
                                colSpan={3}
                                className="px-6 py-3 bg-destructive/5 text-destructive text-xs font-semibold border-b border-destructive/10"
                              >
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> Required
                                  fields are missing. Please map them to
                                  continue.
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Unmapped Basic Fields */}
                          {unmappedBasic.map((field) => (
                            <tr
                              key={field.key}
                              className="bg-destructive/5 hover:bg-destructive/10 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="font-semibold text-foreground">
                                  {field.label}
                                </span>
                                {field.required && (
                                  <span className="ml-1 text-destructive font-bold">
                                    *
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  className="w-full max-w-[220px] bg-background border-2 border-destructive/30 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm cursor-pointer outline-none"
                                  value={mapping[field.key] || ""}
                                  onChange={(e) =>
                                    setMapping({
                                      ...mapping,
                                      [field.key]: e.target.value,
                                    })
                                  }
                                >
                                  <option
                                    value=""
                                    className="text-muted-foreground"
                                  >
                                    -- Ignore Column --
                                  </option>
                                  {fileHeaders.map((h) => (
                                    <option key={h} value={h}>
                                      {h}
                                    </option>
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
                                <td
                                  colSpan={3}
                                  className="px-6 py-4 bg-muted/20 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-y border-border"
                                >
                                  Optional Mappings
                                </td>
                              </tr>
                              {CRM_FIELDS.filter(
                                (f) =>
                                  f.advanced || (mapping[f.key] && !f.advanced),
                              ).map((field) => (
                                <tr
                                  key={field.key}
                                  className="hover:bg-muted/10 transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <span className="font-medium text-foreground">
                                      {field.label}
                                    </span>
                                    {field.required && (
                                      <span className="ml-1 text-destructive font-bold">
                                        *
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <select
                                      className={`w-full max-w-[220px] bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm cursor-pointer outline-none ${!mapping[field.key] ? "border-border text-muted-foreground" : "border-primary/30 text-foreground"}`}
                                      value={mapping[field.key] || ""}
                                      onChange={(e) =>
                                        setMapping({
                                          ...mapping,
                                          [field.key]: e.target.value,
                                        })
                                      }
                                    >
                                      <option
                                        value=""
                                        className="text-muted-foreground"
                                      >
                                        -- Ignore Column --
                                      </option>
                                      {fileHeaders.map((h) => (
                                        <option key={h} value={h}>
                                          {h}
                                        </option>
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
                              <td
                                colSpan={3}
                                className="px-6 py-4 text-center border-t border-border bg-card"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowAdvancedMapping(true)}
                                  className="text-xs font-semibold hover:bg-muted/50 rounded-xl"
                                >
                                  Show Advanced Mapping{" "}
                                  <ChevronDown className="w-3 h-3 ml-1" />
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Import Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        Records Found
                      </span>
                      <span className="font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">
                        {parsedData.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        Mapped Columns
                      </span>
                      <span className="font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">
                        {Object.keys(mapping).length} / {CRM_FIELDS.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        Required Fields
                      </span>
                      <span className="font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">
                        {
                          CRM_FIELDS.filter(
                            (f) => f.required && mapping[f.key],
                          ).length
                        }{" "}
                        / {CRM_FIELDS.filter((f) => f.required).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between items-center flex-shrink-0 border-t border-border/50 pt-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="rounded-xl font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button
            onClick={onContinue}
            disabled={getMissingRequiredFields().length > 0}
            size="lg"
            className={`rounded-xl font-semibold px-8 shadow-md transition-all ${isOfficialTemplate ? "w-full max-w-xs text-md h-12" : ""}`}
          >
            Continue to Validation <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
