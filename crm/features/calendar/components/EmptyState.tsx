"use client";

import React from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onNewEvent: () => void;
}

export function EmptyState({ onNewEvent }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="crm-empty-state"
    >
      <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-5">
        <CalendarDays className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">No Events Scheduled</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6 text-sm font-medium">
        Your calendar is clear. Schedule meetings, calls, or tasks to keep your pipeline moving forward.
      </p>
      <Button onClick={onNewEvent} className="gap-2 font-semibold">
        <Plus className="w-4 h-4" />
        Create Event
      </Button>
    </motion.div>
  );
}
