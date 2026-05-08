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
  Sidebar,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CRMCard } from "@/components/shared/crm";

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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Appearance Section */}
        <CRMCard>
          <div className="mb-5">
            <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              Interface Theme
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Choose how ClientRise looks on your screen.</p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", icon: Sun, label: "Light" },
                { id: "dark", icon: Moon, label: "Dark" },
                { id: "system", icon: Monitor, label: "System" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2.5 p-3 rounded-xl border-2 transition-all group",
                    theme === t.id 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <t.icon className={cn(
                    "w-5 h-5 transition-colors",
                    theme === t.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    theme === t.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Accent Color</Label>
              <div className="flex flex-wrap gap-2.5">
                {accentColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedAccent(color.name)}
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-sm",
                      color.value,
                      selectedAccent === color.name && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                    )}
                  >
                    {selectedAccent === color.name && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CRMCard>

        {/* Workspace Layout Section */}
        <CRMCard>
          <div className="mb-5">
            <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layout className="w-4 h-4 text-primary" />
              Navigation & Layout
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Optimize your workspace for focus and speed.</p>
          </div>
          
          <div className="space-y-2">
            {[
              { id: "sidebar", title: "Compact Sidebar", desc: "Maximize your working area.", icon: Sidebar, active: false },
              { id: "width", title: "Full Width Mode", desc: "Expand content to fill the screen.", icon: Maximize2, active: true },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground tracking-tight">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
                {item.active ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-md px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">Active</Badge>
                ) : (
                  <Button variant="ghost" size="sm" className="h-7 text-[8px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">Enable</Button>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center">
                  <Type className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground tracking-tight">Font Scaling</h4>
                  <p className="text-[10px] text-muted-foreground font-medium">Adjust text size for readability.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-card/50 rounded-md p-1 border border-border/50">
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary">-</Button>
                <span className="text-[10px] font-bold w-7 text-center">100%</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary">+</Button>
              </div>
            </div>
          </div>
        </CRMCard>

        {/* Dashboard Customization Preview */}
        <CRMCard className="md:col-span-2 relative overflow-hidden bg-foreground/[0.02] border-border/40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <Badge className="bg-primary/10 text-primary border-none rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest">Coming Soon</Badge>
              <h2 className="text-2xl font-black tracking-tight text-foreground">Widget Marketplace</h2>
              <p className="text-muted-foreground max-w-sm text-sm font-medium">
                Drag and drop custom analytics widgets, heatmaps, and activity pulses to build your perfect command center.
              </p>
              <Button size="lg" className="px-8 font-bold rounded-lg h-11 text-xs">
                Join Waitlist
              </Button>
            </div>
            
            <div className="relative w-full md:w-80 aspect-video bg-card rounded-xl border border-border/60 p-4 overflow-hidden shadow-premium">
               <div className="grid grid-cols-2 gap-2 h-full opacity-40">
                  <div className="bg-muted rounded-lg animate-pulse" />
                  <div className="bg-muted rounded-lg animate-pulse delay-75" />
                  <div className="bg-muted rounded-lg animate-pulse delay-150 col-span-2" />
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <Palette className="w-10 h-10 text-primary/40 animate-bounce" />
               </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/5 blur-[80px] rounded-full" />
        </CRMCard>
      </div>
    </div>
  );
};

export default PersonalizationSettings;
