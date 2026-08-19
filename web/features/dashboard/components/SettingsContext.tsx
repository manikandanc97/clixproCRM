"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useCRMStore } from "@/shared/store/useCRMStore";

export type AccentColor = string;
export type FontFamily = string;

type SettingsContextType = {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function ensureGoogleFontLoaded(fontName: string) {
  if (typeof window === "undefined" || !fontName) return fontName;

  const knownMap: Record<string, string> = {
    inter: "Inter",
    roboto: "Roboto",
    poppins: "Poppins",
    jakarta: "Plus Jakarta Sans",
    outfit: "Outfit",
    space: "Space Grotesk",
    lora: "Lora",
    fira: "Fira Code",
    geist: "Geist",
    sans: "Inter",
  };

  const displayName = knownMap[fontName.toLowerCase()] || fontName;
  const fontSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const elementId = `google-font-css-${fontSlug}`;

  if (!document.getElementById(elementId)) {
    const link = document.createElement("link");
    link.id = elementId;
    link.rel = "stylesheet";
    const formattedQuery = encodeURIComponent(displayName).replace(/%20/g, "+");
    link.href = `https://fonts.googleapis.com/css2?family=${formattedQuery}:wght@300;400;500;600;700;800&display=swap`;
    document.head.appendChild(link);
  }

  return displayName;
}

const PRESET_ACCENTS: Record<string, { primary: string; accent: string }> = {
  emerald: { primary: "#10b981", accent: "rgba(16, 185, 129, 0.12)" },
  blue: { primary: "#3b82f6", accent: "rgba(59, 130, 246, 0.12)" },
  indigo: { primary: "#6366f1", accent: "rgba(99, 102, 241, 0.12)" },
  violet: { primary: "#8b5cf6", accent: "rgba(139, 92, 246, 0.12)" },
  purple: { primary: "#a855f7", accent: "rgba(168, 85, 247, 0.12)" },
  red: { primary: "#ef4444", accent: "rgba(239, 68, 68, 0.12)" },
  teal: { primary: "#14b8a6", accent: "rgba(20, 184, 166, 0.12)" },
  cyan: { primary: "#06b6d4", accent: "rgba(6, 182, 212, 0.12)" },
  amber: { primary: "#f59e0b", accent: "rgba(245, 158, 11, 0.12)" },
  rose: { primary: "#f43f5e", accent: "rgba(244, 63, 94, 0.12)" },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { accentColor, setAccentColor, fontFamily, setFontFamily } = useCRMStore();

  // Update body classes and data attributes
  useEffect(() => {
    const root = document.documentElement;
    
    // Handle accent color (preset vs custom color hex)
    root.setAttribute("data-accent", accentColor || "emerald");

    let primaryColor = "#10b981";
    let accentBg = "rgba(16, 185, 129, 0.12)";

    if (accentColor && accentColor.startsWith("#")) {
      primaryColor = accentColor;
      accentBg = `${accentColor}20`;
    } else if (PRESET_ACCENTS[accentColor]) {
      primaryColor = PRESET_ACCENTS[accentColor].primary;
      accentBg = PRESET_ACCENTS[accentColor].accent;
    }

    root.style.setProperty("--primary", primaryColor);
    root.style.setProperty("--sidebar-primary", primaryColor);
    root.style.setProperty("--ring", primaryColor);
    root.style.setProperty("--accent", accentBg);
    root.style.setProperty("--color-primary", primaryColor);
    root.style.setProperty("--color-accent", accentBg);
    
    // Handle font family & Google Fonts dynamic loading
    const targetFont = fontFamily || "inter";
    const loadedDisplayName = ensureGoogleFontLoaded(targetFont);
    
    const slug = targetFont.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    root.setAttribute("data-font", slug);

    if (loadedDisplayName) {
      const fontFamilyStyle = `'${loadedDisplayName}', system-ui, -apple-system, sans-serif`;
      root.style.setProperty("--font-sans", fontFamilyStyle);
      root.style.setProperty("--font-display", fontFamilyStyle);
      document.body.style.fontFamily = fontFamilyStyle;
    }
  }, [accentColor, fontFamily]);


  return (
    <SettingsContext.Provider value={{ 
      accentColor: accentColor as AccentColor, 
      setAccentColor: (color: AccentColor) => setAccentColor(color), 
      fontFamily: fontFamily as FontFamily, 
      setFontFamily: (font: FontFamily) => setFontFamily(font) 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}














