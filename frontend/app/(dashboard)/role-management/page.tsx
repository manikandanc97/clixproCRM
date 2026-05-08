"use client";

import { ShieldCheck } from "lucide-react";
import RoleModulePlaceholder from "@/components/shared/role/RoleModulePlaceholder";

export default function RoleManagementPage() {
  return (
    <RoleModulePlaceholder
      title="Role Management"
      subtitle="Administer role assignments and permission policies."
      badge="Security"
      icon={ShieldCheck}
    />
  );
}
