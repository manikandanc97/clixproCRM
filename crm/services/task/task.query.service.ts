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


export class TaskQueryService {
  static async getTasks(
    tenantId: string,
    options: {
      userId?: string;
      role?: string;
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      priority?: string;
      assignedToId?: string;
      createdById?: string;
      relatedLeadId?: string;
      relatedCustomerId?: string;
      tags?: string[];
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(options.limit || 20, 100));
    const skip = (page - 1) * limit;

    // 1. Auto-overdue status update
    const now = new Date();
    try {
      await prisma.task.updateMany({
        where: {
          tenantId,
          deletedAt: null,
          dueDate: { lt: now },
          status: { notIn: ["COMPLETED", "CANCELLED", "OVERDUE"] },
        },
        data: { status: "OVERDUE" },
      });
    } catch (_err) {
      // Ignore if error during status auto-update
    }

    // 2. Build where clause with RBAC & Tenant scoping
    const where: Prisma.TaskWhereInput = {
      tenantId,
      deletedAt: null,
    };

    // Role-based visibility scoping
    if (options.role && options.userId) {
      const userRole = options.role.toUpperCase();
      if (userRole !== "ADMIN" && userRole !== "SUPER ADMIN") {
        where.OR = [
          { assignedToId: options.userId },
          { createdById: options.userId },
          { assignedToId: null },
        ];
      }
    }

    if (options.search && options.search.trim() !== "") {
      const search = options.search.trim();
      const searchCondition: Prisma.TaskWhereInput[] = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
      if (where.OR) {
        where.AND = [{ OR: searchCondition }];
      } else {
        where.OR = searchCondition;
      }
    }

    if (options.status && options.status !== "all") {
      where.status = options.status.toUpperCase() as TaskStatus;
    }

    if (options.priority && options.priority !== "all") {
      where.priority = options.priority.toUpperCase() as TaskPriority;
    }

    if (options.assignedToId && options.assignedToId !== "all") {
      where.assignedToId = options.assignedToId === "unassigned" ? null : options.assignedToId;
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

    const sortField = options.sortBy || "dueDate";
    const sortOrder = options.sortOrder || "asc";
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [
      { [sortField]: sortOrder },
      { createdAt: "desc" },
    ];

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          relatedLead: { select: { id: true, name: true, company: true, email: true } },
          relatedCustomer: { select: { id: true, name: true, company: true, email: true } },
          relatedMeeting: { select: { id: true, title: true } },
          relatedQuotation: { select: { id: true, quoteNumber: true, client: true, amount: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    // Dashboard metrics for stats bar
    const allActiveTasks = await prisma.task.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, status: true, dueDate: true, updatedAt: true, createdAt: true },
    });

    const completedCount = allActiveTasks.filter((t) => t.status === "COMPLETED").length;
    const pendingCount = allActiveTasks.filter((t) => t.status === "PENDING").length;
    const inProgressCount = allActiveTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const overdueCount = allActiveTasks.filter(
      (t) => t.status === "OVERDUE" || (t.dueDate && t.dueDate < now && t.status !== "COMPLETED" && t.status !== "CANCELLED")
    ).length;
    const totalCount = allActiveTasks.length;

    const taskStats = [
      {
        title: "Total Tasks",
        value: totalCount.toLocaleString("en-US"),
        change: "+0%",
        trend: "up" as const,
      },
      {
        title: "Completed",
        value: completedCount.toLocaleString("en-US"),
        change: totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : "0%",
        trend: "up" as const,
      },
      {
        title: "In Progress",
        value: inProgressCount.toLocaleString("en-US"),
        change: "+0%",
        trend: "up" as const,
      },
      {
        title: "Overdue",
        value: overdueCount.toLocaleString("en-US"),
        change: overdueCount > 0 ? "Alert" : "0",
        trend: overdueCount > 0 ? ("down" as const) : ("up" as const),
      },
    ];

    const formattedTasks = tasks.map((task) => {
      const checklistArray = Array.isArray(task.checklist) ? (task.checklist as any[]) : [];
      const totalChecklist = checklistArray.length;
      const completedChecklist = checklistArray.filter((c: any) => c.completed).length;
      const progressPercent =
        totalChecklist > 0
          ? Math.round((completedChecklist / totalChecklist) * 100)
          : task.status === "COMPLETED"
          ? 100
          : 0;
      const isTaskOverdue = Boolean(
        task.dueDate && task.dueDate < now && task.status !== "COMPLETED" && task.status !== "CANCELLED"
      );

      return {
        id: task.id,
        tenantId: task.tenantId,
        title: task.title,
        description: task.description || "",
        status: isTaskOverdue && task.status !== "COMPLETED" && task.status !== "CANCELLED" ? ("OVERDUE" as TaskStatus) : task.status,
        priority: task.priority,
        dueDate: formatRelativeDate(task.dueDate, { fallback: "No due date" }),
        dueDateValue: task.dueDate ? task.dueDate.toISOString() : null,
        reminderDate: task.reminderDate ? task.reminderDate.toISOString() : null,
        assignedToId: task.assignedToId,
        createdById: task.createdById,
        relatedLeadId: task.relatedLeadId,
        relatedCustomerId: task.relatedCustomerId,
        relatedMeetingId: task.relatedMeetingId,
        relatedQuotationId: task.relatedQuotationId,
        tags: task.tags || [],
        checklist: checklistArray,
        attachments: Array.isArray(task.attachments) ? (task.attachments as any[]) : [],

        completedAt: task.completedAt ? task.completedAt.toISOString() : null,
        deletedAt: task.deletedAt ? task.deletedAt.toISOString() : null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),

        assignedTo: task.assignedTo ? { id: task.assignedTo.id, name: task.assignedTo.name, email: task.assignedTo.email } : null,
        createdBy: task.createdById ? { id: task.createdById, name: "Owner", email: "" } : null,
        relatedLead: task.relatedLead ? { id: task.relatedLead.id, name: task.relatedLead.name, company: task.relatedLead.company, email: task.relatedLead.email } : null,
        relatedCustomer: task.relatedCustomer ? { id: task.relatedCustomer.id, name: task.relatedCustomer.name, company: task.relatedCustomer.company, email: task.relatedCustomer.email } : null,
        relatedMeeting: task.relatedMeeting ? { id: task.relatedMeeting.id, name: task.relatedMeeting.title } : null,
        relatedQuotation: task.relatedQuotation ? { id: task.relatedQuotation.id, name: task.relatedQuotation.quoteNumber, company: task.relatedQuotation.client, amount: Number(task.relatedQuotation.amount) } : null,

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
        blocked: allActiveTasks.filter((t) => t.status === "BLOCKED").length,
        dueToday: allActiveTasks.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === now.toDateString()).length,
        completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
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

  static async getTaskById(tenantId: string, id: string) {
    const task = await prisma.task.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        relatedLead: { select: { id: true, name: true, company: true, email: true } },
        relatedCustomer: { select: { id: true, name: true, company: true, email: true } },
        relatedMeeting: { select: { id: true, title: true } },
        relatedQuotation: { select: { id: true, quoteNumber: true, client: true, amount: true } },
      },
    });

    if (!task) return null;

    const checklistArray = Array.isArray(task.checklist) ? (task.checklist as any[]) : [];
    const totalChecklist = checklistArray.length;
    const completedChecklist = checklistArray.filter((c: any) => c.completed).length;
    const now = new Date();
    const isTaskOverdue = Boolean(task.dueDate && task.dueDate < now && task.status !== "COMPLETED" && task.status !== "CANCELLED");

    return {
      ...task,
      description: task.description || "",
      dueDateValue: task.dueDate ? task.dueDate.toISOString() : null,
      dueDate: formatRelativeDate(task.dueDate, { fallback: "No due date" }),
      reminderDate: task.reminderDate ? task.reminderDate.toISOString() : null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      checklist: checklistArray,
      attachments: Array.isArray(task.attachments) ? (task.attachments as any[]) : [],
      isOverdue: isTaskOverdue,
      progress: totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : task.status === "COMPLETED" ? 100 : 0,
      subtaskCount: { total: totalChecklist, completed: completedChecklist },
    };
  }
}


