"use client";

import { Button } from "@/shared/ui/button";

export default function CurrencySwitcher() {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="hidden sm:flex items-center gap-1.5 px-3 h-9 font-semibold text-sm cursor-default hover:bg-background"
    >
      <span>INR</span>
      <span className="text-muted-foreground text-xs font-normal">
        (₹)
      </span>
    </Button>
  );
}
