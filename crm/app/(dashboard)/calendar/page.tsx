"use client";

import { CalendarDays } from "lucide-react";
import RoleModulePlaceholder from "@/shared/components/role/RoleModulePlaceholder";

export default function CalendarPage() {
  return (
    <RoleModulePlaceholder
      title="Calendar"
      subtitle="Manage meetings, calls, and schedule visibility by role."
      badge="Scheduling"
      icon={CalendarDays}
    />
  );
}












