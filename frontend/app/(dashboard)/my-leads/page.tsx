"use client";

import { Users } from "lucide-react";
import RoleModulePlaceholder from "@/components/shared/role/RoleModulePlaceholder";

export default function MyLeadsPage() {
  return (
    <RoleModulePlaceholder
      title="My Leads"
      subtitle="Work only on assigned opportunities and follow-up priorities."
      badge="Assigned Pipeline"
      icon={Users}
    />
  );
}
