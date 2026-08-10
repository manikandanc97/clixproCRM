import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalendarEvents(
    tenantId: string,
    startParam: string,
    endParam: string,
  ) {
    const start = new Date(startParam);
    const end = new Date(endParam);

    // Fetch Meetings, Tasks, and Leads for the given timeframe
    const [meetings, tasks, leads] = await Promise.all([
      this.prisma.meeting.findMany({
        where: {
          tenantId,
          startTime: { gte: start },
          endTime: { lte: end },
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
          lead: { select: { id: true, name: true, company: true } },
        },
      }),
      this.prisma.task.findMany({
        where: {
          tenantId,
          dueDate: { gte: start, lte: end },
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      this.prisma.lead.findMany({
        where: {
          tenantId,
          expectedCloseDate: { gte: start, lte: end },
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Format all to a unified CalendarEvent structure
    const calendarEvents = [
      ...meetings.map((m: any) => ({
        id: `meeting-${m.id}`,
        dbId: m.id,
        source: 'meeting',
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
      ...tasks.map((t: any) => {
        // Assume tasks are all-day events on their due date, or 1 hour if not specified
        const tStart = t.dueDate ? new Date(t.dueDate) : new Date();
        const tEnd = new Date(tStart);
        tEnd.setHours(tEnd.getHours() + 1);

        return {
          id: `task-${t.id}`,
          dbId: t.id,
          source: 'task',
          title: `Task: ${t.title}`,
          description: t.description,
          startTime: tStart.toISOString(),
          endTime: tEnd.toISOString(),
          isAllDay: true,
          type: 'TASK',
          status: t.status,
          location: null,
          isOnline: false,
          assignedTo: t.assignedTo,
          relatedLead: null,
        };
      }),
      ...leads.map((l: any) => {
        const lStart = l.expectedCloseDate
          ? new Date(l.expectedCloseDate)
          : new Date();
        const lEnd = new Date(lStart);
        lEnd.setHours(lEnd.getHours() + 1);

        return {
          id: `lead-${l.id}`,
          dbId: l.id,
          source: 'lead',
          title: `Follow up: ${l.name} (${l.company})`,
          description: null,
          startTime: lStart.toISOString(),
          endTime: lEnd.toISOString(),
          isAllDay: false,
          type: 'FOLLOW_UP',
          status: l.stage,
          location: null,
          isOnline: false,
          assignedToId: l.assignedToId,
          relatedLead: { id: l.id, name: l.name, company: l.company },
        };
      }),
    ];

    return calendarEvents;
  }
}
