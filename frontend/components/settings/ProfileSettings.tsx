"use client";

import { User, Mail, ShieldCheck, Camera, CheckCircle2, Globe, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchCurrentUser } from "@/lib/api/auth";
import { useApiResource } from "@/hooks/use-api-resource";
import { motion } from "framer-motion";
import { CRMCard } from "@/components/shared/crm";

function formatRole(role?: string) {
  if (!role) return "";
  return role
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getInitials(name?: string) {
  if (!name) return "CR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

const ProfileSettings = () => {
  const { data: user } = useApiResource(fetchCurrentUser);
  const initials = getInitials(user?.name);

  return (
    <div className="space-y-5">
      {/* Profile Identity Card */}
      <CRMCard>
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <div className="relative group shrink-0">
            <motion.div whileHover={{ scale: 1.02 }} className="relative">
              <Avatar className="w-20 h-20 rounded-[var(--crm-card-radius)] border-2 border-border shadow-sm overflow-hidden">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg shadow-sm border-border bg-card text-muted-foreground hover:text-primary transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {user?.name || "User Name"}
                </h2>
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                <Globe className="w-3 h-3" />
                San Francisco, CA
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                {formatRole(user?.role)}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Button variant="outline" size="sm">View Public Profile</Button>
          </div>
        </div>
      </CRMCard>

      {/* Personal Details */}
      <CRMCard>
        <div className="mb-5">
          <h3 className="text-base font-bold tracking-tight text-foreground">Personal Details</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Update your personal information and how it's displayed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Display Name", icon: User, defaultValue: user?.name || "", placeholder: "Full name" },
            { label: "Email Address", icon: Mail, defaultValue: user?.email || "", placeholder: "email@company.com" },
            { label: "Phone Number", icon: Phone, defaultValue: "", placeholder: "+1 (555) 000-0000" },
            { label: "Workspace Role", icon: ShieldCheck, defaultValue: formatRole(user?.role), placeholder: "", readOnly: true },
          ].map((field) => (
            <div key={field.label} className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">{field.label}</Label>
              <div className="relative group">
                <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  defaultValue={field.defaultValue}
                  placeholder={field.placeholder}
                  readOnly={field.readOnly}
                  className={`pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all ${
                    field.readOnly ? "cursor-not-allowed text-muted-foreground italic bg-muted/50" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </CRMCard>

      {/* Completion Widget */}
      <CRMCard className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm tracking-tight">Profile Completion</h4>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Your profile is 85% complete. Add a phone number to reach 100%.
            </p>
          </div>
        </div>
        <div className="hidden md:block w-28 shrink-0">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="w-[85%] h-full bg-primary rounded-full" />
          </div>
          <p className="text-right text-[9px] font-bold text-primary mt-1">85%</p>
        </div>
      </CRMCard>
    </div>
  );
};

export default ProfileSettings;
