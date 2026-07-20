"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import AuthLayout from "@/features/auth/components/auth-layout";
import { registerUser } from "@/shared/lib/api/auth";
import { getApiErrorMessage } from "@/shared/lib/api/error";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password match check
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name,
        email,
        password,
      });

      console.log(response);

      toast.success("Account created successfully 🚀");
      router.push("/login");
    } catch (error: unknown) {
      console.log(error);

      toast.error(getApiErrorMessage(error, "Registration failed"));
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
              className="rounded-xl h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                className="rounded-xl h-11 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="rounded-xl h-11 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 rounded-xl w-full h-11"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
}
