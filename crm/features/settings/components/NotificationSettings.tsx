"use client";

import React from "react";
import { Bell, MessageSquare, Volume2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { CRMCard } from "@/shared/components/crm";
import { EmptyStateCard, PageErrorState, PageLoadingState } from "@/shared/components/page-states";
import { useNotificationSettings } from "@/shared/hooks/use-settings";

const NotificationSettings = () => {
  const { data, isLoading, error, refetch } = useNotificationSettings();

  if (isLoading) {
    return <PageLoadingState label="Loading notification settings..." />;
  }

  if (error) {
    return <PageErrorState title="Notification settings unavailable" message={(error as Error).message} onRetry={() => { void refetch(); }} />;
  }

  const channels = data?.channels ?? [];
  const categories = data?.categories ?? [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {channels.length === 0 ? (
          <div className="sm:col-span-3">
            <EmptyStateCard title="No notification channels" message="Notification channels will appear when they are configured in the backend." />
          </div>
        ) : channels.map((channel) => (
          <CRMCard key={channel.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <Label className="font-semibold text-sm text-foreground cursor-pointer">{channel.name}</Label>
            </div>
            <Switch checked={channel.enabled} />
          </CRMCard>
        ))}
      </div>

      <CRMCard>
        <div className="mb-5">
          <h3 className="text-base font-bold tracking-tight text-foreground">Notification Preferences</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Preferences are rendered from backend configuration.</p>
        </div>

        {categories.length === 0 ? (
          <EmptyStateCard title="No notification preferences" message="Preference categories will appear when backend records exist." />
        ) : (
          <Tabs defaultValue={categories[0].id}>
            <TabsList className="bg-muted p-1 rounded-lg mb-5 h-9">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="rounded-md px-4 h-7 text-[11px] font-bold uppercase tracking-widest">
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-2 mt-0">
                {category.notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50 group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-card border border-border/60 shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-semibold cursor-pointer text-foreground tracking-tight">{notification.title}</Label>
                          {notification.critical && <Badge variant="outline" className="rounded-md text-[8px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold uppercase tracking-widest h-4 py-0">Critical</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm font-medium">{notification.description ?? "No description provided."}</p>
                      </div>
                    </div>
                    <Switch checked={notification.enabled} />
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CRMCard>

      <CRMCard className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-foreground/[0.03] border-border/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground tracking-tight">Real-time Activity Pulse</h4>
            <p className="text-[11px] text-muted-foreground max-w-sm font-medium mt-0.5">
              {data?.realtimePulseEnabled ? "Enabled from backend settings." : "Disabled or not configured."}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0">Configure Pulse</Button>
      </CRMCard>
    </div>
  );
};

export default NotificationSettings;
