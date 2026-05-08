"use client";

import type { LucideIcon } from "lucide-react";
import { LockKeyhole } from "lucide-react";
import { CRMPageContainer, CRMPageHeader } from "@/components/shared/crm";

type RoleModulePlaceholderProps = {
  title: string;
  subtitle: string;
  badge: string;
  icon: LucideIcon;
};

export default function RoleModulePlaceholder({
  title,
  subtitle,
  badge,
  icon,
}: RoleModulePlaceholderProps) {
  return (
    <CRMPageContainer>
      <CRMPageHeader title={title} subtitle={subtitle} icon={icon} badge={badge} />
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LockKeyhole className="h-5 w-5 text-primary" />
        </div>
        <p className="font-semibold text-foreground">Module scaffold ready</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This module is role-enabled and available for incremental backend feature integration.
        </p>
      </div>
    </CRMPageContainer>
  );
}
