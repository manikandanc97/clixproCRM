"use client";

import React, { useState } from "react";
import { 
  Palette, 
  Moon, 
  Sun, 
  Monitor, 
  Layout, 
  Type, 
  Maximize2, 
  CheckCircle2,
  Sidebar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const accentColors = [
  { name: "Default", value: "bg-emerald-600" },
  { name: "Indigo", value: "bg-indigo-600" },
  { name: "Blue", value: "bg-blue-600" },
  { name: "Purple", value: "bg-purple-600" },
  { name: "Pink", value: "bg-pink-600" },
  { name: "Orange", value: "bg-orange-600" },
];

const PersonalizationSettings = () => {
  const { theme, setTheme } = useTheme();
  const [selectedAccent, setSelectedAccent] = useState("Default");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance Section */}
        <Card className="border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-500" />
              Interface Theme
            </CardTitle>
            <CardDescription>Choose how ClientRise looks on your screen.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "light", icon: Sun, label: "Light" },
                { id: "dark", icon: Moon, label: "Dark" },
                { id: "system", icon: Monitor, label: "System" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all group",
                    theme === t.id 
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                  )}
                >
                  <t.icon className={cn(
                    "w-6 h-6 transition-colors",
                    theme === t.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className={cn(
                    "text-xs font-bold",
                    theme === t.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accent Color</Label>
              <div className="flex flex-wrap gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedAccent(color.name)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110",
                      color.value,
                      selectedAccent === color.name && "ring-4 ring-offset-4 ring-offset-white dark:ring-offset-slate-950 ring-primary"
                    )}
                  >
                    {selectedAccent === color.name && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Layout Section */}
        <Card className="border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-500" />
              Navigation & Layout
            </CardTitle>
            <CardDescription>Optimize your workspace for focus and speed.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Sidebar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Compact Sidebar</h4>
                  <p className="text-xs text-muted-foreground">Maximize your working area.</p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-lg cursor-pointer hover:bg-primary hover:text-white transition-colors">Enable</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Full Width Mode</h4>
                  <p className="text-xs text-muted-foreground">Expand content to fill the screen.</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-100 rounded-lg">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Type className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Font Scaling</h4>
                  <p className="text-xs text-muted-foreground">Adjust text size for readability.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-xs">-</Button>
                <span className="text-xs font-bold w-8 text-center">100%</span>
                <Button variant="ghost" size="icon-xs">+</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Customization Preview */}
        <Card className="md:col-span-2 border-none bg-slate-900 text-white rounded-2xl overflow-hidden relative group shadow-2xl">
          <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <Badge className="bg-blue-500 text-white rounded-lg">Coming Soon</Badge>
              <h2 className="text-3xl font-extrabold tracking-tight">Widget Marketplace</h2>
              <p className="text-slate-400 max-w-md">
                Drag and drop custom analytics widgets, heatmaps, and activity pulses to build your perfect command center.
              </p>
              <Button size="lg" variant="secondary" className="px-8 font-bold bg-white text-slate-900 hover:bg-slate-100">
                Join Waitlist
              </Button>
            </div>
            <div className="relative w-full md:w-1/3 aspect-video bg-slate-800 rounded-xl border border-slate-700 p-4 overflow-hidden">
               <div className="grid grid-cols-2 gap-2 h-full opacity-50">
                  <div className="bg-slate-700 rounded-lg animate-pulse" />
                  <div className="bg-slate-700 rounded-lg animate-pulse delay-75" />
                  <div className="bg-slate-700 rounded-lg animate-pulse delay-150 col-span-2" />
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <Palette className="w-12 h-12 text-blue-500 animate-bounce" />
               </div>
            </div>
          </CardContent>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full" />
        </Card>
      </div>
    </div>
  );
};

export default PersonalizationSettings;
