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
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
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

export const taskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  dueDate: z.union([z.string(), z.date()]).optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
}).strict();

export const quoteSchema = z.object({
  client: z.string().min(2, "Client name is required"),
  amount: z.string().min(1, "Amount is required"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]),
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

