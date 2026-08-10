"use client";

import React from "react";
import { cn } from "@/shared/lib/utils";
import {
  User,
  Building2,
  ShieldCheck,
  Palette,
  Sparkles,
  ChevronRight,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const categories = [
  {
    title: "Account",
    items: [
      { id: "profile", label: "My Profile", icon: User },
      { id: "personalization", label: "Preferences", icon: Palette },
    ],
  },
  {
    title: "Workspace",
    items: [
      { id: "workspace", label: "General", icon: Building2 },
    ],
  },
  {
    title: "Sales",
    items: [
      { id: "targets", label: "Revenue Targets", icon: Target },
    ],
  },
  {
    title: "AI",
    items: [
      { id: "ai", label: "AI Settings", icon: Sparkles },
    ],
  },
  {
    title: "Security",
    items: [
      { id: "security", label: "Security & Privacy", icon: ShieldCheck },
    ],
  },
];

const SettingsSidebar = ({ activeSection, onSectionChange }: SettingsSidebarProps) => {
  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => (
        <div key={category.title} className="space-y-1">
          <p className="px-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2">
            {category.title}
          </p>
          {category.items.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full group flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="settings-active-indicator"
                    className="absolute left-0 w-0.5 h-5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary/60 shrink-0" />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SettingsSidebar;












