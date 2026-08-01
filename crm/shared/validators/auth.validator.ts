import { z } from "zod";

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

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().superRefine(passwordRefinement),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().superRefine(passwordRefinement),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
