"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Building2,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/features/dashboard/components/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/components/auth-provider";
import { getRoleMenu, normalizeRole } from "@/shared/lib/auth/rbac";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

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
          className="absolute -right-3.5 top-8 bg-sidebar border border-sidebar-border rounded-full p-1 shadow-sm text-sidebar-foreground/40 hover:text-sidebar-foreground transition-all z-20 group"
        >
          {isCollapsed ? 
            <ChevronRight className="w-4 h-4 transition-transform" /> : 
            <ChevronLeft className="w-4 h-4 transition-transform" />
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
                
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <div key={item.title}>
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={item.href || "#"}
                                className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-300 group relative
                                  ${
                                    isActive
                                      ? "text-sidebar-primary bg-sidebar-primary/10 shadow-sm"
                                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                                  }`}
                              >
                                <motion.div
                                  whileTap={{ scale: 0.9 }}
                                  animate={isActive ? { 
                                    scale: [1, 1.1, 1],
                                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                  } : {}}
                                >
                                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80 transition-colors"}`} />
                                </motion.div>
                                
                                {isActive && (
                                  <motion.div 
                                    layoutId="activeIndicator"
                                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-sidebar-primary rounded-r-full"
                                  />
                                )}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={12} className="bg-slate-900 text-white border-none rounded-lg px-3 py-1.5 font-semibold text-xs shadow-xl">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Link
                            href={item.href || "#"}
                            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-300 text-[13.5px] group relative
                              ${
                                isActive
                                  ? "text-sidebar-primary bg-sidebar-primary/10 font-bold shadow-sm"
                                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 font-medium"
                              }`}
                          >
                            <motion.div
                              animate={isActive ? { 
                                scale: [1, 1.05, 1],
                                transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                              } : {}}
                              className="shrink-0"
                            >
                              <Icon className={`w-[18px] h-[18px] transition-colors ${
                                isActive 
                                  ? "text-sidebar-primary" 
                                  : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                              }`} />
                            </motion.div>
                            
                            <span className="truncate flex-1">
                              {item.title}
                            </span>

                            {isActive && (
                              <motion.div 
                                layoutId="activePill"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sidebar-primary rounded-r-full shadow-[0_0_8px_rgba(var(--sidebar-primary),0.5)]"
                              />
                            )}
                          </Link>
                        )}
                      </div>
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












