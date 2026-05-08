"use client";

import React from "react";
import { 
  Mail, 
  Bell, 
  MessageSquare, 
  Zap,
  Globe,
  Settings,
  Circle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  {
    id: "system",
    title: "System & Product",
    notifications: [
      { id: "security", title: "Security Alerts", desc: "Important account activity and login attempts.", icon: Zap, default: true },
      { id: "product", title: "Product Updates", desc: "New features and weekly performance reports.", icon: Globe, default: true },
    ]
  },
  {
    id: "leads",
    title: "Leads & Tasks",
    notifications: [
      { id: "new-lead", title: "New Leads", desc: "Instantly notify when a new lead enters the pipeline.", icon: Bell, default: true },
      { id: "task-reminders", title: "Task Reminders", desc: "Upcoming task deadlines and overdue items.", icon: Settings, default: false },
    ]
  },
  {
    id: "collaboration",
    title: "Collaboration",
    notifications: [
      { id: "mentions", title: "Mentions & Comments", desc: "When someone tags you or comments on your records.", icon: MessageSquare, default: true },
      { id: "team-activity", title: "Team Activity", desc: "Weekly digest of team progress and goals.", icon: MessageSquare, default: false },
    ]
  }
];

const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      {/* Channels Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: "email", name: "Email", icon: Mail, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { id: "push", name: "Browser Push", icon: Bell, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
          { id: "slack", name: "Slack Connect", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((channel) => (
          <Card key={channel.id} className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden group border border-slate-200/60">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${channel.bg} flex items-center justify-center`}>
                  <channel.icon className={`w-4 h-4 ${channel.color}`} />
                </div>
                <Label className="font-bold text-xs tracking-tight">{channel.name}</Label>
              </div>
              <Switch defaultChecked={channel.id !== 'slack'} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-200/60">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-bold tracking-tight">Notification Preferences</CardTitle>
          <CardDescription className="text-xs">Select which events you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Tabs defaultValue="system" className="w-full">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-6">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="rounded-md px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-[11px] font-bold uppercase tracking-widest">
                  {cat.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="space-y-2">
                {cat.notifications.map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <notif.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-bold cursor-pointer tracking-tight">{notif.title}</Label>
                          {notif.default && <Badge variant="secondary" className="rounded-md text-[8px] bg-emerald-100 text-emerald-600 border-none font-bold uppercase tracking-widest">Critical</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm font-medium">{notif.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Preview</span>
                        <div className="flex gap-1">
                           <Circle className="w-1.5 h-1.5 fill-primary text-primary" />
                           <Circle className="w-1.5 h-1.5 text-slate-200" />
                           <Circle className="w-1.5 h-1.5 text-slate-200" />
                        </div>
                      </div>
                      <Switch defaultChecked={notif.default} />
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Real-time pulse preview */}
      <div className="p-6 rounded-xl bg-slate-900 text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-bold tracking-tight">Real-time Activity Pulse</h4>
            <p className="text-[11px] text-slate-400 max-w-sm font-medium">
              Enable real-time audio-visual pulses for critical events to keep your team motivated.
            </p>
          </div>
          <Button className="rounded-lg h-10 px-6 text-[10px] font-bold uppercase tracking-widest bg-white text-slate-900 hover:bg-slate-100">
            Configure Pulse
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
