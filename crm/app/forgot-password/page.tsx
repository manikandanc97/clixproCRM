"use client";

import AuthLayout from "@/features/auth/components/auth-layout";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password 🔐"
      subtitle="Enter your email to receive reset instructions"
      footerText="Remember your password?"
      footerLink="/login"
      footerLinkText="Back to Login"
    >
      <form className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>

          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            className="rounded-xl h-11"
          />
        </div>

        {/* Submit */}
        <Button className="bg-emerald-700 hover:bg-emerald-800 rounded-xl w-full h-11">
          Send Reset Link
        </Button>
      </form>
    </AuthLayout>
  );
}












