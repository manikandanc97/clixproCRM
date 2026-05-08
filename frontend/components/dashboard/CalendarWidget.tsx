"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

const MOCK_EVENTS = [
  { date: new Date(), title: "Acme Corp Review", time: "10:00 AM" },
  { date: new Date(), title: "TechFlow Demo", time: "1:00 PM" },
  { date: new Date(new Date().setDate(new Date().getDate() + 2)), title: "Design Sync", time: "3:30 PM" },
];

export default function CalendarWidget() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const dayEvents = MOCK_EVENTS.filter(e => isSameDay(e.date, selectedDate));
      if (dayEvents.length > 0) {
        toast.info(`Schedule for ${format(selectedDate, "MMM d")}`, {
          description: `You have ${dayEvents.length} events scheduled: ${dayEvents.map(e => e.title).join(", ")}`,
        });
      } else {
        toast.info(`No events for ${format(selectedDate, "MMM d")}`, {
          description: "Click + to schedule a new meeting.",
        });
      }
    }
  };

  const handleToday = () => {
    const today = new Date();
    setDate(today);
    handleDateSelect(today);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="w-full"
    >
      <Card className="border-none shadow-premium bg-gradient-to-br from-card to-background/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <CardContent className="p-4 sm:p-6 flex flex-col justify-center items-center relative z-10">
          <div className="w-full flex justify-between items-center mb-4 px-1">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-foreground text-sm tracking-tight">
                {date ? format(date, "MMMM yyyy") : "Calendar"}
              </h3>
            </div>
            <button 
              onClick={handleToday}
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 border border-primary/20"
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
            .premium-calendar .rdp-day_selected {
              font-weight: bold;
              border-radius: 12px;
              background-color: var(--color-primary);
              color: var(--color-primary-foreground);
            }
            .premium-calendar .rdp-day:hover:not([disabled]) {
              border-radius: 12px;
              background-color: var(--color-muted);
            }
            .premium-calendar .rdp-head_cell {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              color: var(--color-muted-foreground);
              padding-bottom: 8px;
            }
            .premium-calendar .rdp-nav_button {
              border-radius: 10px;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid var(--color-border);
              background: var(--color-background);
              transition: all 0.2s;
            }
            .premium-calendar .rdp-nav_button:hover {
              background-color: var(--color-muted);
              transform: scale(1.05);
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
              onSelect={handleDateSelect}
              className="premium-calendar mt-0"
              showOutsideDays
            />
          </div>

          <AnimatePresence mode="wait">
            {date && MOCK_EVENTS.some(e => isSameDay(e.date, date)) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mt-4 pt-4 border-t border-border"
              >
                {MOCK_EVENTS.filter(e => isSameDay(e.date, date)).map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                      <div>
                        <p className="text-[11px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{event.title}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-[9px] text-muted-foreground font-semibold">
                          <Clock className="w-2.5 h-2.5" /> {event.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

