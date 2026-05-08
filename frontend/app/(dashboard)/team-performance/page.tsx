"use client";

import { BriefcaseBusiness } from "lucide-react";
import RoleModulePlaceholder from "@/components/shared/role/RoleModulePlaceholder";

export default function TeamPerformancePage() {
  return (
    <RoleModulePlaceholder
      title="Team Performance"
      subtitle="Compare conversion outcomes and activity by team member."
      badge="Sales Management"
      icon={BriefcaseBusiness}
    />
  );
}
