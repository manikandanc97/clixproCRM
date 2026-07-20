"use client";

import React from "react";
import Sidebar from "@/features/dashboard/components/sidebar";
import Topbar from "@/features/dashboard/components/topbar";
import { useSidebar } from "@/features/dashboard/components/SidebarContext";
import { motion } from "framer-motion";
import { CommandPalette } from "@/features/dashboard/components/CommandPalette";
import { MobileBottomNav } from "@/features/dashboard/components/MobileBottomNav";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Subtle Background Surface */}
      <div className="absolute inset-0 bg-[#fafafa] dark:bg-[#050505] -z-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

      {/* Desktop Sidebar — fixed, sits outside flow */}
      <Sidebar />

      {/* Main Content Column — offset by sidebar width, fills remaining height */}
      <motion.div
        initial={false}
        animate={{
          paddingLeft: isCollapsed ? "80px" : "260px",
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col flex-1 min-w-0 h-full"
      >
        {/* Topbar is sticky because only <main> below scrolls */}
        <div className="shrink-0">
          <Topbar />
        </div>

        {/* Scrollable page content — only this region scrolls */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide min-h-0">
          <motion.div
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>

      {/* Global Components */}
      <CommandPalette />
      <MobileBottomNav />
    </div>
  );
}












