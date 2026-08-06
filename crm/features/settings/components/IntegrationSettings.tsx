"use client";

import React, { useState } from "react";
import { CheckCircle2, Search, Settings2, Webhook, Loader2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CRMCard } from "@/shared/components/crm";
import { EmptyStateCard, PageErrorState, ComponentLoadingState } from "@/shared/components/page-states";
import { useIntegrationSettings, useUpdateIntegrationSettings } from "@/shared/hooks/use-settings";

const IntegrationSettings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, error, refetch } = useIntegrationSettings();
  const mutation = useUpdateIntegrationSettings();

  if (isLoading) {
    return <ComponentLoadingState label="Loading integrations..." />;
  }

  if (error) {
    return <PageErrorState title="Integrations unavailable" message={(error as Error).message} onRetry={() => { void refetch(); }} />;
  }

  const integrations = (data?.integrations ?? []).filter((integration) => {
    const query = searchTerm.toLowerCase();
    return integration.name.toLowerCase().includes(query) || (integration.category ?? "").toLowerCase().includes(query);
  });
  const connectedCount = integrations.filter((integration) => integration.connected).length;

  const handleToggle = (id: string, currentlyConnected: boolean) => {
    mutation.mutate({ id, connected: !currentlyConnected });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search integrations..."
            className="pl-10 rounded-lg bg-muted/30 border-border/50 h-10 text-sm focus:bg-card transition-all"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <Badge variant="outline" className="rounded-md bg-primary/5 text-primary border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            {connectedCount} Connected
          </Badge>
        </div>
      </div>

      {integrations.length === 0 ? (
        <EmptyStateCard icon={Webhook} title="No integrations configured" message="Integration records will appear when they are available from the backend." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {integrations.map((integration) => (
            <CRMCard key={integration.id} className="group h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Webhook className="w-6 h-6 text-primary" />
                </div>
                <Badge variant={integration.connected ? "default" : "outline"} className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                  {integration.connected && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {integration.connected ? "Connected" : "Available"}
                </Badge>
              </div>
              <div className="space-y-1 mb-6 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground tracking-tight">{integration.name}</h3>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{integration.category ?? "Uncategorized"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">{integration.description ?? "No description provided."}</p>
              </div>
              {integration.connected ? (
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 rounded-lg h-9 text-[10px] font-bold uppercase tracking-widest" 
                    variant="outline" 
                    onClick={() => { alert(`Opening configuration for ${integration.name}`); }}
                    disabled={mutation.isPending}
                  >
                    <Settings2 className="w-3.5 h-3.5 mr-2" />
                    Configure
                  </Button>
                  <Button 
                    className="flex-1 rounded-lg h-9 text-[10px] font-bold uppercase tracking-widest hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" 
                    variant="outline" 
                    onClick={() => handleToggle(integration.id, integration.connected)}
                    disabled={mutation.isPending}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full rounded-lg h-9 text-[10px] font-bold uppercase tracking-widest" 
                  variant="default" 
                  onClick={() => handleToggle(integration.id, integration.connected)}
                  disabled={mutation.isPending}
                >
                  Connect Integration
                </Button>
              )}
            </CRMCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntegrationSettings;
