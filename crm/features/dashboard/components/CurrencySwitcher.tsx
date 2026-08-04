"use client";

import { useCRMStore } from "@/shared/store/useCRMStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { Check, ChevronDown } from "lucide-react";

const CURRENCIES = [
  { label: "INR (₹)", value: "INR", symbol: "₹", flag: "🇮🇳" },
  { label: "USD ($)", value: "USD", symbol: "$", flag: "🇺🇸" },
];

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCRMStore();

  const currentCurrency = CURRENCIES.find((c) => c.value === currency) || CURRENCIES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden sm:flex items-center gap-1.5 px-3 h-9 font-semibold text-sm group"
        >
          <span>{currentCurrency.value}</span>
          <span className="text-muted-foreground text-xs font-normal">
            ({currentCurrency.symbol})
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-all ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 shadow-elevated border-border bg-popover/95 backdrop-blur-xl">
        {CURRENCIES.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => setCurrency(item.value)}
            className="rounded-md flex items-center justify-between cursor-pointer py-2 px-2.5 group focus:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{item.flag}</span>
              <span className="text-sm font-semibold">
                {item.value} <span className="text-muted-foreground font-normal">({item.symbol})</span>
              </span>
            </div>
            {currency === item.value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
