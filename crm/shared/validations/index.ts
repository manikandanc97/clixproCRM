import * as z from "zod";

// CRM Entity Schemas
export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  status: z.enum(["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"]),
  value: z.string().optional(),
  followUpAt: z.union([z.string(), z.date()]).optional(), // Handle both string from JSON and Date from React DatePicker
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
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .optional()
    .or(z.literal("")),
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
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .optional()
    .or(z.literal("")),
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
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
}).strict();

export const pipelineSchema = z.object({
  title: z.string().optional(),
  color: z.string().optional(),
  order: z.number().optional(),
}).strict();
