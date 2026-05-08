"use client";

import React from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { motion } from "framer-motion";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="relative flex bg-background min-h-screen overflow-hidden">
      {/* Subtle Background Surface */}
      <div className="absolute inset-0 bg-[#fafafa] dark:bg-[#050505] -z-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <motion.div
        initial={false}
        animate={{
          paddingLeft: isCollapsed ? "80px" : "260px",
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col flex-1 min-w-0"
      >
        <Topbar />

        <main className="flex-1 overflow-y-auto scrollbar-hide">
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

      {/* Global SaaS Components */}
      <CommandPalette />
      <MobileBottomNav />
    </div>
  );
}
