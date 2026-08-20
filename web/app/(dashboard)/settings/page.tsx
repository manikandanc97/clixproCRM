"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SettingsHeader from "@/features/settings/components/SettingsHeader";
import SettingsSidebar from "@/features/settings/components/SettingsSidebar";
import ProfileSettings from "@/features/settings/components/ProfileSettings";
import SecuritySettings from "@/features/settings/components/SecuritySettings";
import WorkspaceSettings from "@/features/settings/components/WorkspaceSettings";
import AISettings from "@/features/settings/components/AISettings";
import PersonalizationSettings from "@/features/settings/components/PersonalizationSettings";
import RevenueTargetSettings from "@/features/settings/components/RevenueTargetSettings";
import { motion, AnimatePresence } from "framer-motion";
import { CRMPageContainer } from "@/shared/components/crm";

const VALID_SECTIONS = [
  "profile",
  "workspace",
  "ai",
  "personalization",
  "security",
  "targets",
];

const SettingsPage = () => {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const initialSection =
    sectionParam && VALID_SECTIONS.includes(sectionParam)
      ? sectionParam
      : "profile";

  const [activeSection, setActiveSection] = useState<string>(initialSection);

  // Sync state if URL query changes externally
  useEffect(() => {
    if (sectionParam && VALID_SECTIONS.includes(sectionParam) && sectionParam !== activeSection) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam, activeSection]);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("section");
      if (s && VALID_SECTIONS.includes(s)) {
        setActiveSection(s);
      } else {
        setActiveSection("profile");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    const newUrl = section === "profile" ? "/settings" : `/settings?section=${section}`;
    window.history.pushState({ section }, "", newUrl);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "workspace":
        return <WorkspaceSettings />;
      case "ai":
        return <AISettings />;
      case "personalization":
        return <PersonalizationSettings />;
      case "security":
        return <SecuritySettings />;
      case "targets":
        return <RevenueTargetSettings />;
      default:
        return <ProfileSettings />;
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
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
