"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Building2,
  LifeBuoy,
  Book,
  MessageCircleQuestion,
  Headphones,
  Keyboard,
  Info
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/features/dashboard/components/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/components/auth-provider";
import { getRoleMenu } from "@/shared/lib/auth/rbac";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

export function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user, access } = useAuth();

  const menuGroups = getRoleMenu(user?.role);
  const roleName = access.roleName;

  // On mobile, force uncollapsed
  const collapsedState = isMobile ? false : isCollapsed;

  return (
    <div className="flex flex-col h-full relative">
      {/* Toggle Button (Hidden on Mobile) */}
      {!isMobile && (
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-8 bg-sidebar border border-sidebar-border rounded-full p-1 shadow-sm text-sidebar-foreground/40 hover:text-sidebar-foreground transition-all z-20 group"
        >
          {collapsedState ? 
            <ChevronRight className="w-4 h-4 transition-transform" /> : 
            <ChevronLeft className="w-4 h-4 transition-transform" />
          }
        </button>
      )}

      {/* Workspace Selector */}
      <div className={`pt-6 pb-2 transition-all duration-300 ${collapsedState ? "px-3" : "px-4"}`}>
        <div className={`flex items-center ${collapsedState ? "justify-center" : "justify-between p-2 rounded-xl hover:bg-sidebar-accent/50 cursor-pointer border border-transparent hover:border-sidebar-border/50 shadow-sm hover:shadow-md transition-all group/ws bg-background/50 dark:bg-muted/10 backdrop-blur-sm"}`}>
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 justify-center items-center bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground rounded-lg w-9 h-9 border border-white/10 shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
            
            <AnimatePresence mode="wait">
              {!collapsedState && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="text-sidebar-foreground font-bold text-sm tracking-tight leading-tight truncate max-w-[130px] capitalize">
                    {user?.displayName || user?.name || "Clixpro"}
                  </h1>
                  <div className="flex items-center mt-0.5 gap-1.5">
                    <span className="bg-primary/20 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      {roleName}
                    </span>
                    <span className="text-sidebar-foreground/50 text-[11px] font-medium truncate max-w-[80px]">
                      Workspace
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!collapsedState && <ChevronsUpDown className="w-3.5 h-3.5 text-sidebar-foreground/40 group-hover/ws:text-sidebar-foreground transition-colors shrink-0" />}
        </div>
      </div>

      {/* Scrollable Menu - Compact Spacing */}
      <TooltipProvider delayDuration={0}>
        <div className="flex-1 overflow-y-auto kanban-board-scroll px-3 pb-6">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-6 last:mb-0">
              <AnimatePresence mode="wait">
                {!collapsedState && (
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
                      {collapsedState ? (
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

      {/* Help Center Item at Bottom */}
      <div className="mt-auto p-3 border-t border-sidebar-border bg-sidebar shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {collapsedState ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-300 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 outline-none">
                      <LifeBuoy className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="bg-slate-900 text-white border-none rounded-lg px-3 py-1.5 font-semibold text-xs shadow-xl">
                    Help Center
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-300 text-[13.5px] font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 outline-none">
                <LifeBuoy className="w-[18px] h-[18px] transition-colors" />
                <span className="flex-1 text-left truncate">Help Center</span>
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            side="right" 
            sideOffset={collapsedState ? 12 : 8} 
            className="w-56 rounded-xl p-2 shadow-elevated border-border bg-popover/95 backdrop-blur-xl"
          >
            <div className="px-2 py-1.5">
              <h4 className="font-semibold text-sm">Help & Support</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Need help with Clixpro?</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2 rounded-lg gap-3">
              <Book className="w-4 h-4 text-muted-foreground" /> Documentation
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2 rounded-lg gap-3">
              <MessageCircleQuestion className="w-4 h-4 text-muted-foreground" /> FAQ
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2 rounded-lg gap-3">
              <Headphones className="w-4 h-4 text-muted-foreground" /> Contact Support
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2 rounded-lg gap-3">
              <Keyboard className="w-4 h-4 text-muted-foreground" /> Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 flex items-center gap-3 opacity-60">
              <Info className="w-4 h-4 text-muted-foreground" /> 
              <span className="text-xs font-medium">Version 1.0.0</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { isCollapsed } = useSidebar();

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 72 : 270 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-50 bg-sidebar border-r border-sidebar-border"
    >
      <SidebarContent />
    </motion.aside>
  );
}
