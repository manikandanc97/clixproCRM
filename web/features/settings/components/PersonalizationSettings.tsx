"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { useTheme } from "next-themes";
import { cn } from "@/shared/lib/utils";
import { CRMCard } from "@/shared/components/crm";
import { useSettings, type AccentColor } from "@/features/dashboard/components/SettingsContext";
import { ClixProLogo } from "@/shared/ui/logo";

const accentColors: { name: string; id: AccentColor; value: string }[] = [
  { name: "Emerald", id: "emerald", value: "bg-emerald-600" },
  { name: "Blue", id: "blue", value: "bg-blue-600" },
  { name: "Indigo", id: "indigo", value: "bg-indigo-600" },
  { name: "Violet", id: "violet", value: "bg-violet-600" },
  { name: "Purple", id: "purple", value: "bg-purple-600" },
  { name: "Red", id: "red", value: "bg-red-600" },
  { name: "Teal", id: "teal", value: "bg-teal-600" },
  { name: "Cyan", id: "cyan", value: "bg-cyan-600" },
  { name: "Amber", id: "amber", value: "bg-amber-600" },
  { name: "Rose", id: "rose", value: "bg-rose-600" },
];

const googleFonts = [
  { label: "Inter", id: "inter" },
  { label: "Roboto", id: "roboto" },
  { label: "Poppins", id: "poppins" },
  { label: "Plus Jakarta", id: "jakarta" },
  { label: "Outfit", id: "outfit" },
  { label: "Space Grotesk", id: "space" },
  { label: "Lora (Serif)", id: "lora" },
  { label: "Fira Code (Mono)", id: "fira" },
];

const PersonalizationSettings = () => {
  const { theme, setTheme } = useTheme();
  const { accentColor, setAccentColor, fontFamily, setFontFamily } = useSettings();
  
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [fullWidth, setFullWidth] = useState(true);

  // Load from local storage for persistence
  useEffect(() => {
    const savedCompact = localStorage.getItem("crm-compact-sidebar");
    if (savedCompact && compactSidebar !== (savedCompact === "true")) {
      (() => setCompactSidebar(savedCompact === "true"))();
    }
    
    const savedFull = localStorage.getItem("crm-full-width");
    if (savedFull && fullWidth !== (savedFull === "true")) {
      (() => setFullWidth(savedFull === "true"))();
    }
  }, [compactSidebar, fullWidth]);

  const toggleCompactSidebar = () => {
    const newValue = !compactSidebar;
    setCompactSidebar(newValue);
    localStorage.setItem("crm-compact-sidebar", newValue.toString());
  };

  const toggleFullWidth = () => {
    const newValue = !fullWidth;
    setFullWidth(newValue);
    localStorage.setItem("crm-full-width", newValue.toString());
  };

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
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Choose how ClixProCRM looks on your screen.</p>
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
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Accent Color</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-medium">Color Wheel:</span>
                  <input 
                    type="color" 
                    value={accentColor.startsWith("#") ? accentColor : "#10b981"} 
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-6 h-6 rounded-full border-0 p-0 cursor-pointer bg-transparent"
                    title="Choose custom color from wheel"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {accentColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-sm",
                      color.value,
                      accentColor === color.id && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                    )}
                  >
                    {accentColor === color.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Logo Theme Preview */}
            <div className="pt-3 border-t border-border/50">
              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                Live Brand Logo Preview
              </Label>
              <div className="p-4 rounded-xl bg-background/80 border border-border/60 flex items-center justify-between">
                <ClixProLogo size="lg" animated />
                <span className="text-[11px] font-semibold text-muted-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                  Dynamic Theme Reactive
                </span>
              </div>
            </div>
          </div>
        </CRMCard>

        {/* Workspace Layout Section */}
        <CRMCard>
          <div className="mb-5">
            <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layout className="w-4 h-4 text-primary" />
              Navigation & Google Fonts
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Optimize your workspace typography and layout.</p>
          </div>
          
          <div className="space-y-4">
            {[
              { id: "sidebar", title: "Compact Sidebar", desc: "Maximize your working area.", icon: Sidebar, active: compactSidebar, onClick: toggleCompactSidebar },
              { id: "width", title: "Full Width Mode", desc: "Expand content to fill the screen.", icon: Maximize2, active: fullWidth, onClick: toggleFullWidth },
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
                  <Button variant="ghost" size="sm" onClick={item.onClick} className="h-7 text-[8px] font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/10">Disable</Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={item.onClick} className="h-7 text-[8px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">Enable</Button>
                )}
              </div>
            ))}

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center shrink-0">
                  <Type className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground tracking-tight">Google Fonts Typography</h4>
                  <p className="text-[10px] text-muted-foreground font-medium">Select your preferred Google Font.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {googleFonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={cn(
                      "p-2 rounded-lg text-left text-xs transition-all border flex items-center justify-between",
                      fontFamily === f.id
                        ? "bg-primary/10 border-primary font-bold text-primary"
                        : "bg-card border-border/60 hover:border-primary/50 text-foreground"
                    )}
                  >
                    <span className={`font-${f.id}`}>{f.label}</span>
                    {fontFamily === f.id && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CRMCard>
      </div>
    </div>
  );
};


export default PersonalizationSettings;
