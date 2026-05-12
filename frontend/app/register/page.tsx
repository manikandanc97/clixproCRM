"use client";

import { useState } from "react";

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

            <Input
              id="password"
              type="password"
              placeholder="Create password"
              className="rounded-xl h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>

            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className="rounded-xl h-11"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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












