"use client";

import { LayoutDashboard, Users, CheckSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { icon: LayoutDashboard, href: "/dashboard", label: "Home" },
  { icon: Users, href: "/leads", label: "Leads" },
  { icon: CheckSquare, href: "/tasks", label: "Tasks" },
  { icon: Settings, href: "/settings", label: "Settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard");

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 min-w-[4rem]"
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -inset-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold transition-colors duration-300 ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
