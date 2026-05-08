"use client";

import { User, Mail, ShieldCheck, Camera, CheckCircle2, Globe, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchCurrentUser } from "@/lib/api/auth";
import { useApiResource } from "@/hooks/use-api-resource";
import { motion } from "framer-motion";

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
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Avatar className="w-24 h-24 rounded-2xl border-4 border-slate-50 dark:border-slate-800 shadow-md overflow-hidden">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon-xs" className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-md text-slate-500 dark:text-slate-200 hover:text-primary transition-all">
                  <Camera className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div>
                <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {user?.name || "User Name"}
                  </h2>
                  <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-100 border-none rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                    Verified Account
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Globe className="w-3.5 h-3.5" />
                  San Francisco, CA
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {formatRole(user?.role)}
                </div>
              </div>
            </div>

            <div className="shrink-0">
               <Button variant="outline" size="sm">
                 View Public Profile
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-bold tracking-tight">Personal Details</CardTitle>
          <CardDescription className="text-xs font-medium">Update your personal information and how it's displayed.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground ml-1">Display Name</Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input defaultValue={user?.name || ""} className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-900 pl-10 py-5 rounded-xl transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input defaultValue={user?.email || ""} className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-900 pl-10 py-5 rounded-xl transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground ml-1">Phone Number</Label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input placeholder="+1 (555) 000-0000" className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-900 pl-10 py-5 rounded-xl transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground ml-1">Workspace Role</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={formatRole(user?.role)} readOnly className="bg-slate-100/50 dark:bg-slate-800/30 border-transparent pl-10 py-5 rounded-xl cursor-not-allowed italic text-slate-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Widget */}
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Profile Completion</h4>
            <p className="text-[11px] text-muted-foreground font-medium">Your profile is 85% complete. Add a phone number to reach 100%.</p>
          </div>
        </div>
        <div className="hidden md:block w-32">
           <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
             <div className="w-[85%] h-full bg-primary" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
