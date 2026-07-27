"use client";

import { useState } from "react";
import AuthLayout from "@/features/auth/components/auth-layout";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import PublicRoute from "@/features/auth/components/public-route";
import { forgotPassword } from "@/shared/lib/api/auth";
import { getApiErrorMessage } from "@/shared/lib/api/error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email });
      // The API is designed to always return a generic success message
      toast.success(response.message || "If an account with that email exists, we have sent a password reset link.");
      setEmail("");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to send reset link"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <AuthLayout
        title="Forgot Password 🔐"
        subtitle="Enter your email to receive reset instructions"
        footerText="Remember your password?"
        footerLink="/login"
        footerLinkText="Back to Login"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="rounded-xl h-11"
              required
              disabled={loading}
            />
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 rounded-xl w-full h-11"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
}












