"use client";

import { Package } from "lucide-react";
import RoleModulePlaceholder from "@/shared/components/role/RoleModulePlaceholder";

export default function BillingPage() {
  return (
    <RoleModulePlaceholder
      title="Software License"
      subtitle="View your one-time purchase license details, activated modules, and deployment information."
      badge="Business License"
      icon={Package}
    />
  );
}












