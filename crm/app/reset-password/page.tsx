"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/features/auth/components/auth-layout";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import PublicRoute from "@/features/auth/components/public-route";
import { resetPassword } from "@/shared/lib/api/auth";
import { getApiErrorMessage } from "@/shared/lib/api/error";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword({ token, newPassword });
      toast.success(response.message || "Password has been successfully reset.");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>

        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          className="rounded-xl h-11"
          required
          disabled={loading}
        />
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>

        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
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
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <PublicRoute>
      <AuthLayout
        title="Reset Password 🔥"
        subtitle="Create a new secure password for your account"
        footerText="Back to"
        footerLink="/login"
        footerLinkText="Login"
      >
        <Suspense fallback={<div className="flex justify-center p-4">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </AuthLayout>
    </PublicRoute>
  );
}
