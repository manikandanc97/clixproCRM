"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

import AuthLayout from "@/features/auth/components/auth-layout";
import { registerUser } from "@/shared/lib/api/auth";
import { parseApiErrors } from "@/shared/lib/api/error";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PublicRoute from "@/features/auth/components/public-route";

export default function RegisterPage() {
  const router = useRouter();
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
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    if (generalError) setGeneralError(null);
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
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 rounded-xl w-full h-11 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
}
