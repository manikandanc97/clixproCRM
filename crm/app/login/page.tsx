/**
 * Login Page Component
 *
 * Handles user authentication with both regular login form and demo account access.
 * Uses the same auth flow for both regular and demo logins.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import AuthLayout from "@/features/auth/components/auth-layout";
// DemoAccountsSection import removed
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
  const [showPassword, setShowPassword] = useState(false);
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
      toast.error(getApiErrorMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  // Demo login removed

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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="rounded-xl h-11 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
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

        {/* Demo section removed */}
      </AuthLayout>
    </PublicRoute>
  );
}












