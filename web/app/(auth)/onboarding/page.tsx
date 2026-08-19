"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import client from "@/shared/lib/api/client";
import { useAuth } from "@/features/auth/components/auth-provider";
import { fetchDashboardData } from "@/shared/lib/api/crm";
import { extractErrorMessage } from "@/shared/lib/api/error";

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit

    setError(null);

    const trimmedCompany = companyName.trim();
    if (!trimmedCompany) {
      setError("Company Name is required");
      return;
    }

    setLoading(true);

    try {
      // 1. REAL backend API call to create Tenant, System Roles, RolePermissions & Membership
      const response = await client.post("/auth/onboarding", {
        companyName: trimmedCompany,
      });

      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, "Failed to create workspace"));
      }

      // 2. Hydrate session & auth context
      if (typeof window !== "undefined") {
        localStorage.setItem("has_session", "1");
        // Arm the one-time first-entry activation celebration
        sessionStorage.setItem("workspace_activation_celebration_pending", "1");
      }

      await refreshUser();

      // 3. Warm dashboard query cache
      try {
        await queryClient.prefetchQuery({
          queryKey: ["dashboardData", "month"],
          queryFn: () => fetchDashboardData("month"),
          staleTime: 2 * 60 * 1000,
        });
      } catch {
        // Prefetch is an optimization; non-blocking on failure
      }

      // 4. Navigate directly to dashboard where the activation celebration will fire
      router.push("/dashboard");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = extractErrorMessage(
        err.response?.data,
        err.message || "Something went wrong creating your workspace. Please try again."
      );
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-card-header">
        <h2 className="auth-card-title">Create Your Workspace 🚀</h2>
        <p className="auth-card-subtitle">Provide your company name to finish setting up your account.</p>
      </div>

      <form onSubmit={handleOnboarding} className="space-y-5">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-semibold">
            Company / Workspace Name
          </Label>
          <Input
            id="companyName"
            type="text"
            placeholder="e.g. Acme Corp or Growth Labs"
            className={`rounded-xl h-11 transition-all ${
              error ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              if (error) setError(null);
            }}
            required
            disabled={loading}
            autoFocus
          />
          {error && (
            <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
              {error}
            </p>
          )}
        </div>

        {/* Submit Action */}
        <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl w-full h-11 flex items-center justify-center gap-2 font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating your workspace...</span>
            </>
          ) : (
            <>
              <span>Create Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </>
  );
}
