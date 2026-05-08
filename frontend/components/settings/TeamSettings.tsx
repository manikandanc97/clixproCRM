"use client";

import React, { useState } from "react";
import { 
  UserPlus, 
  Mail, 
  Shield, 
  MoreHorizontal, 
  Search,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const members = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@clientrise.io",
    role: "Admin",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah@clientrise.io",
    role: "Editor",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: 3,
    name: "Michael Ross",
    email: "mike@clientrise.io",
    role: "Viewer",
    status: "Pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
  },
];

const TeamSettings = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <Card className="border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
        <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Team Members</CardTitle>
            <CardDescription className="text-xs font-medium">Manage your team and their workspace permissions.</CardDescription>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-slate-200 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight">Invite a Teammate</DialogTitle>
                <DialogDescription className="text-sm font-medium">
                  Send an email invitation to join your workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="name@company.com" className="pl-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all h-10 text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Workspace Role</Label>
                  <Select defaultValue="editor">
                    <SelectTrigger className="rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white h-10 text-sm font-medium">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="admin" className="text-xs font-medium">Admin (Full Control)</SelectItem>
                      <SelectItem value="editor" className="text-xs font-medium">Editor (Can edit records)</SelectItem>
                      <SelectItem value="viewer" className="text-xs font-medium">Viewer (Read-only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full" size="lg">Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent className="p-6 pt-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search team..." 
                className="pl-10 rounded-xl bg-slate-50/50 border-slate-100 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex -space-x-2">
              {members.map((member) => (
                <Avatar key={member.id} className="border-2 border-white dark:border-slate-900 w-8 h-8 rounded-lg shadow-sm">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-[10px] font-bold">{member.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold shadow-sm">
                +12
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 rounded-xl border border-white shadow-sm">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs font-bold">{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 tracking-tight">
                      {member.name}
                      {member.status === "Pending" && (
                        <Badge variant="secondary" className="rounded-lg text-[8px] uppercase font-bold py-0 h-4 bg-orange-100 text-orange-600 border-orange-200 tracking-widest">
                          Pending
                        </Badge>
                      )}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-medium">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <Badge variant="outline" className="rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-[9px] font-bold uppercase tracking-widest">
                      {member.role}
                    </Badge>
                    <p className="text-[9px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">Joined 2m ago</p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" className="text-slate-400 hover:text-slate-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl w-44 p-1.5 shadow-xl border-slate-200">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1.5">Member Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem className="text-xs font-medium rounded-lg cursor-pointer">Change Role</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs font-medium rounded-lg cursor-pointer">Resend Invitation</DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem className="text-xs font-bold text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer">
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roles & Permissions Hint */}
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-primary mb-1 flex items-center gap-2 text-sm tracking-tight">
            Enterprise Permissions
            <Badge className="bg-primary text-white text-[8px] font-bold uppercase tracking-widest rounded-lg">Beta</Badge>
          </h4>
          <p className="text-xs text-primary/70 font-medium">
            Create custom roles with granular permissions for specific modules. 
            <Button variant="link" className="p-0 h-auto text-xs text-primary font-bold ml-1 decoration-primary/30">
              Configure RBAC <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;
