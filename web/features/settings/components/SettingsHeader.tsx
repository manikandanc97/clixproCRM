import React, { memo } from "react";
import { Settings2 } from "lucide-react";
import { CRMPageHeader } from "@/shared/components/crm";

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
  targets: {
    title: "Settings",
    description: "Set and manage your sales and revenue targets.",
  },
};

const SettingsHeader = memo(({ activeSection }: SettingsHeaderProps) => {
  const info = sectionInfo[activeSection] || sectionInfo.profile;

  return (
    <CRMPageHeader
      title={info.title}
      subtitle={info.description}
      icon={Settings2}
      badge="Workspace"
    />
  );
});

SettingsHeader.displayName = "SettingsHeader";

export default SettingsHeader;
