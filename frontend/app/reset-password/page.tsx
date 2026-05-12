"use client";

import AuthLayout from "@/features/auth/components/auth-layout";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password 🔥"
      subtitle="Create a new secure password for your account"
      footerText="Back to"
      footerLink="/login"
      footerLinkText="Login"
    >
      <form className="space-y-5">
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>

          <Input
            id="newPassword"
            type="password"
            placeholder="Enter new password"
            className="rounded-xl h-11"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>

          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            className="rounded-xl h-11"
          />
        </div>

        {/* Submit */}
        <Button className="bg-emerald-700 hover:bg-emerald-800 rounded-xl w-full h-11">
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
}












