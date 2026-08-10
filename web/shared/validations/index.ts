import * as z from "zod";

const passwordRefinement = (val: string, ctx: z.RefinementCtx) => {
  const missing = [];
  if (val.length < 8) missing.push("at least 8 characters");
  if (!/[A-Z]/.test(val)) missing.push("an uppercase letter");
  if (!/[a-z]/.test(val)) missing.push("a lowercase letter");
  if (!/[0-9]/.test(val)) missing.push("a number");
  if (!/[^A-Za-z0-9]/.test(val)) missing.push("a special character");

  if (missing.length > 0) {
    let msg = "Missing: ";
    if (missing.length === 1) msg += missing[0];
    else if (missing.length === 2) msg += missing[0] + " and " + missing[1];
    else {
      const last = missing.pop();
      msg += missing.join(", ") + ", and " + last;
    }
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
  }
};

// CRM Entity Schemas
export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  source: z.string().optional(),
  stage: z.enum(["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  value: z.union([z.string(), z.number()]).optional(),
  expectedCloseDate: z.union([z.string(), z.date()]).optional(),
  tags: z.array(z.string()).optional(),
  assignedToId: z.string().optional(),
  // Won/Lost outcome fields
  wonReason: z.string().optional(),
  wonDate: z.union([z.string(), z.date()]).optional(),
  actualRevenue: z.union([z.string(), z.number()]).optional(),
  lostReason: z.string().optional(),
  competitor: z.string().optional(),
  notes: z.string().optional(),
}).strict();


export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "PREMIUM", "INACTIVE"]),
  revenue: z.string().optional(),
}).strict();

export const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional().or(z.literal("")).superRefine((val, ctx) => {
    if (val) passwordRefinement(val, ctx);
  }),
  role: z.enum(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(), // Employee API might take status
}).strict();

export const checklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  completedAt: z.string().optional().nullable(),
});

export const attachmentItemSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  createdAt: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(2, "Task Title must be at least 2 characters"),
  description: z.string().optional().nullable(),
  dueDate: z.union([z.string(), z.date()]).refine((val) => Boolean(val), { message: "Due date is required" }),
  assignedToId: z.string().min(1, "Assignee is required"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED", "OVERDUE"]).default("PENDING"),
  reminderDate: z.union([z.string(), z.date(), z.null()]).optional(),
  createdById: z.string().optional().nullable(),
  relatedLeadId: z.string().optional().nullable(),
  relatedCustomerId: z.string().optional().nullable(),
  relatedMeetingId: z.string().optional().nullable(),
  relatedQuotationId: z.string().optional().nullable(),
  relatedDealId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  checklist: z.array(checklistItemSchema).optional(),
  attachments: z.array(attachmentItemSchema).optional(),
  completedAt: z.union([z.string(), z.date(), z.null()]).optional(),
}).strict();

export const quoteSchema = z.object({
  leadId: z.string().min(1, "Deal is required"),
  client: z.string().min(2, "Client name is required"),
  amount: z.union([z.string(), z.number()]).optional(),
  discount: z.number().optional(),
  tax: z.number().optional(),
  items: z.array(z.any()).optional(),
  notes: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"]),
  validTill: z.union([z.string(), z.date()]).optional(),
}).strict();

// User & Auth Schemas
export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  displayName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().optional().or(z.literal("")).superRefine((val, ctx) => {
    if (val) passwordRefinement(val, ctx);
  }),
  role: z.enum(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
}).strict();

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
}).strict();

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().superRefine(passwordRefinement),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().superRefine(passwordRefinement),
}).strict();

export const pipelineSchema = z.object({
  title: z.string().optional(),
  color: z.string().optional(),
  order: z.number().optional(),
}).strict();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(1000).catch(1000),
});

export const scheduleMeetingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.date(),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
  leadId: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  quotationId: z.string().optional().nullable(),
  taskId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
}).refine(data => data.leadId || data.customerId || data.quotationId || data.dealId, {
  message: "Meeting must be linked to a Lead, Customer, or Deal",
  path: ["leadId"]
});

export const logMeetingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.date(),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute").optional().default(30),
  leadId: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  quotationId: z.string().optional().nullable(),
  taskId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
}).refine(data => data.leadId || data.customerId || data.quotationId || data.dealId, {
  message: "Meeting must be linked to a Lead, Customer, or Deal",
  path: ["leadId"]
});


