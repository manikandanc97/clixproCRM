"use client";

import { UserSquare2 } from "lucide-react";
import RoleModulePlaceholder from "@/components/shared/role/RoleModulePlaceholder";

export default function EmployeesPage() {
  return (
    <RoleModulePlaceholder
      title="Employees"
      subtitle="Centralized employee records and lifecycle management."
      badge="People Ops"
      icon={UserSquare2}
    />
  );
}
