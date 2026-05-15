"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/shared/lib/demo-accounts";
import { toast } from "sonner";

interface DemoAccountsSectionProps {
  onDemoLogin: (email: string, password: string) => Promise<void>;
}

export default function DemoAccountsSection({ onDemoLogin }: DemoAccountsSectionProps) {
  const [activeRole, setActiveRole] = useState<string | null>(null);

  const handleDemoLogin = async (account: DemoAccount) => {
    setActiveRole(account.role);
    const toastId = toast.loading("Logging in as demo user...");

    try {
      await onDemoLogin(account.email, account.password);
      toast.success("Demo login successful", { id: toastId });
    } catch (error) {
      toast.error("Demo login failed. Please try again.", { id: toastId });
    } finally {
      setActiveRole(null);
    }
  };

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Demo login</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Quick access demo accounts</h2>
        <p className="mt-1 text-sm text-slate-600">
          Click a role below to sign in with seeded demo credentials instantly.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((account) => (
          <Button
            key={account.role}
            type="button"
            onClick={() => void handleDemoLogin(account)}
            disabled={Boolean(activeRole && activeRole !== account.role)}
            className={`h-12 rounded-2xl border text-sm font-medium transition-colors ${
              activeRole === account.role
                ? "border-emerald-700 bg-emerald-700 text-white shadow-lg"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            {account.roleName}
          </Button>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Demo accounts are seeded in development. Standard backend JWT auth and session state is used.
      </p>
    </section>
  );
}