/**
 * Login Page Component
 *
 * Handles user authentication with both regular login form and demo account access.
 * Uses the same auth flow for both regular and demo logins.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

import AuthLayout from "@/features/auth/components/auth-layout";
import { parseApiErrors } from "@/shared/lib/api/error";
import { signInWithGoogle } from "@/shared/lib/api/auth";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PublicRoute from "@/features/auth/components/public-route";
import { useAuth } from "@/features/auth/components/auth-provider";

export default function LoginPage() {
   
  const _router = useRouter();
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
    if (generalError) setGeneralError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
    if (generalError) setGeneralError(null);
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || "Unable to sign in with Google.");
      setGoogleLoading(false);
    }
  };

  /**
   * Handles regular user login
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setFieldErrors({});
      setGeneralError(null);
      await login(email, password, staySignedIn);
      toast.success("Login successful");
      // Redirect is handled by PublicRoute once auth state is confirmed.
    } catch (error: unknown) {
      const { fieldErrors, generalError } = parseApiErrors(error, "Login failed");
      setFieldErrors(fieldErrors);
      setGeneralError(generalError);

      setTimeout(() => {
        const firstErrorField = Object.keys(fieldErrors)[0];
        if (firstErrorField) {
          const el = document.getElementById(firstErrorField);
          if (el) el.focus();
        }
      }, 0);
    } finally {
      setLoading(false);
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
              data-testid="email-input"
              type="email"
              placeholder="name@company.com"
              className={`rounded-xl h-11 ${fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              value={email}
              onChange={handleEmailChange}
              required
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
            )}
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
                data-testid="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`rounded-xl h-11 pr-10 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                value={password}
                onChange={handlePasswordChange}
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
            {fieldErrors.password && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
            )}
            {generalError && !fieldErrors.password && (
              <p className="text-sm text-red-500 mt-1">{generalError}</p>
            )}
          </div>

          {/* Remember */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={staySignedIn}
              onCheckedChange={(checked) => setStaySignedIn(checked === true)}
              disabled={loading}
            />
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
            data-testid="login-btn"
            disabled={loading || googleLoading}
            className="bg-emerald-700 hover:bg-emerald-800 rounded-xl w-full h-11 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading || googleLoading}
            onClick={handleGoogleLogin}
            className="w-full rounded-xl h-11 flex items-center justify-center gap-2 border-gray-300"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.73 18.24 13.47 18.66 12 18.66C9.16 18.66 6.75 16.74 5.88 14.18H2.21V17.03C4.01 20.61 7.7 23 12 23Z" fill="#34A853" />
                <path d="M5.88 14.18C5.66 13.52 5.53 12.78 5.53 12C5.53 11.22 5.66 10.48 5.88 9.82V6.97H2.21C1.46 8.46 1 10.18 1 12C1 13.82 1.46 15.54 2.21 17.03L5.88 14.18Z" fill="#FBBC05" />
                <path d="M12 5.34C13.62 5.34 15.06 5.89 16.2 6.98L19.36 3.82C17.45 2.03 14.96 1 12 1C7.7 1 4.01 3.39 2.21 6.97L5.88 9.82C6.75 7.26 9.16 5.34 12 5.34Z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
}
