"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  Users,
  ShieldCheck,
  Bell,
  Palette,
  CreditCard,
  Blocks,
  Sparkles,
  ChevronRight,
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
      { id: "personalization", label: "Personalization", icon: Palette },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    title: "Workspace",
    items: [
      { id: "workspace", label: "General Settings", icon: Building2 },
      { id: "team", label: "Team Management", icon: Users },
      { id: "billing", label: "Billing & Plans", icon: CreditCard },
      { id: "integrations", label: "Integrations", icon: Blocks },
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
    <div className="w-full lg:w-64 flex flex-col space-y-6">
      {categories.map((category) => (
        <div key={category.title} className="space-y-2">
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {category.title}
          </h3>
          <div className="space-y-1">
            {category.items.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full group flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-item"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Security Score Widget Preview */}
      <div className="mt-auto pt-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary">Security Score</span>
            <span className="text-xs font-bold text-primary">85%</span>
          </div>
          <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "85%" }}
              className="h-full bg-primary"
            />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Complete 2FA to reach 100%
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
