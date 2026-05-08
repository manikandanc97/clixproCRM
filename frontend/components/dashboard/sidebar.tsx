"use client";

import {
  LayoutDashboard,
  Users,
  UserRound,
  CheckSquare,
  KanbanSquare,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Building2,
  Bell
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser, fetchCurrentUser } from "@/lib/api/auth";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { useApiResource } from "@/hooks/use-api-resource";
import { motion, AnimatePresence } from "framer-motion";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { title: "Reports", icon: BarChart3, href: "/reports" },
    ]
  },
  {
    label: "Workspace",
    items: [
      { title: "Leads", icon: Users, href: "/leads" },
      { title: "Customers", icon: UserRound, href: "/customers" },
      { title: "Pipeline", icon: KanbanSquare, href: "/pipeline" },
      { title: "Quotations", icon: FileText, href: "/quotations" },
    ]
  },
  {
    label: "Management",
    items: [
      { title: "Tasks", icon: CheckSquare, href: "/tasks" },
    ]
  }
];

function getInitials(name?: string) {
  if (!name) return "CR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { data: user } = useApiResource(fetchCurrentUser);

  const initials = getInitials(user?.name);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-50 sidebar-bg shadow-sidebar"
    >
      <div className="flex flex-col h-full relative">
        {/* Toggle Button - More visible and refined */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-10 bg-sidebar border border-sidebar-border rounded-full p-1.5 shadow-md text-sidebar-foreground/40 hover:text-primary transition-all z-20 hover:scale-110 active:scale-95 group"
        >
          {isCollapsed ? 
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /> : 
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          }
        </button>

        {/* Workspace Selector - Better visual hierarchy */}
        <div className={`py-8 transition-all duration-300 ${isCollapsed ? "px-4" : "px-6"}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between p-2.5 rounded-2xl hover:bg-sidebar-accent cursor-pointer border border-transparent hover:border-sidebar-border transition-all group/ws"}`}>
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 justify-center items-center bg-gradient-to-br from-sidebar-primary to-primary rounded-xl w-9 h-9 text-sidebar-primary-foreground shadow-lg shadow-primary/20 border border-white/10">
                <Building2 className="w-5 h-5" />
              </div>
              
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <h1 className="text-sidebar-foreground font-bold text-sm tracking-tight leading-none">
                      Acme Corp
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
                      <p className="text-sidebar-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                        Pro Plan
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {!isCollapsed && <ChevronsUpDown className="w-4 h-4 text-sidebar-foreground/40 group-hover/ws:text-sidebar-foreground transition-colors" />}
          </div>
        </div>

        {/* Scrollable Menu - Improved Spacing */}
        <TooltipProvider delayDuration={0}>
          <div className="flex-1 overflow-y-auto scrollbar-none px-3 pb-6">
            {menuGroups.map((group) => (
              <div key={group.label} className="mb-8 last:mb-0">
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-4 mb-3"
                    >
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40">
                        {group.label}
                      </h4>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <nav className="space-y-1.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    const content = (
                      <Link
                        href={item.href || "#"}
                        className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 h-11" : "gap-3 px-4 py-2.5"} rounded-2xl transition-all duration-300 text-sm font-semibold group relative
                          ${
                            isActive
                              ? "text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                          }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 -z-10"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        
                        <Icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                          isActive 
                            ? "text-sidebar-primary scale-110" 
                            : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground group-hover:scale-110"
                        }`} />
                        
                        {!isCollapsed && (
                          <motion.span
                            initial={false}
                            animate={{ opacity: 1 }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {item.title}
                          </motion.span>
                        )}

                        {isActive && !isCollapsed && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="absolute right-2 w-1.5 h-1.5 rounded-full bg-sidebar-primary shadow-[0_0_8px_var(--sidebar-primary)]" 
                          />
                        )}
                      </Link>
                    );

                    return isCollapsed ? (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>
                          {content}
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10} className="bg-slate-900 text-white border-slate-800 rounded-xl px-3 py-1.5 font-bold text-xs shadow-2xl">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div key={item.title}>{content}</div>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* User Identity Card - Premium & Minimal */}
        <div className={`p-4 border-t border-sidebar-border bg-sidebar/30 backdrop-blur-md`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-2 py-1.5"} rounded-2xl transition-all duration-300`}>
            <div className="relative shrink-0">
               <div className="flex justify-center items-center bg-gradient-to-br from-sidebar-primary to-primary rounded-xl w-9 h-9 font-black text-[11px] text-sidebar-primary-foreground shadow-lg shadow-primary/10 border border-white/10 group-hover:scale-105 transition-transform">
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success border-2 border-sidebar rounded-full shadow-[0_0_8px_var(--success)]" />
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sidebar-foreground font-bold text-sm truncate leading-none tracking-tight">
                  {user?.name || "Account"}
                </p>
                <p className="text-sidebar-foreground/40 text-[10px] font-bold uppercase tracking-[0.05em] mt-1.5 truncate">
                  {user?.role || "Member"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
