import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { UpdateMeetingDto } from '../dto/update-meeting.dto';
import { formatDate } from '../../common/utils/crm-formatters.util';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkConflict(tenantId: string, ownerId: string, startTime: Date, endTime: Date, excludeMeetingId?: string) {
    const conflict = await this.prisma.meeting.findFirst({
      where: {
        tenantId,
        ownerId,
        status: { not: 'CANCELLED' },
        ...(excludeMeetingId ? { id: { not: excludeMeetingId } } : {}),
        OR: [
          { startTime: { lt: endTime, gte: startTime } },
          { endTime: { gt: startTime, lte: endTime } },
          { startTime: { lte: startTime }, endTime: { gte: endTime } }
        ]
      }
    });
    if (conflict) {
      throw new HttpException({ success: false, message: 'Scheduling conflict detected for the owner.' }, HttpStatus.CONFLICT);
    }
  }

  private async getManagedUsers(tenantId: string, userId: string) {
    const subordinates = await this.prisma.tenantUser.findMany({
      where: { tenantId, reportingManagerId: userId }
    });
    return subordinates.map((s: any) => s.userId);
  }

  async createMeeting(tenantId: string, user: any, data: CreateMeetingDto) {
    const userId = user.id || user.sub;
    const ownerId = data.ownerId || userId;
    const assignedToId = data.assignedToId || userId;

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    await this.checkConflict(tenantId, ownerId, start, end);

    return this.prisma.$transaction(async (tx: any) => {
      // @ts-ignore
      const meeting = await tx.meeting.create({
        data: {
          tenantId,
          title: data.title,
          startTime: start,
          endTime: end,
          location: data.location || null,
          isOnline: data.isOnline || false,
          type: data.type || 'MEETING',
          description: data.description || null,
          isAllDay: data.isAllDay || false,
          assignedToId: assignedToId,
          ownerId: ownerId,
          visibility: data.visibility || 'PRIVATE',
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

      await tx.auditLog.create({
        data: { tenantId, userId, action: 'MEETING_CREATED', module: 'CALENDAR', details: { meetingId: meeting.id } }
      });

      return meeting;
    });
  }

  async updateMeeting(tenantId: string, user: any, id: string, data: UpdateMeetingDto) {
    const userId = user.id || user.sub;
    const role = user.role?.name?.toUpperCase() || 'EMPLOYEE';
    
    // @ts-ignore
    const existing = await this.prisma.meeting.findUnique({ where: { id, tenantId } });
    if (!existing) throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);

    // RBAC Edit check
    const isOwner = existing.ownerId === userId || existing.assignedToId === userId;
    const isAdmin = role === 'ADMIN' || role === 'SUPER ADMIN';
    let isManager = false;
    
    if (role === 'MANAGER') {
      const managed = await this.getManagedUsers(tenantId, userId);
      if (managed.includes(existing.ownerId) || managed.includes(existing.assignedToId)) isManager = true;
    }

    if (!isOwner && !isAdmin && !isManager) {
      throw new HttpException('Forbidden: Cannot edit this meeting', HttpStatus.FORBIDDEN);
    }

    if (data.startTime && data.endTime) {
       await this.checkConflict(tenantId, existing.ownerId || existing.assignedToId || userId, new Date(data.startTime), new Date(data.endTime), id);
    }

    return this.prisma.$transaction(async (tx: any) => {
      const updateData: any = {
        ...(data.title && { title: data.title }),
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.isOnline !== undefined && { isOnline: data.isOnline }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.assignedToId && { assignedToId: data.assignedToId }),
        ...(data.status && { status: data.status }),
        ...(data.visibility && { visibility: data.visibility }),
        ...(data.ownerId && { ownerId: data.ownerId }),
      };

      if (data.startTime && new Date(data.startTime).getTime() !== existing.startTime.getTime()) {
         updateData.oldStartAt = existing.startTime;
         updateData.oldEndAt = existing.endTime;
         
         await tx.auditLog.create({
            data: { tenantId, userId, action: 'MEETING_RESCHEDULED', module: 'CALENDAR', details: { meetingId: id, oldStartAt: existing.startTime, newStartAt: data.startTime } }
         });
      }

      // @ts-ignore
      const updated = await tx.meeting.update({
        where: { id, tenantId },
        data: updateData,
      });

      return updated;
    });
  }

  async deleteMeeting(tenantId: string, user: any, id: string) {
    const userId = user.id || user.sub;
    const role = user.role?.name?.toUpperCase() || 'EMPLOYEE';
    
    // @ts-ignore
    const existing = await this.prisma.meeting.findUnique({ where: { id, tenantId } });
    if (!existing) throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);

    const isOwner = existing.ownerId === userId || existing.assignedToId === userId;
    const isAdmin = role === 'ADMIN' || role === 'SUPER ADMIN';
    let isManager = false;
    
    if (role === 'MANAGER') {
      const managed = await this.getManagedUsers(tenantId, userId);
      if (managed.includes(existing.ownerId)) isManager = true;
    }

    if (!isOwner && !isAdmin && !isManager) {
      throw new HttpException('Forbidden: Cannot delete this meeting', HttpStatus.FORBIDDEN);
    }

    if (existing.status === 'COMPLETED') {
      throw new HttpException('Cannot delete a completed meeting, business history must be preserved.', HttpStatus.BAD_REQUEST);
    }

    // @ts-ignore
    return this.prisma.meeting.update({
      where: { id, tenantId },
      data: {
        status: 'CANCELLED',
        cancelledBy: userId,
        cancelledAt: new Date()
      }
    });
  }

  async getMeetings(tenantId: string, user: any, startDate?: string, endDate?: string) {
    const userId = user.id || user.sub;
    const role = user.role?.name?.toUpperCase() || 'EMPLOYEE';
    
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date(new Date().setMonth(new Date().getMonth() + 1));
    
    const managedUsers = role === 'MANAGER' ? await this.getManagedUsers(tenantId, userId) : [];

    // Fetch meetings and calendar-dated tasks in parallel
    const [meetings, tasks] = await Promise.all([
      this.prisma.meeting.findMany({
        where: {
          tenantId,
          startTime: { gte: start },
          endTime: { lte: end },
          OR: [
            { ownerId: userId },
            { assignedToId: userId },
            { visibility: 'ORGANIZATION' },
            { visibility: 'TEAM', ownerId: { in: managedUsers } },
            ...(role === 'ADMIN' || role === 'SUPER ADMIN'
              ? [{ id: { not: '' } }]
              : []),
          ],
        },
        orderBy: { startTime: 'asc' },
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
          location: true,
          isOnline: true,
          status: true,
          type: true,
          visibility: true,
          ownerId: true,
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      this.prisma.task.findMany({
        where: {
          tenantId,
          dueDate: { gte: start, lte: end },
          deletedAt: null,
          OR: [
            { assignedToId: userId },
            { createdById: userId },
            ...(role === 'MANAGER'
              ? [{ assignedToId: { in: managedUsers } }]
              : []),
            ...(role === 'ADMIN' || role === 'SUPER ADMIN'
              ? [{ id: { not: '' } }]
              : []),
          ],
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          status: true,
          priority: true,
          assignedTo: { select: { id: true, name: true } },
        },
      }),
    ]);

    const mappedMeetings = meetings.map((m: any) => ({
      id: m.id,
      title: (m.visibility === 'PRIVATE' && m.ownerId !== userId && role !== 'ADMIN' && role !== 'SUPER ADMIN') ? 'Busy' : m.title,
      date: formatDate(m.startTime),
      startTime: m.startTime,
      endTime: m.endTime,
      location: m.location || 'Virtual',
      isOnline: m.isOnline,
      status: m.status,
      type: m.type,
      isToday: false,
      attendees: m.assignedTo ? [m.assignedTo] : [],
      color: m.status === 'CANCELLED' ? '#ef4444' : '#2563eb',
      isTask: false
    }));

    const mappedTasks = tasks.map((t: any) => ({
      id: t.id,
      title: `Task Due: ${t.title}`,
      date: formatDate(t.dueDate),
      startTime: t.dueDate,
      endTime: t.dueDate,
      location: 'Task',
      isOnline: false,
      status: t.status,
      type: 'TASK_DEADLINE',
      isToday: false,
      attendees: t.assignedTo ? [t.assignedTo] : [],
      color: t.status === 'COMPLETED' ? '#10b981' : '#f59e0b',
      isTask: true
    }));

    return [...mappedMeetings, ...mappedTasks].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
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
