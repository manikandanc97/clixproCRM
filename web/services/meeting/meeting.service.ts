import prisma from "@/lib/prisma";
import {
  formatDate
} from "@/lib/crm-formatters";


export class MeetingService {
  static async createMeeting(
    tenantId: string,
    userId: string,
    data: {
      title: string;
      startTime: Date | string;
      endTime: Date | string;
      location?: string | null;
      isOnline?: boolean;
      type?: ReturnType<typeof JSON.parse>;
      description?: string | null;
      isAllDay?: boolean;
      assignedToId?: string;
      leadId?: string | null;
      customerId?: string | null;
      quotationId?: string | null;
      taskId?: string | null;
      dealId?: string | null;
      status?: string;
      duration?: number;
      meetingNotes?: string;
      isLog?: boolean; // Flag to indicate if it's logging a past meeting
    }
  ) {
    if (!data.leadId && !data.customerId && !data.quotationId && !data.dealId) {
      throw new Error("Meeting must be linked to a Lead, Customer, or Deal.");
    }

    return prisma.$transaction(async (tx) => {
      if (data.assignedToId && data.assignedToId !== userId) {
        const isValidAssignee = await tx.tenantUser.findFirst({
          where: { userId: data.assignedToId, tenantId, status: "ACTIVE" }
        });
        if (!isValidAssignee) throw new Error("Invalid assignment: User does not belong to this workspace or is inactive.");
      }

      const meeting = await tx.meeting.create({
        data: {
          tenantId,
          title: data.title,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          location: data.location || null,
          isOnline: data.isOnline || false,
          type: data.type || "MEETING",
          description: data.description || null,
          isAllDay: data.isAllDay || false,
          assignedToId: data.assignedToId || userId,
          leadId: data.leadId || null,
          customerId: data.customerId || null,
          quotationId: data.quotationId || null,
          dealId: data.dealId || null,
          status: data.isLog ? "COMPLETED" : (data.status || "SCHEDULED"),
          duration: data.duration || 30,
          meetingNotes: data.meetingNotes || null,
        },
        include: {
          assignedTo: { select: { name: true, email: true, id: true } }
        }
      });

      if (data.leadId) {
        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: data.leadId,
            userId,
            action: data.isLog ? "Meeting Logged" : "Meeting Scheduled",
            description: `${data.isLog ? "Logged" : "Scheduled"} meeting: ${meeting.title}`,
          }
        });
      }

      if (data.taskId) {
        await tx.task.update({
          where: { id: data.taskId },
          data: { relatedMeetingId: meeting.id }
        });
        
        await tx.auditLog.create({
          data: {
            tenantId,
            userId,
            action: "TASK_UPDATED",
            module: "TASKS",
            details: { taskId: data.taskId, relatedMeetingId: meeting.id, note: "Scheduled a related meeting" },
          },
        });
      }

      await tx.notification.create({
        data: {
          tenantId,
          userId: data.assignedToId || userId,
          title: "Meeting Scheduled",
          message: `Meeting "${meeting.title}" scheduled.`,
          type: "INFO",
        }
      });

      return meeting;
    });
  }

  static async updateMeeting(
    tenantId: string,
    id: string,
    data: {
      title?: string;
      startTime?: Date | string;
      endTime?: Date | string;
      location?: string | null;
      isOnline?: boolean;
      description?: string | null;
      assignedToId?: string;
      status?: string;
    }
  ) {
    if (data.assignedToId) {
      const isValidAssignee = await prisma.tenantUser.findFirst({
        where: { userId: data.assignedToId, tenantId, status: "ACTIVE" }
      });
      if (!isValidAssignee) throw new Error("Invalid assignment: User does not belong to this workspace or is inactive.");
    }

    return prisma.meeting.update({
      where: { id, tenantId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.isOnline !== undefined && { isOnline: data.isOnline }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.assignedToId && { assignedToId: data.assignedToId }),
        ...(data.status && { status: data.status }),
      },
    });
  }

  static async deleteMeeting(tenantId: string, id: string) {
    // Perform hard-delete per existing architecture logic
    return prisma.meeting.delete({
      where: { id, tenantId },
    });
  }

  static async getMeetings(tenantId: string) {
    const now = new Date();
    const meetings = await prisma.meeting.findMany({
      where: { tenantId, startTime: { gte: now } },
      take: 5,
      orderBy: { startTime: 'asc' },
      select: { id: true, title: true, startTime: true, location: true, isOnline: true }
    });
    return meetings.map((m) => ({
      id: m.id,
      title: m.title,
      date: formatDate(m.startTime),
      time: "TBD",
      location: m.location || "Virtual",
      isOnline: m.isOnline,
      status: "scheduled",
      isToday: false,
      attendees: [],
      color: "#2563eb"
    }));
  }

  static async getLeadMeetings(tenantId: string, leadId: string) {
    return prisma.meeting.findMany({
      where: { tenantId, leadId },
      include: {
        assignedTo: { select: { name: true, email: true, id: true } }
      },
      orderBy: { startTime: "desc" }
    });
  }
}


