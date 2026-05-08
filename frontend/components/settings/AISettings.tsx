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
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const AISettings = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50 dark:border-indigo-500/20 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Advanced Intelligence
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Supercharge your workflow</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md text-sm font-medium">
              Configure your AI agents and smart automations to handle repetitive tasks and surface hidden opportunities.
            </p>
          </div>
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="w-24 h-24 rounded-lg bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center"
            >
              <Bot className="w-12 h-12 text-indigo-500" />
            </motion.div>
            <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-md bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Core AI Controls */}
        <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-200/60">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              Intelligence Core
            </CardTitle>
            <CardDescription className="text-xs">Enable or disable major AI components.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-transparent hover:border-slate-100 transition-all">
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs">AI Copilot</h4>
                <p className="text-[10px] text-muted-foreground font-medium">Contextual help and task generation across the platform.</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-transparent hover:border-slate-100 transition-all">
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs">Smart Prioritization</h4>
                <p className="text-[10px] text-muted-foreground font-medium">Automatically rank leads and tasks by probability.</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-transparent hover:border-slate-100 transition-all">
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs">Sentiment Analysis</h4>
                <p className="text-[10px] text-muted-foreground font-medium">Detect customer emotions in emails and chats.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Automation Sensitivity */}
        <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-200/60">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-purple-500" />
              Model Controls
            </CardTitle>
            <CardDescription className="text-xs">Fine-tune how AI interacts with your data.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-[11px] uppercase tracking-widest text-slate-500">Model Creativity</Label>
                <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">Balanced</Badge>
              </div>
              <Slider defaultValue={[50]} max={100} step={1} className="py-2" />
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Lower is more deterministic, higher is more creative.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-[11px] uppercase tracking-widest text-slate-500">Automation Threshold</Label>
                <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">85% Confidence</Badge>
              </div>
              <Slider defaultValue={[85]} max={100} step={1} className="py-2" />
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Autonomous actions when confidence is above this level.</p>
            </div>
          </CardContent>
        </Card>

        {/* Specific Modules */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <CardContent className="p-5 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Auto-Replies</h4>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Draft smart responses based on history.</p>
              </div>
              <Button variant="outline" className="w-full rounded-md h-9 border-slate-200 text-[10px] font-bold uppercase tracking-widest">Configure</Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <CardContent className="p-5 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Lead Scoring</h4>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Predict conversion using ML models.</p>
              </div>
              <Button variant="outline" className="w-full rounded-md h-9 border-slate-200 text-[10px] font-bold uppercase tracking-widest">Configure</Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <CardContent className="p-5 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <Radio className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Real-time Alerts</h4>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Intelligent triggers for critical events.</p>
              </div>
              <Button variant="outline" className="w-full rounded-md h-9 border-slate-200 text-[10px] font-bold uppercase tracking-widest">Configure</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
