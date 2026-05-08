"use client";

import { useState } from "react";
import SettingsHeader from "@/components/settings/SettingsHeader";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import WorkspaceSettings from "@/components/settings/WorkspaceSettings";
import TeamSettings from "@/components/settings/TeamSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import AISettings from "@/components/settings/AISettings";
import PersonalizationSettings from "@/components/settings/PersonalizationSettings";
import { motion, AnimatePresence } from "framer-motion";
import { CRMPageContainer } from "@/components/shared/crm";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const renderSection = () => {
    switch (activeSection) {
      case "profile":       return <ProfileSettings />;
      case "workspace":     return <WorkspaceSettings />;
      case "team":          return <TeamSettings />;
      case "billing":       return <BillingSettings />;
      case "integrations":  return <IntegrationSettings />;
      case "ai":            return <AISettings />;
      case "personalization": return <PersonalizationSettings />;
      case "notifications": return <NotificationSettings />;
      case "security":      return <SecuritySettings />;
      default:              return <ProfileSettings />;
    }
  };

  return (
    <CRMPageContainer>
      {/* Page Header */}
      <SettingsHeader activeSection={activeSection} />

      {/* Body */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Sidebar */}
        <div className="lg:w-60 shrink-0">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </CRMPageContainer>
  );
};

export default SettingsPage;
