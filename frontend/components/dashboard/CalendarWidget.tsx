"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

export default function CalendarWidget() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="w-full"
    >
      <Card className="border-none shadow-premium bg-gradient-to-br from-card to-background/50 overflow-hidden relative">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <CardContent className="p-4 sm:p-6 flex flex-col justify-center items-center relative z-10">
          <div className="w-full flex justify-between items-center mb-4 px-1">
            <h3 className="font-bold text-foreground text-lg tracking-tight">
              {date ? format(date, "MMMM yyyy") : "Calendar"}
            </h3>
            <button 
              onClick={() => setDate(new Date())}
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
            >
              Today
            </button>
          </div>

          <style jsx global>{`
            .premium-calendar {
              width: 100%;
              margin: 0;
              display: flex;
              justify-content: center;
              --rdp-cell-size: 38px;
              --rdp-accent-color: var(--color-primary);
              --rdp-background-color: var(--color-primary-foreground);
              --rdp-accent-color-dark: var(--color-primary);
              --rdp-background-color-dark: var(--color-primary-foreground);
              --rdp-outline: 2px solid var(--rdp-accent-color);
              --rdp-outline-selected: 2px solid var(--rdp-accent-color);
            }
            @media (max-width: 640px) {
              .premium-calendar {
                --rdp-cell-size: 32px;
              }
            }
            .dark .premium-calendar {
              --rdp-background-color: rgba(16, 185, 129, 0.2);
            }
            .premium-calendar .rdp-day_selected {
              font-weight: bold;
              border-radius: 12px;
            }
            .premium-calendar .rdp-day:hover:not([disabled]) {
              border-radius: 12px;
              background-color: var(--color-muted);
            }
            .dark .premium-calendar .rdp-day:hover:not([disabled]) {
              background-color: var(--color-muted);
            }
            .premium-calendar .rdp-head_cell {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: var(--color-muted-foreground);
            }
            .premium-calendar .rdp-nav_button {
              border-radius: 8px;
            }
            .premium-calendar .rdp-nav_button:hover {
              background-color: var(--color-muted);
            }
            .dark .premium-calendar .rdp-nav_button:hover {
              background-color: var(--color-muted);
            }
            .premium-calendar .rdp-caption_label {
              display: none;
            }
            .premium-calendar .rdp-table {
              max-width: 100%;
            }
            .premium-calendar .rdp-months {
              justify-content: center;
              width: 100%;
            }
          `}</style>
          
          <div className="w-full overflow-hidden">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={setDate}
              className="premium-calendar mt-0"
              showOutsideDays
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
