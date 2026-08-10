"use client";

import { useState, useMemo } from "react";
import { User, Mail, ShieldCheck, CheckCircle2, Phone, Save, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useAuth } from "@/features/auth/components/auth-provider";
import { motion } from "framer-motion";
import { CRMCard } from "@/shared/components/crm";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/shared/lib/api/auth";

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
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  
  const avatarPreview = null;

  const initials = getInitials(user?.name);
  
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      refreshUser();
    }
  });

  const completion = useMemo(() => {
    let score = 0;
    if (user?.name) score += 30;
    if (user?.email) score += 30;
    if (user?.role) score += 20;
    if (user?.phone) score += 20;
    return score;
  }, [user]);


  const handleSave = () => {
    mutation.mutate(formData);
  };

  const hasChanges = formData.name !== user?.name || formData.email !== user?.email || formData.phone !== (user?.phone || "");

  return (
    <div className="space-y-5">
      {/* Profile Identity Card */}
      <CRMCard>
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <div className="relative group shrink-0">
            <motion.div className="relative">
              <Avatar className="w-20 h-20 rounded-xl border-2 border-border shadow-sm overflow-hidden">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </motion.div>
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {user?.name || "User Name"}
                </h2>
                {completion === 100 && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                {formatRole(user?.role)}
              </div>
            </div>
          </div>
        </div>
      </CRMCard>

      {/* Personal Details */}
      <CRMCard>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground">Personal Details</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Update your personal information and how it&apos;s displayed.
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={!hasChanges || mutation.isPending}
            className="flex items-center gap-2"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Display Name</Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@company.com"
                className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Phone Number</Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
                className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Workspace Role</Label>
            <div className="relative group">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors" />
              <Input
                value={formatRole(user?.role)}
                readOnly
                className="pl-9 h-10 rounded-lg border-border/60 cursor-not-allowed text-muted-foreground italic bg-muted/50"
              />
            </div>
          </div>
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
              Your profile is {completion}% complete.{completion < 100 ? " Add missing details to reach 100%." : ""}
            </p>
          </div>
        </div>
        <div className="hidden md:block w-28 shrink-0">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="bg-primary rounded-full h-full transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
          <p className="text-right text-[9px] font-bold text-primary mt-1">{completion}%</p>
        </div>
      </CRMCard>
    </div>
  );
};

export default ProfileSettings;












