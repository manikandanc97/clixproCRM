"use client";

import { useState } from "react";
import SettingsHeader from "@/components/settings/SettingsHeader";
import ProfileSettings from "@/components/settings/ProfileSettings";
import CompanySettings from "@/components/settings/CompanySettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import WorkspaceSettings from "@/components/settings/WorkspaceSettings";
import TeamSettings from "@/components/settings/TeamSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import AISettings from "@/components/settings/AISettings";
import PersonalizationSettings from "@/components/settings/PersonalizationSettings";
import { motion, AnimatePresence } from "framer-motion";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "workspace":
        return <WorkspaceSettings />;
      case "team":
        return <TeamSettings />;
      case "billing":
        return <BillingSettings />;
      case "integrations":
        return <IntegrationSettings />;
      case "ai":
        return <AISettings />;
      case "personalization":
        return <PersonalizationSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      <SettingsHeader activeSection={activeSection} />

      <div className="flex flex-col lg:flex-row gap-8">
        <SettingsSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="flex-1 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

