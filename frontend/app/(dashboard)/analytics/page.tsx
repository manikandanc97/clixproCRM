"use client";

import { Activity } from "lucide-react";
import RoleModulePlaceholder from "@/components/shared/role/RoleModulePlaceholder";

export default function AnalyticsPage() {
  return (
    <RoleModulePlaceholder
      title="Analytics"
      subtitle="Track high-level performance metrics with role-scoped visibility."
      badge="Advanced Analytics"
      icon={Activity}
    />
  );
}
