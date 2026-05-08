"use client";

import { Save, Loader2, CheckCircle2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CRMPageHeader } from "@/components/shared/crm";

interface SettingsHeaderProps {
  activeSection: string;
}

const sectionInfo: Record<string, { title: string; description: string }> = {
  profile: {
    title: "Settings",
    description: "Manage your personal information and workspace preferences.",
  },
  personalization: {
    title: "Settings",
    description: "Customize your workspace appearance and interface preferences.",
  },
  notifications: {
    title: "Settings",
    description: "Control how and when you receive alerts from the platform.",
  },
  workspace: {
    title: "Settings",
    description: "Configure your organization's general settings and branding.",
  },
  team: {
    title: "Settings",
    description: "Invite members and manage roles and permissions.",
  },
  billing: {
    title: "Settings",
    description: "View your software license details, activated modules, and activation status.",
  },
  integrations: {
    title: "Settings",
    description: "Connect your workspace with third-party tools and services.",
  },
  ai: {
    title: "Settings",
    description: "Configure AI-powered automations and assistant preferences.",
  },
  security: {
    title: "Settings",
    description: "Protect your account with advanced security controls.",
  },
};

const SettingsHeader = ({ activeSection }: SettingsHeaderProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSaving(false);
    setShowSuccess(true);
    toast.success("Settings saved", {
      description: "Your changes have been applied to your workspace.",
    });
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const info = sectionInfo[activeSection] || sectionInfo.profile;

  return (
    <CRMPageHeader
      title={info.title}
      subtitle={info.description}
      icon={Settings2}
      badge="Workspace"
      actions={[
        {
          label: isSaving ? "Saving…" : showSuccess ? "Saved!" : "Save Changes",
          icon: isSaving ? Loader2 : showSuccess ? CheckCircle2 : Save,
          onClick: handleSave,
          variant: "default",
        },
      ]}
    />
  );
};

export default SettingsHeader;
