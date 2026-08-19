"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  ScrollText,
  Settings,
  Shield,
  Crown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowLeftRight,
} from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useState } from "react";
import { ClixProIcon } from "@/shared/ui/logo";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

const navItems = [
  {
    title: "Overview",
    href: "/super-admin",
    icon: LayoutDashboard,
  },
  {
    title: "Organizations",
    href: "/super-admin/organizations",
    icon: Building2,
  },
  {
    title: "Platform Users",
    href: "/super-admin/users",
    icon: Users,
  },
  {
    title: "Plans & Billing",
    href: "/super-admin/plans",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    href: "/super-admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Audit Logs",
    href: "/super-admin/audit-logs",
    icon: ScrollText,
  },
  {
    title: "Platform Settings",
    href: "/super-admin/settings",
    icon: Settings,
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 270 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex flex-col h-screen shrink-0 border-r border-sidebar-border bg-sidebar z-30 select-none"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-8 bg-sidebar border border-sidebar-border rounded-full p-1 shadow-sm text-sidebar-foreground/40 hover:text-sidebar-foreground transition-all z-20 group"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 transition-transform" />
          ) : (
            <ChevronLeft className="w-4 h-4 transition-transform" />
          )}
        </button>

        {/* Logo & Header */}
        <div className={`pt-6 pb-4 transition-all duration-300 ${collapsed ? "px-3" : "px-4"}`}>
          <div
            className={`flex items-center ${
              collapsed
                ? "justify-center"
                : "justify-between p-2 rounded-xl bg-background/50 dark:bg-muted/10 border border-transparent hover:border-sidebar-border/50 shadow-sm transition-all"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 justify-center items-center bg-emerald-500/10 text-emerald-600 rounded-lg w-9 h-9 border border-emerald-500/20 shadow-sm">
                <ClixProIcon pixelSize={24} />
              </div>

              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <h1 className="text-sidebar-foreground font-bold text-sm tracking-tight leading-tight truncate max-w-[140px]">
                      ClixPro<span className="text-emerald-600">Platform</span>
                    </h1>
                    <div className="flex items-center mt-0.5 gap-1.5">
                      <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider inline-flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" />
                        Super Admin
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 kanban-board-scroll">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 mb-2"
              >
                <h4 className="text-[11px] font-semibold text-sidebar-foreground/40 tracking-wider uppercase">
                  Platform Control
                </h4>
              </motion.div>
            )}
          </AnimatePresence>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/super-admin"
                  ? pathname === "/super-admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              const Icon = item.icon;

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-300 group relative ${
                          isActive
                            ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20 shadow-sm"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                        }`}
                      >
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          animate={
                            isActive
                              ? {
                                  scale: [1, 1.1, 1],
                                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                }
                              : {}
                          }
                        >
                          <Icon
                            className={`w-5 h-5 shrink-0 ${
                              isActive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80 transition-colors"
                            }`}
                          />
                        </motion.div>
                        {isActive && (
                          <motion.div
                            layoutId="superAdminActiveIndicator"
                            className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 rounded-r-full"
                          />
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={12}
                      className="bg-slate-900 text-white border-none rounded-lg px-3 py-1.5 font-semibold text-xs shadow-xl"
                    >
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 text-[13.5px] group relative ${
                    isActive
                      ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20 font-bold shadow-sm"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 font-medium"
                  }`}
                >
                  <motion.div
                    animate={
                      isActive
                        ? {
                            scale: [1, 1.05, 1],
                            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                          }
                        : {}
                    }
                    className="shrink-0"
                  >
                    <Icon
                      className={`w-[18px] h-[18px] transition-colors ${
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                      }`}
                    />
                  </motion.div>
                  <span className="truncate flex-1">{item.title}</span>
                  {isActive && (
                    <motion.div
                      layoutId="superAdminActivePill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-600 rounded-r-full shadow-sm"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: User Info & Tenant CRM Switch */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar shrink-0 space-y-2">
          {!collapsed ? (
            <>
              <Link
                href="/dashboard"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground bg-sidebar-accent/30 hover:bg-sidebar-accent/60 transition-all border border-sidebar-border/50"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Switch to Tenant CRM</span>
              </Link>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-background/50 border border-sidebar-border">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm">
                  {user?.name?.charAt(0) || "S"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-sidebar-foreground truncate">
                    {user?.name || "Super Admin"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-600" />
                    <span className="text-[10px] font-semibold text-emerald-600 truncate">
                      Platform Root
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="bg-slate-900 text-white rounded-lg text-xs font-medium">
                Sign Out
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
