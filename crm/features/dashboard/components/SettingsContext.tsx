"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useCRMStore } from "@/shared/store/useCRMStore";

export type AccentColor = "emerald" | "blue" | "violet" | "amber" | "rose";
export type FontFamily = "sans" | "geist" | "jakarta";

type SettingsContextType = {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { accentColor, setAccentColor, fontFamily, setFontFamily } = useCRMStore();

  // Update body classes and data attributes
  useEffect(() => {
    // Update data attributes on document element
    const root = document.documentElement;
    root.setAttribute("data-accent", accentColor);
    root.setAttribute("data-font", fontFamily);
    
    // Also handle font-family class on body
    document.body.classList.remove("font-sans", "font-geist", "font-jakarta");
    document.body.classList.add(`font-${fontFamily}`);
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












