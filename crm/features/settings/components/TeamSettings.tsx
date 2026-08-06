"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Mail,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { motion } from "framer-motion";
import { CRMCard } from "@/shared/components/crm";

import { useEmployees } from "@/shared/hooks/use-hrm";
import { ComponentLoadingState } from "@/shared/components/page-states";

const TeamSettings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: hrmData, isLoading: loading } = useEmployees();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  
  const members = hrmData?.employees || [];

  if (loading) {
    return <ComponentLoadingState label="Loading team structure..." />;
  }

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = () => {
    if (!inviteEmail) return;
    alert(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
    setIsInviteOpen(false);
    setInviteEmail("");
    setInviteRole("editor");
  };

  const handleChangeRole = (id: string) => {
    alert(`Change role dialog for user ${id}`);
  };

  const handleResend = (id: string) => {
    alert(`Invitation resent to user ${id}`);
  };

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the team?`)) {
      alert(`User ${name} removed.`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Members card */}
      <CRMCard noPadding>
        {/* Card header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--crm-border-subtle)]">
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground">Team Members</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Manage your team and workspace permissions.
            </p>
          </div>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] rounded-xl border-border shadow-[var(--crm-card-hover-shadow)]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold tracking-tight">Invite a Teammate</DialogTitle>
                <DialogDescription className="text-sm font-medium">
                  Send an email invitation to join your workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="name@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-9 h-10 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Workspace Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="h-10 rounded-lg border-border/60 bg-muted/30 text-sm font-medium">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="admin" className="text-xs font-medium">Admin (Full Control)</SelectItem>
                      <SelectItem value="editor" className="text-xs font-medium">Editor (Can edit records)</SelectItem>
                      <SelectItem value="viewer" className="text-xs font-medium">Viewer (Read-only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full" size="lg" onClick={handleInvite} disabled={!inviteEmail}>Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search + avatars */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--crm-border-subtle)]">
          <div className="relative flex-1 max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search team..."
              className="pl-9 h-9 rounded-lg border-border/60 bg-muted/30 focus:bg-card focus:border-primary/30 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex -space-x-2 ml-auto">
            {members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="border-2 border-card w-7 h-7 rounded-lg shadow-sm">
                <AvatarImage src={""} />
                <AvatarFallback className="text-[9px] font-bold bg-muted">{member.name[0]}</AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <div className="w-7 h-7 rounded-lg bg-muted border-2 border-card flex items-center justify-center text-[9px] font-bold text-muted-foreground shadow-sm">
                +{members.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Member list */}
        <div className="divide-y divide-[var(--crm-border-subtle)]">
          {filtered.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 rounded-lg border border-border shadow-sm">
                  <AvatarImage src={""} />
                  <AvatarFallback className="text-xs font-bold bg-muted">{member.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground text-sm tracking-tight">{member.name}</h4>
                    {member.status === "pending" && (
                      <Badge
                        variant="outline"
                        className="rounded-md text-[8px] uppercase font-bold py-0 h-4 bg-warning/10 text-warning border-warning/20 tracking-widest"
                      >
                        Pending
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <Badge
                    variant="outline"
                    className="rounded-md bg-muted/50 text-muted-foreground border-border text-[9px] font-bold uppercase tracking-widest"
                  >
                    {member.role}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-44 p-1.5 shadow-elevated border-border">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                      Member Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem className="text-xs font-medium rounded-lg cursor-pointer" onClick={() => handleChangeRole(member.id)}>Change Role</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs font-medium rounded-lg cursor-pointer" onClick={() => handleResend(member.id)}>Resend Invitation</DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem className="text-xs font-bold text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer" onClick={() => handleRemove(member.id, member.name)}>
                      Remove from Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      </CRMCard>
    </div>
  );
};

export default TeamSettings;












