"use client";

import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const SettingsHeader = dynamic(() => import("@/features/settings/components/SettingsHeader"));
const ProfileSettings = dynamic(() => import("@/features/settings/components/ProfileSettings"));
const SecuritySettings = dynamic(() => import("@/features/settings/components/SecuritySettings"));
const SettingsSidebar = dynamic(() => import("@/features/settings/components/SettingsSidebar"));
const WorkspaceSettings = dynamic(() => import("@/features/settings/components/WorkspaceSettings"));
const AISettings = dynamic(() => import("@/features/settings/components/AISettings"));
const PersonalizationSettings = dynamic(() => import("@/features/settings/components/PersonalizationSettings"));
const RevenueTargetSettings = dynamic(() => import("@/features/settings/components/RevenueTargetSettings"));
import { motion, AnimatePresence } from "framer-motion";
import { CRMPageContainer } from "@/shared/components/crm";

const SettingsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sectionParam = searchParams.get("section");
  
  const activeSection = sectionParam || "profile";

  const handleSectionChange = (section: string) => {
    router.push(`/settings?section=${section}`, { scroll: false });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "profile":       return <ProfileSettings />;
      case "workspace":     return <WorkspaceSettings />;
      case "ai":            return <AISettings />;
      case "personalization": return <PersonalizationSettings />;
      case "security":      return <SecuritySettings />;
      case "targets":       return <RevenueTargetSettings />;
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
