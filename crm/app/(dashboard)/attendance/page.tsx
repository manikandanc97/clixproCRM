"use client";

import { CalendarDays } from "lucide-react";
import RoleModulePlaceholder from "@/shared/components/role/RoleModulePlaceholder";

export default function AttendancePage() {
  return (
    <RoleModulePlaceholder
      title="Attendance"
      subtitle="Monitor daily attendance and workforce availability trends."
      badge="HR Operations"
      icon={CalendarDays}
    />
  );
}












