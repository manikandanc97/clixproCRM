"use client";

import React from "react";
import {
  Mail,
  Bell,
  MessageSquare,
  Zap,
  Globe,
  Settings,
  Volume2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { CRMCard } from "@/shared/components/crm";

const channels = [
  { id: "email", name: "Email Digest", icon: Mail, color: "text-blue-500", bg: "bg-blue-500/10", defaultOn: true },
  { id: "push", name: "Browser Push", icon: Bell, color: "text-orange-500", bg: "bg-orange-500/10", defaultOn: true },
  { id: "slack", name: "Slack Connect", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10", defaultOn: false },
];

const categories = [
  {
    id: "system",
    title: "System",
    notifications: [
      { id: "security", title: "Security Alerts", desc: "Important account activity and login attempts.", icon: Zap, critical: true },
      { id: "product", title: "Product Updates", desc: "New features and weekly performance reports.", icon: Globe, critical: true },
    ],
  },
  {
    id: "leads",
    title: "Leads & Tasks",
    notifications: [
      { id: "new-lead", title: "New Leads", desc: "Instantly notify when a new lead enters the pipeline.", icon: Bell, critical: true },
      { id: "task-reminders", title: "Task Reminders", desc: "Upcoming task deadlines and overdue items.", icon: Settings, critical: false },
    ],
  },
  {
    id: "collaboration",
    title: "Collaboration",
    notifications: [
      { id: "mentions", title: "Mentions & Comments", desc: "When someone tags you or comments on your records.", icon: MessageSquare, critical: true },
      { id: "team-activity", title: "Team Activity", desc: "Weekly digest of team progress and goals.", icon: MessageSquare, critical: false },
    ],
  },
];

const NotificationSettings = () => {
  return (
    <div className="space-y-5">
      {/* Channel cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <CRMCard key={channel.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${channel.bg} flex items-center justify-center shrink-0`}>
                <channel.icon className={`w-4 h-4 ${channel.color}`} />
              </div>
              <Label className="font-semibold text-sm text-foreground cursor-pointer">
                {channel.name}
              </Label>
            </div>
            <Switch defaultChecked={channel.defaultOn} />
          </CRMCard>
        ))}
      </div>

      {/* Preference tabs */}
      <CRMCard>
        <div className="mb-5">
          <h3 className="text-base font-bold tracking-tight text-foreground">Notification Preferences</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Select which events you want to be notified about.
          </p>
        </div>

        <Tabs defaultValue="system">
          <TabsList className="bg-muted p-1 rounded-lg mb-5 h-9">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-md px-4 h-7 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground"
              >
                {cat.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="space-y-2 mt-0">
              {cat.notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-card border border-border/60 shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                      <notif.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold cursor-pointer text-foreground tracking-tight">
                          {notif.title}
                        </Label>
                        {notif.critical && (
                          <Badge
                            variant="outline"
                            className="rounded-md text-[8px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold uppercase tracking-widest h-4 py-0"
                          >
                            Critical
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm font-medium">
                        {notif.desc}
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked={notif.critical} />
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CRMCard>

      {/* Activity pulse CTA */}
      <CRMCard className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-foreground/[0.03] border-border/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground tracking-tight">Real-time Activity Pulse</h4>
            <p className="text-[11px] text-muted-foreground max-w-sm font-medium mt-0.5">
              Enable audio-visual pulses for critical events to keep your team motivated.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          Configure Pulse
        </Button>
      </CRMCard>
    </div>
  );
};

export default NotificationSettings;












