"use client";

import React from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { X, Clock, MapPin, User, FileText, Video, Trash2, Pencil, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface EventDrawerProps {
  event: any | null;
  onClose: () => void;
  onEdit: (event: any) => void;
  onDelete: (eventId: string) => void;
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  MEETING:   { label: "Meeting",   bg: "bg-emerald-500/10",  text: "text-emerald-700 dark:text-emerald-400",  border: "border-emerald-500/20" },
  CALL:      { label: "Call",      bg: "bg-orange-500/10",   text: "text-orange-700 dark:text-orange-400",    border: "border-orange-500/20" },
  TASK:      { label: "Task",      bg: "bg-indigo-500/10",   text: "text-indigo-700 dark:text-indigo-400",    border: "border-indigo-500/20" },
  FOLLOW_UP: { label: "Follow-up", bg: "bg-violet-500/10",   text: "text-violet-700 dark:text-violet-400",   border: "border-violet-500/20" },
  HOLIDAY:   { label: "Holiday",   bg: "bg-rose-500/10",     text: "text-rose-700 dark:text-rose-400",       border: "border-rose-500/20" },
  LEAVE:     { label: "Leave",     bg: "bg-slate-500/10",    text: "text-slate-700 dark:text-slate-300",     border: "border-slate-500/20" },
  BIRTHDAY:  { label: "Birthday",  bg: "bg-pink-500/10",     text: "text-pink-700 dark:text-pink-400",       border: "border-pink-500/20" },
};

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export function EventDrawer({ event, onClose, onEdit, onDelete }: EventDrawerProps) {
  const typeConf = event ? (TYPE_CONFIG[event.type] ?? TYPE_CONFIG.MEETING) : null;

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 dark:bg-black/50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border/60 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
              <span className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                typeConf?.bg, typeConf?.text, typeConf?.border
              )}>
                {typeConf?.label}
              </span>
              <div className="flex items-center gap-1">
                {event.source === "meeting" && (
                  <>
                    <Button variant="ghost" size="icon-xs" onClick={() => onEdit(event)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => onDelete(event.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon-xs" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-foreground leading-tight">{event.title}</h2>
                <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {event.isAllDay
                      ? `${format(parseISO(event.startTime), "MMM d, yyyy")} • All Day`
                      : `${format(parseISO(event.startTime), "MMM d, yyyy • h:mm a")} – ${format(parseISO(event.endTime), "h:mm a")}`}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div className="space-y-4 pt-2 border-t border-border/50">
                {event.location && (
                  <DetailRow
                    icon={event.isOnline ? Video : MapPin}
                    label={event.isOnline ? "Online Meeting" : "Location"}
                    value={event.location}
                  />
                )}
                {event.assignedTo && (
                  <DetailRow
                    icon={User}
                    label="Assignee"
                    value={
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                          {event.assignedTo.name?.charAt(0).toUpperCase()}
                        </div>
                        {event.assignedTo.name}
                      </div>
                    }
                  />
                )}
                {event.relatedLead && (
                  <DetailRow
                    icon={FileText}
                    label="Related Lead"
                    value={
                      <span className="inline-flex items-center gap-1">
                        <span className="font-semibold">{event.relatedLead.name}</span>
                        <span className="text-muted-foreground">· {event.relatedLead.company}</span>
                      </span>
                    }
                  />
                )}
                {event.status && (
                  <DetailRow
                    icon={CheckCircle2}
                    label="Status"
                    value={<span className="capitalize">{String(event.status).toLowerCase().replace("_", " ")}</span>}
                  />
                )}
              </div>

              {event.description && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-xl p-4 border border-border/40">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/60 bg-muted/20">
              <Button variant="outline" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
