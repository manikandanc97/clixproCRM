"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/components/auth-provider";
import { getRoleMenu } from "@/shared/lib/auth/rbac";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const navItems = getRoleMenu(user?.role)
    .flatMap((group) => group.items)
    .slice(0, 4)
    .map((item) => ({
      icon: item.icon,
      href: item.href,
      label: item.title,
    }));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 dark:bg-card/80 backdrop-blur-xl border-t border-border dark:border-border/60 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard");

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 min-w-16"
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground dark:text-muted-foreground"}`} />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -inset-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold transition-colors duration-300 ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground dark:text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}












