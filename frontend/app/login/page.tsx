"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ShieldCheck, Ticket, UserSquare2, Users } from "lucide-react";

import AuthLayout from "@/features/auth/components/auth-layout";
import { getApiErrorMessage } from "@/shared/lib/api/error";
import { CRM_ROLES, roleAccent } from "@/shared/lib/auth/rbac";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PublicRoute from "@/features/auth/components/public-route";
import { useAuth } from "@/features/auth/components/auth-provider";

const demoAccounts = [
  {
    role: CRM_ROLES.SUPER_ADMIN,
    roleName: "Super Admin",
    description: "Full CRM control, settings, analytics, AI insights.",
    email: "superadmin@clientrisecrm.com",
    password: "SuperAdmin@123",
    icon: ShieldCheck,
  },
  {
    role: CRM_ROLES.SALES_MANAGER,
    roleName: "Sales Manager",
    description: "Leads, quotations, team assignments, and sales performance.",
    email: "salesmanager@clientrisecrm.com",
    password: "SalesManager@123",
    icon: Building2,
  },
  {
    role: CRM_ROLES.SALES_EXECUTIVE,
    roleName: "Sales Executive",
    description: "Assigned leads, follow-ups, meetings, and quotations.",
    email: "salesexec@clientrisecrm.com",
    password: "SalesExec@123",
    icon: Users,
  },
  {
    role: CRM_ROLES.SUPPORT_EXECUTIVE,
    roleName: "Support Executive",
    description: "Customer support tickets and communication history.",
    email: "support@clientrisecrm.com",
    password: "Support@123",
    icon: Ticket,
  },
  {
    role: CRM_ROLES.HR_MANAGER,
    roleName: "HR Manager",
    description: "Employees, onboarding, attendance, and HR performance.",
    email: "hrmanager@clientrisecrm.com",
    password: "HRManager@123",
    icon: UserSquare2,
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(email, password);

      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (
    account: (typeof demoAccounts)[number],
    shouldAutoLogin = false,
  ) => {
    setEmail(account.email);
    setPassword(account.password);

    if (!shouldAutoLogin) {
      return;
    }

    try {
      setLoading(true);
      await login(account.email, account.password);
      toast.success(`Signed in as ${account.roleName}`);
      router.push("/dashboard");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Unable to sign in with demo account"));
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

        <div className="mt-8 pt-6 border-border/50 border-t">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground">Try Demo Accounts</h3>
            <p className="text-[11px] text-muted-foreground">Enterprise role presets</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 max-h-88 overflow-y-auto pr-1">
            {demoAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <div
                  key={account.email}
                  className="w-full text-left p-3 border border-border hover:border-primary/40 bg-background/60 rounded-xl transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg bg-linear-to-br ${roleAccent[account.role]} text-white shadow-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-foreground">{account.roleName}</p>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Demo</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{account.description}</p>
                      <p className="text-xs mt-2 text-foreground/80 truncate">{account.email}</p>
                      <p className="text-xs text-muted-foreground">{account.password}</p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs rounded-lg"
                          onClick={() => handleDemoSelect(account)}
                        >
                          Fill Credentials
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 text-xs rounded-lg"
                          onClick={() => {
                            void handleDemoSelect(account, true);
                          }}
                        >
                          Quick Login
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AuthLayout>
    </PublicRoute>
  );
}












