"use client";

import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsHeaderProps {
  activeSection: string;
}

const sectionInfo: Record<string, { title: string; description: string }> = {
  profile: {
    title: "My Profile",
    description: "Manage your personal information and public profile.",
  },
  personalization: {
    title: "Personalization",
    description: "Customize your workspace appearance and interface preferences.",
  },
  notifications: {
    title: "Notifications",
    description: "Control how and when you receive alerts from the platform.",
  },
  workspace: {
    title: "Workspace Settings",
    description: "Configure your organization's general settings and branding.",
  },
  team: {
    title: "Team Management",
    description: "Invite members and manage roles and permissions.",
  },
  billing: {
    title: "Billing & Plans",
    description: "Manage your subscription, invoices, and payment methods.",
  },
  integrations: {
    title: "Integrations",
    description: "Connect your workspace with third-party tools and services.",
  },
  ai: {
    title: "AI Workspace",
    description: "Configure AI-powered automations and assistant preferences.",
  },
  security: {
    title: "Security & Privacy",
    description: "Protect your account with advanced security controls.",
  },
};

const SettingsHeader = ({ activeSection }: SettingsHeaderProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccess(true);
    toast.success("Settings saved successfully", {
      description: "Your changes have been applied to your workspace.",
    });
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const info = sectionInfo[activeSection] || sectionInfo.profile;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          {info.title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
          {info.description}
        </p>
      </motion.div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="relative overflow-hidden flex-1 md:flex-none rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 h-11 px-8 font-semibold transition-all active:scale-95 group"
        >
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </motion.div>
            ) : showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center text-emerald-100"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Saved!
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center"
              >
                <Save className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Save Changes
              </motion.div>
            )}
          </AnimatePresence>
          {isSaving && (
            <motion.div
              layoutId="saving-glow"
              className="absolute inset-0 bg-white/20 blur-xl"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsHeader;
