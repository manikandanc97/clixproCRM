import prisma from "@/lib/prisma";
import { TaskPriority, TaskStatus } from "@prisma/client";




export class TaskService {
  static async createTask(
    tenantId: string,
    userId: string,
    data: {
      title: string;
      description?: string | null;
      dueDate: string | Date;
      assignedToId: string;
      priority?: TaskPriority;
      status?: TaskStatus;
      reminderDate?: string | Date | null;
      createdById?: string | null;
      relatedLeadId?: string | null;
      relatedCustomerId?: string | null;
      relatedMeetingId?: string | null;
      relatedQuotationId?: string | null;
      tags?: string[];
      checklist?: ReturnType<typeof JSON.parse>[];
      attachments?: ReturnType<typeof JSON.parse>[];
      relatedDealId?: string | null;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.assignedToId) {
        const isValidAssignee = await tx.tenantUser.findFirst({
          where: { userId: data.assignedToId, tenantId, status: "ACTIVE" }
        });
        if (!isValidAssignee) {
          throw new Error("Invalid assignment: User does not belong to this workspace or is inactive.");
        }
      }

      const task = await tx.task.create({
        data: {
          tenantId,
          title: data.title,
          description: data.description || null,
          dueDate: new Date(data.dueDate),
          assignedToId: data.assignedToId,
          createdById: data.createdById || userId,
          priority: data.priority || "MEDIUM",
          status: data.status || "PENDING",
          reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
          relatedLeadId: data.relatedLeadId || null,
          relatedCustomerId: data.relatedCustomerId || null,
          relatedMeetingId: data.relatedMeetingId || null,
          relatedQuotationId: data.relatedQuotationId || null,
          relatedDealId: data.relatedDealId || null,
          tags: data.tags || [],
          checklist: data.checklist ? (data.checklist as ReturnType<typeof JSON.parse>) : [],
          attachments: data.attachments ? (data.attachments as ReturnType<typeof JSON.parse>) : [],
          completedAt: data.status === "COMPLETED" ? new Date() : null,
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          relatedLead: { select: { id: true, name: true, company: true } },
          relatedCustomer: { select: { id: true, name: true, company: true } },
        },
      });

      // 1. Audit Log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "TASK_CREATED",
          module: "TASKS",
          details: { taskId: task.id, title: task.title, assignedToId: task.assignedToId, priority: task.priority },
        },
      });

      // 2. Timeline Event if linked to lead
      if (task.relatedLeadId) {
        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: task.relatedLeadId,
            userId,
            action: "Task Created",
            description: `Task "${task.title}" created and assigned.`,
          },
        });
      }

      // 3. Notification to assignee
      if (task.assignedToId && task.assignedToId !== userId) {
        await tx.notification.create({
          data: {
            tenantId,
            userId: task.assignedToId,
            title: "Task Assigned",
            message: `You have been assigned to task "${task.title}".`,
            type: "TASK_ASSIGNED",
          },
        });
      }

      return task;
    });
  }

  static async updateTask(
    tenantId: string,
    userId: string,
    id: string,
    data: Partial<{
      title: string;
      description: string | null;
      dueDate: string | Date | null;
      assignedToId: string | null;
      priority: TaskPriority;
      status: TaskStatus;
      reminderDate: string | Date | null;
      relatedLeadId: string | null;
      relatedCustomerId: string | null;
      relatedMeetingId: string | null;
      relatedQuotationId: string | null;
      relatedDealId: string | null;
      tags: string[];
      checklist: ReturnType<typeof JSON.parse>[];
      attachments: ReturnType<typeof JSON.parse>[];
    }>
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.task.findUnique({
        where: { id, tenantId },
      });

      if (!existing || existing.deletedAt) {
        throw new Error("Task not found");
      }

      if (data.assignedToId && data.assignedToId !== existing.assignedToId) {
        const isValidAssignee = await tx.tenantUser.findFirst({
          where: { userId: data.assignedToId, tenantId, status: "ACTIVE" }
        });
        if (!isValidAssignee) {
          throw new Error("Invalid assignment: User does not belong to this workspace or is inactive.");
        }
      }

      const targetStatus = data.status || existing.status;

      let completedAtValue = existing.completedAt;
      if (targetStatus === "COMPLETED" && existing.status !== "COMPLETED") {
        completedAtValue = new Date();
      } else if (targetStatus !== "COMPLETED" && existing.status === "COMPLETED") {
        completedAtValue = null;
      }

      const updatedTask = await tx.task.update({
        where: { id, tenantId },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
          ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
          ...(data.priority !== undefined && { priority: data.priority }),
          status: targetStatus,
          ...(data.reminderDate !== undefined && { reminderDate: data.reminderDate ? new Date(data.reminderDate) : null }),
          ...(data.relatedLeadId !== undefined && { relatedLeadId: data.relatedLeadId }),
          ...(data.relatedCustomerId !== undefined && { relatedCustomerId: data.relatedCustomerId }),
          ...(data.relatedMeetingId !== undefined && { relatedMeetingId: data.relatedMeetingId }),
          ...(data.relatedQuotationId !== undefined && { relatedQuotationId: data.relatedQuotationId }),
          ...(data.relatedDealId !== undefined && { relatedDealId: data.relatedDealId }),
          ...(data.tags !== undefined && { tags: data.tags }),
          ...(data.checklist !== undefined && { checklist: data.checklist as ReturnType<typeof JSON.parse> }),
          ...(data.attachments !== undefined && { attachments: data.attachments as ReturnType<typeof JSON.parse> }),
          completedAt: completedAtValue,
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          relatedLead: { select: { id: true, name: true, company: true } },
          relatedCustomer: { select: { id: true, name: true, company: true } },
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "TASK_UPDATED",
          module: "TASKS",
          details: { taskId: updatedTask.id, changes: data, status: targetStatus },
        },
      });

      // Timeline Event for Lead if status changed
      if (existing.relatedLeadId) {
        if (targetStatus === "COMPLETED" && existing.status !== "COMPLETED") {
          await tx.timelineEvent.create({
            data: {
              tenantId,
              leadId: existing.relatedLeadId,
              userId,
              action: "Task Completed",
              description: `Task "${existing.title}" was marked as completed.`
            }
          });
        } else if (targetStatus !== "COMPLETED" && existing.status === "COMPLETED") {
          await tx.timelineEvent.create({
            data: {
              tenantId,
              leadId: existing.relatedLeadId,
              userId,
              action: "Task Reopened",
              description: `Task "${existing.title}" was reopened.`
            }
          });
        } else {
          await tx.timelineEvent.create({
            data: {
              tenantId,
              leadId: existing.relatedLeadId,
              userId,
              action: "Task Updated",
              description: `Task "${existing.title}" was updated.`
            }
          });
        }
      }

      // Assignee Notification if changed
      if (data.assignedToId && data.assignedToId !== existing.assignedToId && data.assignedToId !== userId) {
        await tx.notification.create({
          data: {
            tenantId,
            userId: data.assignedToId,
            title: "Task Reassigned",
            message: `Task "${updatedTask.title}" has been reassigned to you.`,
            type: "TASK_ASSIGNED",
          },
        });
      }

      // Status change notification
      if (targetStatus !== existing.status && updatedTask.createdById && updatedTask.createdById !== userId) {
        await tx.notification.create({
          data: {
            tenantId,
            userId: updatedTask.createdById,
            title: `Task ${targetStatus}`,
            message: `Task "${updatedTask.title}" status changed to ${targetStatus}.`,
            type: "TASK_UPDATED",
          },
        });
      }

      return updatedTask;
    });
  }

  static async deleteTask(tenantId: string, userId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id, tenantId },
        data: { deletedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "TASK_DELETED",
          module: "TASKS",
          details: { taskId: id, title: task.title },
        },
      });

      if (task.relatedLeadId) {
        await tx.timelineEvent.create({
          data: {
            tenantId,
            leadId: task.relatedLeadId,
            userId,
            action: "Task Deleted",
            description: `Task "${task.title}" was deleted.`
          }
        });
      }

      return task;
    });
  }
}


