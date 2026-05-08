"use client";

import { useState } from "react";
import Link from "next/link";

import AuthLayout from "@/components/auth/auth-layout";
import { loginUser } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PublicRoute from "@/components/auth/public-route";

export default function LoginPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password,
      });

      localStorage.setItem("token", response.token);

      console.log(response);

      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.log(error);

      toast.error(getApiErrorMessage(error, "Login failed"));
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
              type="email"
              placeholder="name@company.com"
              className="rounded-xl h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
      </AuthLayout>
    </PublicRoute>
  );
}
