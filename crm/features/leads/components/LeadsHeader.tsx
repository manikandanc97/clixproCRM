"use client";

import { Plus, Download, Filter, Search, Users } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";

export const LeadsHeader = () => {
  const handleAddLead = () => {
    toast.info("Add Lead Modal", {
      description: "Opening the lead creation interface.",
    });
  };

  return (
    <PageHeader
      title="Leads Management"
      subtitle="Track, qualify and convert your business opportunities with AI-driven intelligence."
      icon={Users}
      badge="Lead Center"
      actions={[
        {
          label: "Filter",
          icon: Filter,
          onClick: () => {},
          variant: "outline",
        },
        {
          label: "Export",
          icon: Download,
          onClick: () => {},
          variant: "outline",
        },
        {
          label: "Add Lead",
          icon: Plus,
          onClick: handleAddLead,
          variant: "default",
        },
      ]}
    >
      <div className="relative w-full max-w-sm mr-4 hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search leads..." 
          className="pl-10 h-10 rounded-xl bg-card border-border shadow-sm focus:ring-primary/20" 
        />
      </div>
    </PageHeader>
  );
};





