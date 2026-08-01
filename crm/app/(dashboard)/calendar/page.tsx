"use client";

import React, { useState, useEffect, useMemo } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, addDays, subDays } from "date-fns";
import { CalendarDays, Users, Phone, CheckSquare } from "lucide-react";
import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import { CalendarSidebar } from "@/features/calendar/components/CalendarSidebar";
import { CalendarGrid } from "@/features/calendar/components/CalendarGrid";
import { EventDrawer } from "@/features/calendar/components/EventDrawer";
import { CRMMetricCard, CRMMetricsGrid } from "@/shared/components/crm";
import { toast } from "sonner";

type ViewType = "month" | "week" | "day" | "agenda";

interface Filters {
  meetings: boolean;
  calls: boolean;
  tasks: boolean;
  leaves: boolean;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [filters, setFilters] = useState<Filters>({ meetings: true, calls: true, tasks: true, leaves: true });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let start: Date, end: Date;
      if (view === "month") {
        start = startOfWeek(startOfMonth(currentDate));
        end = endOfWeek(endOfMonth(currentDate));
      } else if (view === "agenda") {
        start = currentDate;
        end = addMonths(currentDate, 3);
      } else {
        start = subDays(currentDate, 7);
        end = addDays(currentDate, 30);
      }

      const res = await fetch(`/api/crm/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load calendar events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, view]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (e.type === "MEETING" && !filters.meetings) return false;
      if ((e.type === "CALL" || e.type === "FOLLOW_UP") && !filters.calls) return false;
      if (e.type === "TASK" && !filters.tasks) return false;
      if ((e.type === "HOLIDAY" || e.type === "LEAVE" || e.type === "BIRTHDAY") && !filters.leaves) return false;
      return true;
    });
  }, [events, filters]);

  const today = new Date().toDateString();
  const summary = useMemo(() => ({
    meetings: events.filter(e => e.type === "MEETING" && new Date(e.startTime).toDateString() === today).length,
    calls: events.filter(e => (e.type === "CALL" || e.type === "FOLLOW_UP") && new Date(e.startTime).toDateString() === today).length,
    tasks: events.filter(e => e.type === "TASK" && new Date(e.startTime).toDateString() === today).length,
    total: events.length,
  }), [events, today]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/crm/calendar/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Event deleted");
      setSelectedEvent(null);
      fetchEvents();
    } catch {
      toast.error("Failed to delete event.");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">

      {/* ── HEADER ── */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onDateChange={setCurrentDate}
        onNewEvent={() => toast.info("Event creation coming soon!")}
      />

      {/* ── METRIC CARDS ── */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-4 pb-3 border-b border-border/50">
        <CRMMetricsGrid className="gap-3 md:gap-4">
          <CRMMetricCard
            title="Today's Meetings"
            value={loading ? "—" : summary.meetings}
            icon={Users}
            color="emerald"
            trend="neutral"
            delay={0}
            className="!p-4"
          />
          <CRMMetricCard
            title="Calls Today"
            value={loading ? "—" : summary.calls}
            icon={Phone}
            color="orange"
            trend="neutral"
            delay={0.05}
            className="!p-4"
          />
          <CRMMetricCard
            title="Tasks Due"
            value={loading ? "—" : summary.tasks}
            icon={CheckSquare}
            color="indigo"
            trend="neutral"
            delay={0.1}
            className="!p-4"
          />
          <CRMMetricCard
            title="Total Events"
            value={loading ? "—" : summary.total}
            icon={CalendarDays}
            color="violet"
            trend="neutral"
            delay={0.15}
            className="!p-4"
          />
        </CRMMetricsGrid>
      </div>

      {/* ── MAIN: Sidebar + Grid ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <CalendarSidebar
          currentDate={currentDate}
          onDateSelect={setCurrentDate}
          filters={filters}
          onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
          summary={summary}
        />

        <div className="flex-1 overflow-hidden min-h-0 relative">
          <CalendarGrid
            events={filteredEvents}
            currentDate={currentDate}
            view={view}
            onEventClick={setSelectedEvent}
            onViewChange={(v) => setView(v)}
            onNewEvent={() => toast.info("Event creation coming soon!")}
          />
        </div>
      </div>

      {/* ── EVENT DRAWER ── */}
      <EventDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={() => toast.info("Event edit coming soon!")}
        onDelete={handleDelete}
      />
    </div>
  );
}
