"use client";

import React from "react";
import { Bot, Brain, Settings2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { CRMCard } from "@/shared/components/crm";
import { EmptyStateCard, PageErrorState, PageLoadingState } from "@/shared/components/page-states";
import { useAiSettings } from "@/shared/hooks/use-settings";

const AISettings = () => {
  const { data, isLoading, error, refetch } = useAiSettings();

  if (isLoading) {
    return <PageLoadingState label="Loading AI settings..." />;
  }

  if (error) {
    return <PageErrorState title="AI settings unavailable" message={(error as Error).message} onRetry={() => { void refetch(); }} />;
  }

  const features = data?.features ?? [];
  const modules = data?.modules ?? [];
  const controls = data?.controls ?? [];

  return (
    <div className="space-y-5">
      <CRMCard className="relative overflow-hidden border-primary/15 group">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Brain className="w-3 h-3" />
              AI Configuration
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Backend-driven intelligence settings</h2>
            <p className="text-muted-foreground max-w-md text-sm font-medium">
              AI features, modules, and controls are rendered only from API data.
            </p>
          </div>
          <div className="w-20 h-20 rounded-xl bg-card border border-border shadow-[var(--crm-card-shadow)] flex items-center justify-center">
            <Bot className="w-10 h-10 text-primary" />
          </div>
        </div>
      </CRMCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CRMCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-bold tracking-tight text-foreground">Intelligence Core</h3>
          </div>
          {features.length === 0 ? (
            <EmptyStateCard title="No AI features" message="AI feature settings will appear when the backend provides them." />
          ) : (
            <div className="space-y-2">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3.5 rounded-lg bg-muted/30 border border-transparent hover:border-border/50">
                  <div>
                    <h4 className="font-semibold text-xs text-foreground tracking-tight">{feature.label}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{feature.description ?? "No description provided."}</p>
                  </div>
                  <Switch checked={feature.enabled} />
                </div>
              ))}
            </div>
          )}
        </CRMCard>

        <CRMCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-bold tracking-tight text-foreground">Model Controls</h3>
          </div>
          {controls.length === 0 ? (
            <EmptyStateCard title="No model controls" message="Model controls will appear when they are configured in the backend." />
          ) : (
            <div className="space-y-6">
              {controls.map((control) => (
                <div key={control.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-[11px] uppercase tracking-widest text-muted-foreground">{control.label}</Label>
                    {control.badge && <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">{control.badge}</Badge>}
                  </div>
                  <Slider value={[control.value]} max={100} step={1} className="py-1" />
                </div>
              ))}
            </div>
          )}
        </CRMCard>

        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modules.length === 0 ? (
            <div className="sm:col-span-3">
              <EmptyStateCard title="No AI modules" message="AI modules will appear when module records are available from the backend." />
            </div>
          ) : modules.map((module) => (
            <CRMCard key={module.id} className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground tracking-tight">{module.label}</h4>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{module.description ?? "No description provided."}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-auto">Configure</Button>
            </CRMCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AISettings;
