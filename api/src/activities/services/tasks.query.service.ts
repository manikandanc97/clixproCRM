import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';
import { formatRelativeDate } from '../../common/utils/crm-formatters.util';
import { TaskQueryDto } from '../dto/task-query.dto';

@Injectable()
export class TasksQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async syncOverdueTasks(tenantId: string) {
    const now = new Date();
    try {
      await this.prisma.task.updateMany({
        where: {
          tenantId,
          deletedAt: null,
          dueDate: { lt: now },
          status: { notIn: ['COMPLETED', 'CANCELLED', 'OVERDUE'] },
        },
        data: { status: 'OVERDUE' },
      });
    } catch {
      // Ignore if error during status auto-update
    }
  }

  async getTasks(
    tenantId: string,
    options: TaskQueryDto & { userId: string; role: string },
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(options.limit || 50, 10000));
    const skip = (page - 1) * limit;

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // 1. Build where clause with RBAC & Tenant scoping
    const where: Prisma.TaskWhereInput = {
      tenantId,
      deletedAt: null,
    };

    // Role-based visibility scoping
    if (options.role && options.userId) {
      const userRole = options.role.toUpperCase();
      if (userRole !== 'ADMIN' && userRole !== 'SUPER ADMIN') {
        const tenantUser = await this.prisma.tenantUser.findFirst({
          where: { tenantId, userId: options.userId },
          select: { id: true, departmentId: true },
        });

        const [subordinates, teamUsers] = await Promise.all([
          tenantUser
            ? this.prisma.tenantUser.findMany({
                where: { tenantId, reportingManagerId: tenantUser.id },
                select: { userId: true },
              })
            : Promise.resolve([]),
          tenantUser?.departmentId
            ? this.prisma.tenantUser.findMany({
                where: { tenantId, departmentId: tenantUser.departmentId },
                select: { userId: true },
              })
            : Promise.resolve([]),
        ]);

        const subordinateUserIds = subordinates.map((s) => s.userId);
        const managerScopeUserIds = [options.userId, ...subordinateUserIds];
        const teamUserIds = teamUsers.map((u) => u.userId);

        where.OR = [
          { assignedToId: { in: managerScopeUserIds } },
          { createdById: { in: managerScopeUserIds } },
          { visibility: 'ORGANIZATION' },
        ];

        if (teamUserIds.length > 0) {
          where.OR.push({
            visibility: 'TEAM',
            OR: [
              { assignedToId: { in: teamUserIds } },
              { createdById: { in: teamUserIds } },
            ],
          });
        }
      }
    }

    if (options.search && options.search.trim() !== '') {
      const search = options.search.trim();
      const searchCondition: Prisma.TaskWhereInput[] = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
      if (where.OR) {
        where.AND = [{ OR: searchCondition }];
      } else {
        where.OR = searchCondition;
      }
    }

    if (options.status && options.status !== 'all') {
      where.status = options.status.toUpperCase() as TaskStatus;
    }

    if (options.priority && options.priority !== 'all') {
      where.priority = options.priority.toUpperCase() as TaskPriority;
    }

    if (options.assignedToId && options.assignedToId !== 'all') {
      where.assignedToId =
        options.assignedToId === 'unassigned' ? null : options.assignedToId;
    }

    if (options.createdById) {
      where.createdById = options.createdById;
    }

    if (options.relatedLeadId) {
      where.relatedLeadId = options.relatedLeadId;
    }

    if (options.relatedCustomerId) {
      where.relatedCustomerId = options.relatedCustomerId;
    }

    if (options.tags && options.tags.length > 0) {
      where.tags = { hasSome: options.tags };
    }

    if (options.startDate || options.endDate) {
      where.dueDate = {};
      if (options.startDate) where.dueDate.gte = new Date(options.startDate);
      if (options.endDate) where.dueDate.lte = new Date(options.endDate);
    }

    const sortField = options.sortBy || 'dueDate';
    const sortOrder = options.sortOrder || 'asc';
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [
      { [sortField]: sortOrder },
      { createdAt: 'desc' },
    ];

    const [tasks, total, statsRaw] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          relatedLead: {
            select: { id: true, name: true, company: true, email: true },
          },
          relatedCustomer: {
            select: { id: true, name: true, company: true, email: true },
          },
          relatedMeeting: { select: { id: true, title: true } },
          relatedQuotation: {
            select: {
              id: true,
              quoteNumber: true,
              client: true,
              amount: true,
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
      this.prisma.$queryRaw<
        Array<{
          total_count: number;
          pending_count: number;
          in_progress_count: number;
          completed_count: number;
          blocked_count: number;
          overdue_count: number;
          due_today_count: number;
        }>
      >`
        SELECT
          COUNT(*)::int as total_count,
          COUNT(CASE WHEN "status" = 'PENDING'::"TaskStatus" THEN 1 END)::int as pending_count,
          COUNT(CASE WHEN "status" = 'IN_PROGRESS'::"TaskStatus" THEN 1 END)::int as in_progress_count,
          COUNT(CASE WHEN "status" = 'COMPLETED'::"TaskStatus" THEN 1 END)::int as completed_count,
          COUNT(CASE WHEN "status" = 'BLOCKED'::"TaskStatus" THEN 1 END)::int as blocked_count,
          COUNT(CASE WHEN "dueDate" < ${now} AND "status" NOT IN ('COMPLETED'::"TaskStatus", 'CANCELLED'::"TaskStatus") THEN 1 END)::int as overdue_count,
          COUNT(CASE WHEN "dueDate" >= ${todayStart} AND "dueDate" < ${todayEnd} THEN 1 END)::int as due_today_count
        FROM "Task"
        WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL
      `,
    ]);

    const taskSummary = statsRaw[0] || {
      total_count: 0,
      pending_count: 0,
      in_progress_count: 0,
      completed_count: 0,
      blocked_count: 0,
      overdue_count: 0,
      due_today_count: 0,
    };

    const completedCount = Number(taskSummary.completed_count || 0);
    const pendingCount = Number(taskSummary.pending_count || 0);
    const inProgressCount = Number(taskSummary.in_progress_count || 0);
    const blockedCount = Number(taskSummary.blocked_count || 0);
    const overdueCount = Number(taskSummary.overdue_count || 0);
    const dueTodayCount = Number(taskSummary.due_today_count || 0);
    const totalCount = Number(taskSummary.total_count || 0);

    const taskStats = [
      {
        title: 'Total Tasks',
        value: totalCount.toLocaleString('en-US'),
        change: '+0%',
        trend: 'up' as const,
      },
      {
        title: 'Completed',
        value: completedCount.toLocaleString('en-US'),
        change:
          totalCount > 0
            ? `${Math.round((completedCount / totalCount) * 100)}%`
            : '0%',
        trend: 'up' as const,
      },
      {
        title: 'In Progress',
        value: inProgressCount.toLocaleString('en-US'),
        change: '+0%',
        trend: 'up' as const,
      },
      {
        title: 'Overdue',
        value: overdueCount.toLocaleString('en-US'),
        change: overdueCount > 0 ? 'Alert' : '0',
        trend: overdueCount > 0 ? ('down' as const) : ('up' as const),
      },
    ];

    const formattedTasks = tasks.map((task: any) => {
      const checklistArray = Array.isArray(task.checklist)
        ? (task.checklist as any[])
        : [];
      const totalChecklist = checklistArray.length;
      const completedChecklist = checklistArray.filter(
        (c: any) => c.completed,
      ).length;
      const progressPercent =
        totalChecklist > 0
          ? Math.round((completedChecklist / totalChecklist) * 100)
          : task.status === 'COMPLETED'
            ? 100
            : 0;
      const isTaskOverdue = Boolean(
        task.dueDate &&
        task.dueDate < now &&
        task.status !== 'COMPLETED' &&
        task.status !== 'CANCELLED',
      );

      return {
        id: task.id,
        tenantId: task.tenantId,
        title: task.title,
        description: task.description || '',
        status:
          isTaskOverdue &&
          task.status !== 'COMPLETED' &&
          task.status !== 'CANCELLED'
            ? ('OVERDUE' as TaskStatus)
            : task.status,
        priority: task.priority,
        dueDate: formatRelativeDate(task.dueDate, { fallback: 'No due date' }),
        dueDateValue: task.dueDate ? task.dueDate.toISOString() : null,
        reminderDate: task.reminderDate
          ? task.reminderDate.toISOString()
          : null,
        assignedToId: task.assignedToId,
        createdById: task.createdById,
        relatedLeadId: task.relatedLeadId,
        relatedCustomerId: task.relatedCustomerId,
        relatedMeetingId: task.relatedMeetingId,
        relatedQuotationId: task.relatedQuotationId,
        tags: task.tags || [],
        checklist: checklistArray,
        attachments: Array.isArray(task.attachments)
          ? (task.attachments as any[])
          : [],

        completedAt: task.completedAt ? task.completedAt.toISOString() : null,
        deletedAt: task.deletedAt ? task.deletedAt.toISOString() : null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),

        assignedTo: task.assignedTo
          ? {
              id: task.assignedTo.id,
              name: task.assignedTo.name,
              email: task.assignedTo.email,
            }
          : null,
        createdBy: task.createdById
          ? { id: task.createdById, name: 'Owner', email: '' }
          : null,
        relatedLead: task.relatedLead
          ? {
              id: task.relatedLead.id,
              name: task.relatedLead.name,
              company: task.relatedLead.company,
              email: task.relatedLead.email,
            }
          : null,
        relatedCustomer: task.relatedCustomer
          ? {
              id: task.relatedCustomer.id,
              name: task.relatedCustomer.name,
              company: task.relatedCustomer.company,
              email: task.relatedCustomer.email,
            }
          : null,
        relatedMeeting: task.relatedMeeting
          ? { id: task.relatedMeeting.id, name: task.relatedMeeting.title }
          : null,
        relatedQuotation: task.relatedQuotation
          ? {
              id: task.relatedQuotation.id,
              name: task.relatedQuotation.quoteNumber,
              company: task.relatedQuotation.client,
              amount: Number(task.relatedQuotation.amount),
            }
          : null,

        isOverdue: isTaskOverdue,
        progress: progressPercent,
        subtaskCount: { total: totalChecklist, completed: completedChecklist },
      };
    });

    return {
      stats: taskStats,
      dashboardStats: {
        total: totalCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        overdue: overdueCount,
        blocked: blockedCount,
        dueToday: dueTodayCount,
        completionRate:
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      },
      tasks: formattedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportTasks(tenantId: string, userId: string, query: any) {
    const where: Prisma.TaskWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (query.ids) {
      const ids = query.ids.split(',');
      where.id = { in: ids };
    } else {
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      if (query.status && query.status !== 'all')
        where.status = query.status as TaskStatus;
      if (query.priority && query.priority !== 'all')
        where.priority = query.priority as TaskPriority;
      if (query.assignedToId) where.assignedToId = query.assignedToId;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        relatedLead: { select: { name: true } },
        relatedCustomer: { select: { name: true } },
      },
    });

    const headers = [
      'Task ID',
      'Title',
      'Description',
      'Status',
      'Priority',
      'Due Date',
      'Assigned To',
      'Related Entity',
      'Created At',
    ];

    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      let stringValue = String(value);
      if (/^[=+\-@]/.test(stringValue)) {
        stringValue = "'" + stringValue;
      }
      if (stringValue.includes('"')) {
        stringValue = stringValue.replace(/"/g, '""');
      }
      if (
        stringValue.includes(',') ||
        stringValue.includes('\n') ||
        stringValue.includes('"')
      ) {
        return `"${stringValue}"`;
      }
      return stringValue;
    };

    const csvRows = [headers.join(',')];

    for (const task of tasks) {
      const relatedEntity =
        task.relatedLead?.name || task.relatedCustomer?.name || '';
      const row = [
        escapeCSV(task.id),
        escapeCSV(task.title),
        escapeCSV(task.description),
        escapeCSV(task.status),
        escapeCSV(task.priority),
        escapeCSV(task.dueDate ? new Date(task.dueDate).toISOString() : ''),
        escapeCSV(task.assignedTo?.name || task.assignedTo?.email || ''),
        escapeCSV(relatedEntity),
        escapeCSV(task.createdAt.toISOString()),
      ];
      csvRows.push(row.join(','));
    }

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EXPORT_TASKS',
        module: 'TASKS',
        details: { count: tasks.length, filters: query },
      },
    });

    return csvRows.join('\n');
  }

  async getTaskById(tenantId: string, id: string, options?: { userId: string; role: string }) {
    const where: Prisma.TaskWhereInput = { id, tenantId, deletedAt: null };

    if (options?.role && options?.userId) {
      const userRole = options.role.toUpperCase();
      if (userRole !== 'ADMIN' && userRole !== 'SUPER ADMIN') {
        const tenantUser = await this.prisma.tenantUser.findFirst({
          where: { tenantId, userId: options.userId },
        });

        const subordinates = await this.prisma.tenantUser.findMany({
          where: { tenantId, reportingManagerId: tenantUser?.id },
          select: { userId: true },
        });
        const subordinateUserIds = subordinates.map((s) => s.userId);
        const managerScopeUserIds = [options.userId, ...subordinateUserIds];

        let teamUserIds: string[] = [];
        if (tenantUser?.departmentId) {
          const teamUsers = await this.prisma.tenantUser.findMany({
            where: { tenantId, departmentId: tenantUser.departmentId },
            select: { userId: true },
          });
          teamUserIds = teamUsers.map((u) => u.userId);
        }

        where.OR = [
          { assignedToId: { in: managerScopeUserIds } },
          { createdById: { in: managerScopeUserIds } },
          { visibility: 'ORGANIZATION' },
        ];

        if (teamUserIds.length > 0) {
          where.OR.push({
            visibility: 'TEAM',
            OR: [
              { assignedToId: { in: teamUserIds } },
              { createdById: { in: teamUserIds } },
            ],
          });
        }
      }
    }

    const task = await this.prisma.task.findFirst({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        relatedLead: {
          select: { id: true, name: true, company: true, email: true },
        },
        relatedCustomer: {
          select: { id: true, name: true, company: true, email: true },
        },
        relatedMeeting: { select: { id: true, title: true } },
        relatedQuotation: {
          select: { id: true, quoteNumber: true, client: true, amount: true },
        },
        timelineEvents: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachmentsList: true,
      },
    });

    if (!task) return null;

    const checklistArray = Array.isArray(task.checklist)
      ? (task.checklist as any[])
      : [];
    const totalChecklist = checklistArray.length;
    const completedChecklist = checklistArray.filter(
      (c: any) => c.completed,
    ).length;
    const now = new Date();
    const isTaskOverdue = Boolean(
      task.dueDate &&
      task.dueDate < now &&
      task.status !== 'COMPLETED' &&
      task.status !== 'CANCELLED',
    );

    return {
      ...task,
      description: task.description || '',
      dueDateValue: task.dueDate ? task.dueDate.toISOString() : null,
      dueDate: formatRelativeDate(task.dueDate, { fallback: 'No due date' }),
      reminderDate: task.reminderDate ? task.reminderDate.toISOString() : null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      checklist: checklistArray,
      attachments: Array.isArray(task.attachments)
        ? (task.attachments as any[])
        : [],
      isOverdue: isTaskOverdue,
      progress:
        task.progress > 0
          ? task.progress
          : totalChecklist > 0
            ? Math.round((completedChecklist / totalChecklist) * 100)
            : task.status === 'COMPLETED'
              ? 100
              : 0,
      subtaskCount: { total: totalChecklist, completed: completedChecklist },
    };
  }
  async getTaskHistory(tenantId: string, taskId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        tenantId,
        module: 'TASKS',
        details: { path: ['taskId'], equals: taskId },
        action: {
          in: [
            'TASK_CREATED',
            'TASK_ASSIGNED',
            'TASK_REASSIGNED',
            'TASK_UNASSIGNED',
          ],
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const userIds = new Set<string>();
    logs.forEach((log) => {
      const details = (log.details as any) || {};
      if (details.assignedToId) userIds.add(details.assignedToId);
      if (details.previousAssigneeId) userIds.add(details.previousAssigneeId);
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    return logs.map((log) => {
      const details = (log.details as any) || {};
      return {
        id: log.id,
        action: log.action,
        actor: log.user ? log.user.name : 'System',
        assignedTo: details.assignedToId
          ? userMap.get(details.assignedToId)
          : null,
        previousAssignee: details.previousAssigneeId
          ? userMap.get(details.previousAssigneeId)
          : null,
        createdAt: log.createdAt.toISOString(),
      };
    });
  }
}
