import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { EventType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam || !endParam) {
      return new NextResponse("Missing start or end date", { status: 400 });
    }

    const start = new Date(startParam);
    const end = new Date(endParam);

    // Fetch Meetings, Tasks, and Leads for the given timeframe
    const [meetings, tasks, leads] = await Promise.all([
      prisma.meeting.findMany({
        where: {
          tenantId: session.tenantId,
          startTime: { gte: start },
          endTime: { lte: end },
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
          lead: { select: { id: true, name: true, company: true } },
        },
      }),
      prisma.task.findMany({
        where: {
          tenantId: session.tenantId,
          dueDate: { gte: start, lte: end },
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      prisma.lead.findMany({
        where: {
          tenantId: session.tenantId,
          expectedCloseDate: { gte: start, lte: end },
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Format all to a unified CalendarEvent structure
    const calendarEvents = [
      ...meetings.map((m) => ({
        id: `meeting-${m.id}`,
        dbId: m.id,
        source: "meeting",
        title: m.title,
        description: m.description,
        startTime: m.startTime.toISOString(),
        endTime: m.endTime.toISOString(),
        isAllDay: m.isAllDay,
        type: m.type, // MEETING, CALL, HOLIDAY, BIRTHDAY, LEAVE
        status: m.status,
        location: m.location,
        isOnline: m.isOnline,
        assignedToId: m.assignedToId,
        relatedLead: m.lead,
      })),
      ...tasks.map((t) => {
        // Assume tasks are all-day events on their due date, or 1 hour if not specified
        const tStart = t.dueDate ? new Date(t.dueDate) : new Date();
        const tEnd = new Date(tStart);
        tEnd.setHours(tEnd.getHours() + 1);

        return {
          id: `task-${t.id}`,
          dbId: t.id,
          source: "task",
          title: `Task: ${t.title}`,
          description: t.description,
          startTime: tStart.toISOString(),
          endTime: tEnd.toISOString(),
          isAllDay: true,
          type: "TASK",
          status: t.status,
          location: null,
          isOnline: false,
          assignedTo: t.assignedTo,
          relatedLead: null,
        };
      }),
      ...leads.map((l) => {
        const lStart = l.expectedCloseDate ? new Date(l.expectedCloseDate) : new Date();
        const lEnd = new Date(lStart);
        lEnd.setHours(lEnd.getHours() + 1);

        return {
          id: `lead-${l.id}`,
          dbId: l.id,
          source: "lead",
          title: `Follow up: ${l.name} (${l.company})`,
          description: null,
          startTime: lStart.toISOString(),
          endTime: lEnd.toISOString(),
          isAllDay: false,
          type: "FOLLOW_UP",
          status: l.stage,
          location: null,
          isOnline: false,
          assignedToId: l.assignedToId,
          relatedLead: { id: l.id, name: l.name, company: l.company },
        };
      }),
    ];

    return NextResponse.json(calendarEvents);
  } catch (error) {
    console.error("[CALENDAR_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, startTime, endTime, type, isAllDay, assignedToId, relatedLeadId, location, isOnline } = body;

    if (!title || !startTime || !endTime) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        tenantId: session.tenantId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type: (type as EventType) || EventType.MEETING,
        isAllDay: isAllDay || false,
        assignedToId: assignedToId || session.userId,
        leadId: relatedLeadId || null,
        location,
        isOnline: isOnline || false,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("[CALENDAR_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
