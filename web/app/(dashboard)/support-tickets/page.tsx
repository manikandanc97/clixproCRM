"use client";

import { Ticket } from "lucide-react";
import RoleModulePlaceholder from "@/shared/components/role/RoleModulePlaceholder";

export default function SupportTicketsPage() {
  return (
    <RoleModulePlaceholder
      title="Support Tickets"
      subtitle="Track, prioritize, and resolve customer support requests."
      badge="Support Desk"
      icon={Ticket}
    />
  );
}












