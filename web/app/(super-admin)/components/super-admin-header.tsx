"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useTheme } from "next-themes";
import { Crown, Sun, Moon, ExternalLink, Plus, Building2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProfileMenu from "@/features/dashboard/components/ProfileMenu";
import GlobalSearch from "@/features/dashboard/components/GlobalSearch";
import CurrencySwitcher from "@/features/dashboard/components/CurrencySwitcher";
import NotificationPanel from "@/features/dashboard/components/NotificationPanel";
import ThemeToggle from "@/features/dashboard/components/ThemeToggle";
import { Button } from "@/shared/ui/button";

function getInitials(name?: string) {
  if (!name) return "SA";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function SuperAdminHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const initials = getInitials(user?.name);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-md px-4 sm:px-8 border-b border-border h-[72px] transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] gap-4">
      {/* Global Search */}
      <div className="flex flex-1 items-center gap-4 max-w-full md:max-w-[450px]">
        <GlobalSearch />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Create New Organization Action */}
        <Link href="/super-admin/organizations">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-2 text-xs md:text-sm shadow-sm gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </Button>
        </Link>

        {/* Currency & Notifications */}
        <div className="flex items-center gap-3">
          <CurrencySwitcher />
          <NotificationPanel />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Menu with Avatar */}
        <ProfileMenu user={user} initials={initials} />
      </div>
    </header>
  );
}
