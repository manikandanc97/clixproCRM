"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import AuthLayout from "@/features/auth/components/auth-layout";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import client from "@/shared/lib/api/client";
import { useAuth } from "@/features/auth/components/auth-provider";
import PublicRoute from "@/features/auth/components/public-route";

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError("Company Name is required");
      return;
    }

    try {
      setLoading(true);

      const response = await client.post("/auth/onboarding", {
        companyName,
      });

      if (response.data.success) {
        toast.success("Organization created successfully! 🚀");
        await refreshUser(); // Refresh auth context
        router.push("/dashboard");
      } else {
        setError(response.data.error?.message || "Failed to create organization");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <AuthLayout
        title="Welcome to ClixProCRM! 🎉"
        subtitle="Please provide your company name to finish setting up your account."
        footerText=""
        footerLink=""
        footerLinkText=""
      >
        <form onSubmit={handleOnboarding} className="space-y-5">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Enter your company name"
              className={`rounded-xl h-11 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (error) setError(null);
              }}
              required
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 rounded-xl w-full h-11 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating Organization..." : "Complete Setup"}
          </Button>
        </form>
      </AuthLayout>
    </PublicRoute>
  );
}
