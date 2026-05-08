"use client";

import { Lightbulb } from "lucide-react";
import RoleModulePlaceholder from "@/components/shared/role/RoleModulePlaceholder";

export default function AiInsightsPage() {
  return (
    <RoleModulePlaceholder
      title="AI Insights"
      subtitle="Role-aware AI recommendations for forecasting and productivity."
      badge="AI Intelligence"
      icon={Lightbulb}
    />
  );
}
