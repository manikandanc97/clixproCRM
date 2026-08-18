"use client";

import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

import AuthLayout from "@/features/auth/components/auth-layout";
import { registerUser, signInWithGoogle, fetchCurrentUser } from "@/shared/lib/api/auth";
import { parseApiErrors } from "@/shared/lib/api/error";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PublicRoute from "@/features/auth/components/public-route";
import { useAuth } from "@/features/auth/components/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  // Form state
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Listen for popup auth messages
  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "CLIXPROCRM_GOOGLE_AUTH_SUCCESS") {
        setGoogleLoading(true);
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("has_session", "1");
          }
          await refreshUser();
          const user = await fetchCurrentUser();
          if (user) {
            router.push("/dashboard");
          } else {
            router.push("/login");
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          if (err?.message === "NEEDS_ONBOARDING") {
            router.push("/onboarding");
          } else {
            toast.error("Authentication failed. Please try again.");
          }
        } finally {
          setGoogleLoading(false);
        }
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => {
      window.removeEventListener("message", handleAuthMessage);
    };
  }, [refreshUser, router]);

  // Reset loading states on back navigation (bfcache), tab focus, or visibility change
  useEffect(() => {
    const handleResetLoading = () => {
      setGoogleLoading(false);
      setLoading(false);
    };

    window.addEventListener("pageshow", handleResetLoading);
    window.addEventListener("focus", handleResetLoading);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setGoogleLoading(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handleResetLoading);
      window.removeEventListener("focus", handleResetLoading);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    if (generalError) setGeneralError(null);
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const result = await signInWithGoogle();
      if (result?.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("has_session", "1");
        }
        await refreshUser();
        try {
          const user = await fetchCurrentUser();
          if (user) {
            router.push("/dashboard");
          } else {
            router.push("/login");
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          if (err?.message === "NEEDS_ONBOARDING") {
            router.push("/onboarding");
          } else {
            throw err;
          }
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.message === "Google sign-in was cancelled.") {
        toast.info("Google sign-in was cancelled.");
      } else {
        toast.error(error.message || "Unable to sign in with Google.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    // Password match check
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      setTimeout(() => document.getElementById("confirmPassword")?.focus(), 0);
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name,
        companyName,
        email,
        password,
      });

      console.log(response);

      toast.success("Account created successfully 🚀");
      router.push("/login");
    } catch (error: unknown) {
      console.log(error);

      const { fieldErrors, generalError } = parseApiErrors(error, "Registration failed");
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
        title="Create Account 🚀"
        subtitle="Start managing your business smarter"
        footerText="Already have an account?"
        footerLink="/login"
        footerLinkText="Login here"
      >
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>

            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className={`rounded-xl h-11 ${fieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
            />
            {fieldErrors.name && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>

            <Input
              id="companyName"
              type="text"
              placeholder="Enter your company name"
              className={`rounded-xl h-11 ${fieldErrors.companyName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              value={companyName}
              onChange={(e) => { setCompanyName(e.target.value); clearFieldError("companyName"); }}
            />
            {fieldErrors.companyName && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.companyName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>

            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className={`rounded-xl h-11 ${fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                className={`rounded-xl h-11 pr-10 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
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
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className={`rounded-xl h-11 pr-10 ${fieldErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
            )}
            {generalError && !fieldErrors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{generalError}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="bg-emerald-700 hover:bg-emerald-800 rounded-xl w-full h-11 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating Account..." : "Create Account"}
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
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </Button>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
}
