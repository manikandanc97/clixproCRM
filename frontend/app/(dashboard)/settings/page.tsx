"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SettingsHeader from "@/features/settings/components/SettingsHeader";
import ProfileSettings from "@/features/settings/components/ProfileSettings";
import SecuritySettings from "@/features/settings/components/SecuritySettings";
import NotificationSettings from "@/features/settings/components/NotificationSettings";
import SettingsSidebar from "@/features/settings/components/SettingsSidebar";
import WorkspaceSettings from "@/features/settings/components/WorkspaceSettings";
import TeamSettings from "@/features/settings/components/TeamSettings";
import BillingSettings from "@/features/settings/components/BillingSettings";
import IntegrationSettings from "@/features/settings/components/IntegrationSettings";
import AISettings from "@/features/settings/components/AISettings";
import PersonalizationSettings from "@/features/settings/components/PersonalizationSettings";
import { motion, AnimatePresence } from "framer-motion";
import { CRMPageContainer } from "@/shared/components/crm";

const SettingsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sectionParam = searchParams.get("section");
  
  const [activeSection, setActiveSection] = useState(sectionParam || "profile");

  // Sync state with URL parameter
  useEffect(() => {
    if (sectionParam && sectionParam !== activeSection) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam, activeSection]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    router.push(`/settings?section=${section}`, { scroll: false });
  };

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
            onSectionChange={handleSectionChange}
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
