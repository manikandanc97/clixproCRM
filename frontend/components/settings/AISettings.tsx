"use client";

import React from "react";
import {
  Sparkles,
  Brain,
  MessageSquare,
  Zap,
  Settings2,
  Bot,
  Lightbulb,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { CRMCard } from "@/components/shared/crm";

const aiFeatures = [
  { id: "copilot", label: "AI Copilot", desc: "Contextual help and task generation across the platform.", on: true },
  { id: "priority", label: "Smart Prioritization", desc: "Automatically rank leads and tasks by probability.", on: true },
  { id: "sentiment", label: "Sentiment Analysis", desc: "Detect customer emotions in emails and chats.", on: false },
];

const modules = [
  { id: "replies", label: "Auto-Replies", desc: "Draft smart responses based on history.", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "scoring", label: "Lead Scoring", desc: "Predict conversion using ML models.", icon: Lightbulb, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "alerts", label: "Real-time Alerts", desc: "Intelligent triggers for critical events.", icon: Radio, color: "text-orange-500", bg: "bg-orange-500/10" },
];

const AISettings = () => {
  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <CRMCard className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-purple-500/5 to-pink-500/5 border-primary/15 group">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Advanced Intelligence
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Supercharge your workflow</h2>
            <p className="text-muted-foreground max-w-md text-sm font-medium">
              Configure AI agents and smart automations to handle repetitive tasks and surface hidden opportunities.
            </p>
          </div>
          <div className="relative shrink-0">
            <motion.div
              animate={{ scale: [1, 1.04, 1], rotate: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="w-20 h-20 rounded-[var(--crm-card-radius)] bg-card border border-border shadow-[var(--crm-card-shadow)] flex items-center justify-center"
            >
              <Bot className="w-10 h-10 text-primary" />
            </motion.div>
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-md bg-emerald-500 border-2 border-card flex items-center justify-center shadow-sm">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </CRMCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Intelligence Core */}
        <CRMCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">Intelligence Core</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Enable or disable major AI components.</p>
            </div>
          </div>

          <div className="space-y-2">
            {aiFeatures.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-muted/30 border border-transparent hover:border-border/50 hover:bg-muted/50 transition-all"
              >
                <div>
                  <h4 className="font-semibold text-xs text-foreground tracking-tight">{f.label}</h4>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{f.desc}</p>
                </div>
                <Switch defaultChecked={f.on} />
              </div>
            ))}
          </div>
        </CRMCard>

        {/* Model Controls */}
        <CRMCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">Model Controls</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Fine-tune how AI interacts with your data.</p>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { label: "Model Creativity", badge: "Balanced", defaultValue: [50] },
              { label: "Automation Threshold", badge: "85% Confidence", defaultValue: [85] },
            ].map((ctrl) => (
              <div key={ctrl.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-[11px] uppercase tracking-widest text-muted-foreground">
                    {ctrl.label}
                  </Label>
                  <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                    {ctrl.badge}
                  </Badge>
                </div>
                <Slider defaultValue={ctrl.defaultValue} max={100} step={1} className="py-1" />
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest">
                  {ctrl.label === "Model Creativity"
                    ? "Lower is more deterministic, higher is more creative."
                    : "Autonomous actions trigger when confidence exceeds this level."}
                </p>
              </div>
            ))}
          </div>
        </CRMCard>

        {/* Module cards */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <CRMCard key={mod.id} className="flex flex-col gap-4">
              <div className={`w-10 h-10 rounded-lg ${mod.bg} flex items-center justify-center`}>
                <mod.icon className={`w-5 h-5 ${mod.color}`} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground tracking-tight">{mod.label}</h4>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{mod.desc}</p>
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
