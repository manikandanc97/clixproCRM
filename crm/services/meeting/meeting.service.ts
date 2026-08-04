import prisma from "@/lib/prisma";
import { Prisma, Lead, Customer, Quotation, Invoice, Task, PrismaClient, LeadStage, LeadPriority, CustomerStatus, TaskPriority, TaskStatus, QuotationStatus } from "@prisma/client";
import {
  calculateTrend,
  formatCurrency,
  countInRange,
  getMonthRanges,
  getStatusLabel,
  formatRelativeDate,
  toNumber,
  formatDate,
  formatPercentage,
  PIPELINE_STAGE_LABELS,
  LEAD_STATUS_LABELS
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
      type?: any;
      description?: string | null;
      isAllDay?: boolean;
      assignedToId?: string;
      leadId?: string | null;
      taskId?: string | null;
      status?: string;
    }
  ) {
    if (!data.leadId) {
      throw new Error("Meeting must be linked to a Lead or CRM record.");
    }

    return prisma.$transaction(async (tx) => {
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
          status: data.status || "SCHEDULED",
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
            action: "Meeting Scheduled",
            description: `Scheduled meeting: ${meeting.title}`,
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

  static async getMeetings(tenantId: string) {
    const meetings = await prisma.meeting.findMany({ where: { tenantId }, take: 5, orderBy: { startTime: 'asc' } });
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


