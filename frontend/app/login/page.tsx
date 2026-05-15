/**
 * Login Page Component
 *
 * Handles user authentication with both regular login form and demo account access.
 * Uses the same auth flow for both regular and demo logins.
 */
"use client";

import { useState } from "react";
import Link from "next/link";

import AuthLayout from "@/features/auth/components/auth-layout";
import DemoAccountsSection from "@/features/auth/components/demo-accounts-section";
import { getApiErrorMessage } from "@/shared/lib/api/error";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PublicRoute from "@/features/auth/components/public-route";
import { useAuth } from "@/features/auth/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles regular user login
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(email, password);
      toast.success("Login successful");
      // Redirect is handled by PublicRoute once auth state is confirmed.
    } catch (error: unknown) {
      console.error("Login failed:", error);
      toast.error(getApiErrorMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles demo account login
   * Uses the same login function as regular login
   */
  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    try {
      await login(demoEmail, demoPassword);
      // Redirect is handled by PublicRoute once auth state is confirmed.
    } catch (error: unknown) {
      console.error("Demo login failed:", error);
      throw error; // Re-throw to let DemoAccountsSection handle the toast
    }
  };

  return (
    <PublicRoute>
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to continue to your dashboard"
        footerText="Don't have an account?"
        footerLink="/register"
        footerLinkText="Create Account"
      >
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="rounded-xl h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-emerald-700 text-sm hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="rounded-xl h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Remember */}
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label
              htmlFor="remember"
              className="font-normal text-muted-foreground text-sm"
            >
              Stay signed in
            </Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 rounded-xl w-full h-11"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <DemoAccountsSection onDemoLogin={handleDemoLogin} />
      </AuthLayout>
    </PublicRoute>
  );
}












