"use client";

import React from "react";
import {
  CheckSquare,
  CalendarDays,
  Users,
  Handshake,
  Activity,
} from "lucide-react";
import { useEmployeeDashboard } from "@/shared/hooks/use-employee-dashboard";
import { CRMMetricCard, CRMMetricsGrid } from "@/shared/components/crm";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * Personal KPI cards shown to EMPLOYEE role users on their dashboard.
 *
 * Data is scoped strictly to the logged-in user:
 *   - My Tasks       → tasks assigned to this user (not completed)
 *   - Today's Meetings → meetings assigned to this user starting today
 *   - My Leads       → leads with assignedToId = this user
 *   - My Deals       → open deals with ownerId = this user
 *   - My Activities  → recent completed tasks + newly assigned leads
 *
 * No org-wide metrics (revenue, total leads, team data) are shown or fetched.
 */
export default function EmployeeDashboardKPIs() {
  const { data, isLoading } = useEmployeeDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: "myTasks",
      title: "My Tasks",
      value: (data?.myTasks ?? 0).toString(),
      change: "pending",
      trend: "neutral" as const,
      icon: CheckSquare,
      color: "indigo" as const,
      comparisonText: "tasks assigned to you",
      tooltip: "Tasks assigned to you that are not yet completed.",
    },
    {
      id: "myMeetings",
      title: "Today's Meetings",
      value: (data?.myTodayMeetings ?? 0).toString(),
      change: `${data?.myUpcomingMeetings ?? 0} upcoming`,
      trend: "neutral" as const,
      icon: CalendarDays,
      color: "cyan" as const,
      comparisonText: "meetings today",
      tooltip: "Meetings scheduled for you today.",
    },
    {
      id: "myLeads",
      title: "My Leads",
      value: (data?.myLeads ?? 0).toString(),
      change: "assigned",
      trend: "neutral" as const,
      icon: Users,
      color: "emerald" as const,
      comparisonText: "leads assigned to you",
      tooltip: "Active leads that are assigned to you.",
    },
    {
      id: "myDeals",
      title: "My Deals",
      value: (data?.myDeals ?? 0).toString(),
      change: "open",
      trend: "neutral" as const,
      icon: Handshake,
      color: "orange" as const,
      comparisonText: "deals you own",
      tooltip: "Open deals that you own (not yet won or lost).",
    },
  ];

  return (
    <CRMMetricsGrid>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <CRMMetricCard
            key={card.id}
            title={card.title}
            value={card.value}
            change={card.change}
            trend={card.trend}
            icon={Icon}
            color={card.color}
            delay={0.08 * (index + 1)}
            loading={isLoading}
            comparisonText={card.comparisonText}
          />
        );
      })}
    </CRMMetricsGrid>
  );
}
