"use client";

import React from "react";
import { cn } from "@/shared/lib/utils";
import {
  User,
  Building2,
  Users,
  ShieldCheck,
  Bell,
  Palette,
  Package,
  Blocks,
  Sparkles,
  ChevronRight,
  ShieldHalf,
} from "lucide-react";
import { motion } from "framer-motion";
import { CRMCard } from "@/shared/components/crm";
import { Progress } from "@/shared/ui/progress";

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
      { id: "workspace", label: "General", icon: Building2 },
      { id: "team", label: "Team", icon: Users },
      { id: "billing", label: "Software License", icon: Package },
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

      {/* Security Score */}
      <CRMCard className="mt-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <ShieldHalf className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex items-baseline justify-between flex-1">
            <span className="text-xs font-bold text-foreground">Security Score</span>
            <span className="text-xs font-black text-primary">85%</span>
          </div>
        </div>
        <Progress value={85} className="h-1.5 bg-muted" />
        <p className="mt-2.5 text-[10px] text-muted-foreground font-medium">
          Enable 2FA to reach 100%
        </p>
      </CRMCard>
    </div>
  );
};

export default SettingsSidebar;












