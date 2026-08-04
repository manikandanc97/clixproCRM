"use client";

import React, { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { FormSubmitButton } from "@/shared/components/form-submit-button";
import { UnsavedWarning } from "@/shared/components/unsaved-warning";
import { useDirtyForm } from "@/shared/hooks/use-dirty-form";
import { useUpdateTask, useEmployees, useLeads, useCustomers, useQuotations } from "@/shared/hooks/use-crm";
import { useAuth } from "@/features/auth/components/auth-provider";
import { TaskType } from "@/shared/types/task";
import {
  CheckSquare,
  ListTodo,
  Plus,
  Trash2,
  Loader2,
  Paperclip,
  AlertCircle,
  FileText,
  Search,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

// ─── Schema (essential fields only) ───

const taskFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional().default(""),
  assignedToId: z.string().min(1, "Please assign this task"),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  dueDate: z.string().min(1, "Due date is required"),
  checklist: z
    .array(z.object({ id: z.string(), title: z.string().min(1), completed: z.boolean().default(false) }))
    .default([]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// ─── Constants ───

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High", dot: "bg-rose-500" },
  { value: "MEDIUM", label: "Medium", dot: "bg-amber-500" },
  { value: "LOW", label: "Low", dot: "bg-blue-500" },
] as const;

type RelationType = "lead" | "customer" | "quotation";

interface RelatedRecord {
  type: RelationType;
  id: string;
  label: string;
  sub?: string;
}

// ─── Component ───

interface EditTaskModalProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { mutate: updateTask, isPending } = useUpdateTask();
  const { data: employeesData } = useEmployees();
  const { data: leadsData } = useLeads();
  const { data: customersData } = useCustomers();
  const { data: quotationsData } = useQuotations();

  const employees  = employeesData?.employees || [];
  const leads      = leadsData?.leads || [];
  const customers  = customersData?.customers || [];
  const quotations = quotationsData?.quotations || [];

  const [activeTab, setActiveTab] = useState<"general" | "checklist">("general");
  const [checklistInput, setChecklistInput] = useState("");
  const [attachments, setAttachments] = useState<{ id: string; fileName: string; fileSize: number }[]>([]);

  // Related record state
  const [relatedRecord, setRelatedRecord] = useState<RelatedRecord | null>(null);
  const [recordSearch, setRecordSearch] = useState("");
  const [recordDropdownOpen, setRecordDropdownOpen] = useState(false);

  const [showWarning, setShowWarning] = useState(false);

  const defaultDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      assignedToId: user?.id || "",
      priority: "MEDIUM",
      dueDate: defaultDueDate,
      checklist: [],
    },
  });

  const { isDirty, resetDirty } = useDirtyForm(form, form.formState.defaultValues, {
    externalOriginalValues: {
      attachments: task?.attachments || [],
      relatedRecord: (() => {
        if (!task) return null;
        if (task.relatedLead) return { type: "lead", id: task.relatedLead.id, label: task.relatedLead.name, sub: task.relatedLead.company || "" };
        if (task.relatedCustomer) return { type: "customer", id: task.relatedCustomer.id, label: task.relatedCustomer.name, sub: task.relatedCustomer.company || "" };
        if (task.relatedQuotation) return { type: "quotation", id: task.relatedQuotation.id, label: `#${task.relatedQuotation.quoteNumber}`, sub: (task.relatedQuotation as any).client };
        return null;
      })()
    },
    externalValues: { attachments, relatedRecord }
  });

  React.useEffect(() => {
    if (task && isOpen) {
      let formattedDueDate = defaultDueDate;
      if (task.dueDate) {
        const parsedDate = new Date(task.dueDate);
        if (!isNaN(parsedDate.getTime())) {
          formattedDueDate = parsedDate.toISOString().slice(0, 16);
        }
      }

      form.reset({
        title: task.title,
        description: task.description || "",
        assignedToId: task.assignedTo?.id || user?.id || "",
        priority: task.priority as any,
        dueDate: formattedDueDate,
        checklist: task.checklist || [],
      });
      setAttachments(task.attachments || []);
      
      if (task.relatedLead) {
        setRelatedRecord({ type: "lead", id: task.relatedLead.id, label: task.relatedLead.name, sub: task.relatedLead.company || "" });
      } else if (task.relatedCustomer) {
        setRelatedRecord({ type: "customer", id: task.relatedCustomer.id, label: task.relatedCustomer.name, sub: task.relatedCustomer.company || "" });
      } else if (task.relatedQuotation) {
        setRelatedRecord({ type: "quotation", id: task.relatedQuotation.id, label: `#${task.relatedQuotation.quoteNumber}`, sub: (task.relatedQuotation as any).client });
      } else {
        setRelatedRecord(null);
      }
    }
  }, [task, isOpen, user?.id, form, defaultDueDate]);

  const { fields: checklistFields, append: appendChecklist, remove: removeChecklist } = useFieldArray({
    control: form.control,
    name: "checklist",
  });

  // ─── Related Record search results ───

  const recordResults = useMemo(() => {
    const q = recordSearch.toLowerCase().trim();
    const results: RelatedRecord[] = [];

    leads.forEach((l: any) => {
      if (!q || l.name?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q)) {
        results.push({ type: "lead", id: l.id, label: l.name, sub: l.company });
      }
    });
    customers.forEach((c: any) => {
      if (!q || c.name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q)) {
        results.push({ type: "customer", id: c.id, label: c.name, sub: c.company });
      }
    });
    quotations.forEach((qt: any) => {
      if (!q || qt.quoteNumber?.toLowerCase().includes(q) || qt.client?.toLowerCase().includes(q)) {
        results.push({ type: "quotation", id: qt.id, label: `#${qt.quoteNumber}`, sub: qt.client });
      }
    });

    return results.slice(0, 8);
  }, [recordSearch, leads, customers, quotations]);

  // ─── Handlers ───

  const handleAddChecklist = () => {
    const v = checklistInput.trim();
    if (v) {
      appendChecklist({ id: `c-${Date.now()}`, title: v, completed: false });
      setChecklistInput("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const next = Array.from(files).map((f) => ({
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fileName: f.name,
      fileSize: f.size,
    }));
    setAttachments((prev) => [...prev, ...next]);
  };

  const resetForm = () => {
    form.reset();
    setRelatedRecord(null);
    setRecordSearch("");
    setAttachments([]);
    setChecklistInput("");
    setActiveTab("general");
  };

  const onSubmit = (data: TaskFormValues) => {
    if (!task) return;
    const payload: any = {
      title: data.title,
      description: data.description || null,
      assignedToId: data.assignedToId,
      priority: data.priority,
      dueDate: new Date(data.dueDate).toISOString(),
      checklist: data.checklist,
      attachments,
      relatedLeadId: relatedRecord?.type === "lead" ? relatedRecord.id : null,
      relatedCustomerId: relatedRecord?.type === "customer" ? relatedRecord.id : null,
      relatedQuotationId: relatedRecord?.type === "quotation" ? relatedRecord.id : null,
    };

    updateTask(
      { id: task.id, data: payload },
      {
        onSuccess: () => {
          resetDirty();
          onSuccess?.();
          resetForm();
          onClose();
        },
      }
    );
  };

  const watchedDueDate = form.watch("dueDate");
  const isPastDue = watchedDueDate ? new Date(watchedDueDate) < new Date() : false;
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  const RECORD_TYPE_LABELS: Record<RelationType, { label: string; color: string }> = {
    lead: { label: "Lead", color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/10" },
    customer: { label: "Customer", color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" },
    quotation: { label: "Quote", color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10" },
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isDirty) {
      setShowWarning(true);
      return;
    }
    if (!open) {
      resetForm();
      onClose();
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-background border border-border shadow-2xl rounded-xl overflow-hidden p-0 flex flex-col max-h-[90vh]">
        {/* ── HEADER ── */}
        <div className="px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm shrink-0">
                <CheckSquare className="size-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Edit Task
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  Update the task details below.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            {/* ── TAB BAR ── */}
            <div className="flex border-b border-border bg-background px-6 shrink-0">
              {([
                { key: "general" as const, label: "General", icon: FileText },
                { key: "checklist" as const, label: "Checklist", icon: ListTodo },
              ]).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-colors",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                    {tab.key === "checklist" && checklistFields.length > 0 && (
                      <span className="ml-1 text-[9px] font-bold bg-primary/10 text-primary rounded-full size-4 inline-flex items-center justify-center">
                        {checklistFields.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── BODY ── */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* ===== GENERAL TAB ===== */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                          Task Title <span className="text-destructive">*</span>
                        </Label>
                        <FormControl>
                          <Input
                            placeholder="e.g. Follow up with Acme Corp"
                            className="h-10 text-sm font-medium"
                            autoFocus
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                          Description
                        </Label>
                        <FormControl>
                          <Textarea
                            placeholder="Brief notes or context..."
                            className="resize-none min-h-[72px] text-sm"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Assign To + Priority — side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="assignedToId"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Assign To <span className="text-destructive">*</span>
                          </Label>
                          <FormControl>
                            <select
                              {...field}
                              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="">Select...</option>
                              {employees.map((emp: any) => (
                                <option key={emp.id} value={emp.id || emp.userId}>
                                  {emp.name}
                                </option>
                              ))}
                              {employees.length === 0 && user?.id && (
                                <option value={user.id}>{user.name || "Me"}</option>
                              )}
                            </select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Priority
                          </Label>
                          <FormControl>
                            <select
                              {...field}
                              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              {PRIORITY_OPTIONS.map((p) => (
                                <option key={p.value} value={p.value}>
                                  {p.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Due Date */}
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                          Due Date <span className="text-destructive">*</span>
                        </Label>
                        <FormControl>
                          <Input type="datetime-local" className="h-10 text-sm" {...field} />
                        </FormControl>
                        {isPastDue && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
                            <AlertCircle className="size-3" />
                            This date is in the past
                          </p>
                        )}
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Related Record — single searchable selector */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Related Record
                    </Label>

                    {relatedRecord ? (
                      <div className="h-10 rounded-lg border border-border bg-muted/10 px-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                            RECORD_TYPE_LABELS[relatedRecord.type].color
                          )}>
                            {RECORD_TYPE_LABELS[relatedRecord.type].label}
                          </span>
                          <span className="text-sm font-medium text-foreground truncate">
                            {relatedRecord.label}
                          </span>
                          {relatedRecord.sub && (
                            <span className="text-xs text-muted-foreground truncate">
                              — {relatedRecord.sub}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setRelatedRecord(null)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                          <Input
                            placeholder="Search leads, customers, quotes..."
                            value={recordSearch}
                            onChange={(e) => { setRecordSearch(e.target.value); setRecordDropdownOpen(true); }}
                            onFocus={() => setRecordDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setRecordDropdownOpen(false), 200)}
                            className="h-10 pl-9 text-sm"
                          />
                        </div>

                        {recordDropdownOpen && recordResults.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
                            {recordResults.map((r) => (
                              <button
                                key={`${r.type}-${r.id}`}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setRelatedRecord(r);
                                  setRecordSearch("");
                                  setRecordDropdownOpen(false);
                                }}
                                className="w-full px-3 py-2.5 text-left hover:bg-muted/60 flex items-center gap-2 transition-colors first:rounded-t-lg last:rounded-b-lg"
                              >
                                <span className={cn(
                                  "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0",
                                  RECORD_TYPE_LABELS[r.type].color
                                )}>
                                  {RECORD_TYPE_LABELS[r.type].label}
                                </span>
                                <span className="text-sm font-medium text-foreground truncate">{r.label}</span>
                                {r.sub && (
                                  <span className="text-xs text-muted-foreground truncate ml-auto">{r.sub}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {recordDropdownOpen && recordSearch.trim() && recordResults.length === 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg px-3 py-4 text-center">
                            <p className="text-xs text-muted-foreground">No records found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== CHECKLIST TAB ===== */}
              {activeTab === "checklist" && (
                <div className="space-y-5">
                  {/* Subtask Checklist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Subtasks
                      </Label>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {checklistFields.length} {checklistFields.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a subtask..."
                        value={checklistInput}
                        onChange={(e) => setChecklistInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddChecklist(); } }}
                        className="h-9 text-sm flex-1"
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddChecklist}
                        className="h-9 px-3 text-xs font-bold"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {checklistFields.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between h-9 px-3 rounded-lg border border-border bg-muted/10 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeChecklist(idx)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                      {checklistFields.length === 0 && (
                        <p className="text-[11px] text-muted-foreground italic text-center py-6">
                          No subtasks yet — add one above
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Paperclip className="size-3" /> Attachments
                    </Label>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-9 border-dashed text-xs text-muted-foreground gap-2 font-semibold"
                      onClick={() => document.getElementById("task-file-input")?.click()}
                    >
                      <Paperclip className="size-3.5" /> Attach Files
                    </Button>
                    <input
                      id="task-file-input"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {attachments.length > 0 && (
                      <div className="space-y-1.5">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between h-9 px-3 rounded-lg border border-border bg-muted/10 group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium text-foreground truncate">{att.fileName}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {Math.round(att.fileSize / 1024)} KB
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div className="shrink-0 px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
              <div>
                {hasErrors && (
                  <p className="text-xs text-destructive font-semibold flex items-center gap-1">
                    <AlertCircle className="size-3.5" />
                    Check required fields
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <FormSubmitButton
                  isDirty={isDirty}
                  isPending={isPending}
                  className="h-10 px-5 gap-2 font-semibold shadow-sm w-full sm:w-auto"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                  Save Changes
                </FormSubmitButton>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    <UnsavedWarning 
      open={showWarning} 
      onOpenChange={setShowWarning} 
      onConfirm={() => { setShowWarning(false); resetForm(); onClose(); }} 
      onCancel={() => setShowWarning(false)} 
    />
    </>
  );
};
