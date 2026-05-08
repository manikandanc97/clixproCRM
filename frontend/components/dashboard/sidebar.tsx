"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Building2,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { getRoleMenu, normalizeRole } from "@/lib/auth/rbac";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user } = useAuth();

  const menuGroups = getRoleMenu(user?.role);
  const roleName =
    user?.roleName ||
    normalizeRole(user?.role)
      .split("_")
      .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
      .join(" ");

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 72 : 270 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-50 bg-sidebar border-r border-sidebar-border"
    >
      <div className="flex flex-col h-full relative">
        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-8 bg-sidebar border border-sidebar-border rounded-full p-1 shadow-sm text-sidebar-foreground/40 hover:text-sidebar-foreground transition-all z-20 hover:scale-105 active:scale-95 group"
        >
          {isCollapsed ? 
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /> : 
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          }
        </button>

        {/* Workspace Selector */}
        <div className={`pt-6 pb-4 transition-all duration-300 ${isCollapsed ? "px-3" : "px-5"}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between p-2 rounded-xl hover:bg-sidebar-accent/50 cursor-pointer border border-transparent transition-all group/ws"}`}>
            <div className="flex items-center gap-2.5">
              <div className="flex shrink-0 justify-center items-center bg-sidebar-primary/10 text-sidebar-primary rounded-lg w-8 h-8 border border-sidebar-primary/20">
                <Building2 className="w-4 h-4" />
              </div>
              
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <h1 className="text-sidebar-foreground font-semibold text-[13px] tracking-tight leading-tight">
                      Acme Corp
                    </h1>
                    <p className="text-sidebar-foreground/50 text-[11px] font-medium mt-0.5">
                      {roleName}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {!isCollapsed && <ChevronsUpDown className="w-3.5 h-3.5 text-sidebar-foreground/40 group-hover/ws:text-sidebar-foreground transition-colors" />}
          </div>
        </div>

        {/* Scrollable Menu - Compact Spacing */}
        <TooltipProvider delayDuration={0}>
          <div className="flex-1 overflow-y-auto kanban-board-scroll px-3 pb-6">
            {menuGroups.map((group) => (
              <div key={group.label} className="mb-6 last:mb-0">
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-3 mb-2"
                    >
                      <h4 className="text-[11px] font-semibold text-sidebar-foreground/40 tracking-wider">
                        {group.label}
                      </h4>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    const content = (
                      <Link
                        href={item.href || "#"}
                        className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 h-9" : "gap-2.5 px-3 py-1.5"} rounded-xl transition-all duration-200 text-[13px] group relative outline-none
                          ${
                            isActive
                              ? "text-sidebar-primary bg-sidebar-primary/10 font-semibold shadow-sm"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 font-medium"
                          }`}
                      >
                        {isActive && (
                          <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-sidebar-primary rounded-r-full"
                          />
                        )}
                        
                        <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                          isActive 
                            ? "text-sidebar-primary" 
                            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
                        }`} />
                        
                        {!isCollapsed && (
                          <span className="truncate">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    );

                    return isCollapsed ? (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>
                          {content}
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10} className="bg-slate-900 text-white border-border rounded-xl px-3 py-1.5 font-bold text-xs shadow-elevated">
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

      </div>
    </motion.aside>
  );
}
