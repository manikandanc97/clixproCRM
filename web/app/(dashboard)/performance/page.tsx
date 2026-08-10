"use client";

import { BarChart3 } from "lucide-react";
import RoleModulePlaceholder from "@/shared/components/role/RoleModulePlaceholder";

export default function PerformancePage() {
  return (
    <RoleModulePlaceholder
      title="Performance"
      subtitle="Review competency and objective performance metrics."
      badge="HR Analytics"
      icon={BarChart3}
    />
  );
}












