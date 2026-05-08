"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [accentColor, setAccentColorState] = useState<AccentColor>("emerald");
  const [fontFamily, setFontFamilyState] = useState<FontFamily>("sans");
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedAccent = localStorage.getItem("crm-accent-color") as AccentColor;
    const savedFont = localStorage.getItem("crm-font-family") as FontFamily;
    
    if (savedAccent) setAccentColorState(savedAccent);
    if (savedFont) setFontFamilyState(savedFont);
    
    setMounted(true);
  }, []);

  // Update body classes and persist to localStorage
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("crm-accent-color", accentColor);
    localStorage.setItem("crm-font-family", fontFamily);

    // Update data attributes on document element
    const root = document.documentElement;
    root.setAttribute("data-accent", accentColor);
    root.setAttribute("data-font", fontFamily);
    
    // Also handle font-family class on body
    document.body.classList.remove("font-sans", "font-geist", "font-jakarta");
    document.body.classList.add(`font-${fontFamily}`);
  }, [accentColor, fontFamily, mounted]);

  const setAccentColor = (color: AccentColor) => setAccentColorState(color);
  const setFontFamily = (font: FontFamily) => setFontFamilyState(font);

  return (
    <SettingsContext.Provider value={{ accentColor, setAccentColor, fontFamily, setFontFamily }}>
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
