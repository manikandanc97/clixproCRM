import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { UpdateMeetingDto } from '../dto/update-meeting.dto';
import { formatDate } from '../../common/utils/crm-formatters.util';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createMeeting(
    tenantId: string,
    userId: string,
    data: CreateMeetingDto,
  ) {
    if (!data.leadId && !data.customerId && !data.quotationId && !data.dealId) {
      throw new HttpException(
        {
          success: false,
          message:
            'Meeting must be linked to a Lead, Customer, Quotation or Deal.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.$transaction(async (tx: any) => {
      const assignedToId = data.assignedToId || userId;

      if (assignedToId && assignedToId !== userId) {
        const isValidAssignee = await tx.tenantUser.findFirst({
          where: { userId: assignedToId, tenantId, status: 'ACTIVE' },
        });
        if (!isValidAssignee) {
          throw new HttpException(
            {
              success: false,
              message:
                'Invalid assignment: User does not belong to this workspace or is inactive.',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const meeting = await tx.meeting.create({
        data: {
          tenantId,
          title: data.title,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          location: data.location || null,
          isOnline: data.isOnline || false,
          type: data.type || 'MEETING',
          description: data.description || null,
          isAllDay: data.isAllDay || false,
          assignedToId: assignedToId,
          leadId: data.leadId || null,
          customerId: data.customerId || null,
          quotationId: data.quotationId || null,
          dealId: data.dealId || null,
          status: data.isLog ? 'COMPLETED' : data.status || 'SCHEDULED',
          duration: data.duration || 30,
          meetingNotes: data.meetingNotes || null,
        },
        include: {
          assignedTo: { select: { name: true, email: true, id: true } },
        },
      });

      if (data.leadId) {
        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: data.leadId,
            userId,
            action: data.isLog ? 'Meeting Logged' : 'Meeting Scheduled',
            description: `${data.isLog ? 'Logged' : 'Scheduled'} meeting: ${meeting.title}`,
          },
        });
      }

      if (data.taskId) {
        await tx.task.update({
          where: { id: data.taskId },
          data: { relatedMeetingId: meeting.id },
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            userId,
            action: 'TASK_UPDATED',
            module: 'TASKS',
            details: {
              taskId: data.taskId,
              relatedMeetingId: meeting.id,
              note: 'Scheduled a related meeting',
            },
          },
        });
      }

      await tx.notification.create({
        data: {
          tenantId,
          userId: assignedToId,
          title: 'Meeting Scheduled',
          message: `Meeting "${meeting.title}" scheduled.`,
          type: 'INFO',
        },
      });

      return meeting;
    });
  }

  async updateMeeting(tenantId: string, id: string, data: UpdateMeetingDto) {
    if (data.assignedToId) {
      const isValidAssignee = await this.prisma.tenantUser.findFirst({
        where: { userId: data.assignedToId, tenantId, status: 'ACTIVE' },
      });
      if (!isValidAssignee) {
        throw new HttpException(
          {
            success: false,
            message:
              'Invalid assignment: User does not belong to this workspace or is inactive.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.prisma.meeting.update({
      where: { id, tenantId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.isOnline !== undefined && { isOnline: data.isOnline }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.assignedToId && { assignedToId: data.assignedToId }),
        ...(data.status && { status: data.status }),
      },
    });
  }

  async deleteMeeting(tenantId: string, id: string) {
    // Perform hard-delete per existing architecture logic
    return this.prisma.meeting.delete({
      where: { id, tenantId },
    });
  }

  async getMeetings(tenantId: string) {
    const now = new Date();
    const meetings = await this.prisma.meeting.findMany({
      where: { tenantId, startTime: { gte: now } },
      take: 5,
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        title: true,
        startTime: true,
        location: true,
        isOnline: true,
      },
    });

    return meetings.map((m: any) => ({
      id: m.id,
      title: m.title,
      date: formatDate(m.startTime),
      time: 'TBD',
      location: m.location || 'Virtual',
      isOnline: m.isOnline,
      status: 'scheduled',
      isToday: false,
      attendees: [],
      color: '#2563eb',
    }));
  }

  async getLeadMeetings(tenantId: string, leadId: string) {
    return this.prisma.meeting.findMany({
      where: { tenantId, leadId },
      include: {
        assignedTo: { select: { name: true, email: true, id: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }
}
