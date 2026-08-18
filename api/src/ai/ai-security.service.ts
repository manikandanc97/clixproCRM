import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PERMISSION_MODULES, PermissionModule } from '../common/role-permissions.constants';

export interface UserSecurityContext {
  userId: string;
  tenantId: string;
  roleName: string;
  isSystemAdmin: boolean;
  permissions: Array<{ module: string; hasAccess: boolean }>;
  departmentId?: string | null;
  subordinateUserIds: string[];
  teamUserIds: string[];
}

@Injectable()
export class AiSecurityService {
  private readonly logger = new Logger(AiSecurityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build complete security context for the authenticated user in the active tenant.
   */
  async buildSecurityContext(
    userId: string,
    tenantId: string,
    userRole?: any,
  ): Promise<UserSecurityContext> {
    const tenantUser = await this.prisma.tenantUser.findFirst({
      where: { tenantId, userId, status: 'ACTIVE' },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const role = userRole || tenantUser?.role;
    const roleName = (role?.name || '').toUpperCase();
    const isSystemAdmin =
      roleName === 'SUPER ADMIN' || roleName === 'ADMIN' || roleName === 'OWNER';
    const isRoleActive = role ? role.isActive !== false : true;

    let subordinateUserIds: string[] = [];
    let teamUserIds: string[] = [];

    if (tenantUser) {
      const [subordinates, teamMembers] = await Promise.all([
        this.prisma.tenantUser.findMany({
          where: { tenantId, reportingManagerId: tenantUser.id, status: 'ACTIVE' },
          select: { userId: true },
        }),
        tenantUser.departmentId
          ? this.prisma.tenantUser.findMany({
              where: {
                tenantId,
                departmentId: tenantUser.departmentId,
                status: 'ACTIVE',
              },
              select: { userId: true },
            })
          : Promise.resolve([]),
      ]);

      subordinateUserIds = (subordinates || []).map((s) => s.userId);
      teamUserIds = (teamMembers || []).map((t) => t.userId);
    }

    return {
      userId,
      tenantId,
      roleName,
      isSystemAdmin,
      permissions: isRoleActive ? (role?.permissions || []) : [],
      departmentId: tenantUser?.departmentId || null,
      subordinateUserIds,
      teamUserIds,
    };
  }

  /**
   * Check if user has permission to access a specific module.
   */
  hasModulePermission(
    context: UserSecurityContext,
    module: PermissionModule | string,
  ): boolean {
    if (context.isSystemAdmin) {
      return true;
    }

    const perm = context.permissions.find(
      (p) => p.module.toLowerCase() === module.toLowerCase(),
    );

    return !!perm?.hasAccess;
  }

  /**
   * Builds record visibility WHERE clause for Leads.
   */
  getLeadsVisibilityFilter(context: UserSecurityContext): Prisma.LeadWhereInput {
    const baseWhere: Prisma.LeadWhereInput = {
      tenantId: context.tenantId,
      deletedAt: null,
    };

    if (context.isSystemAdmin) {
      return baseWhere;
    }

    if (context.roleName === 'MANAGER') {
      const allowedUserIds = [context.userId, ...context.subordinateUserIds];
      return {
        ...baseWhere,
        OR: [
          { assignedToId: { in: allowedUserIds } },
          { createdById: { in: allowedUserIds } },
          { assignedToId: null },
        ],
      };
    }

    // Default Employee / Sales scoping
    return {
      ...baseWhere,
      OR: [
        { assignedToId: context.userId },
        { createdById: context.userId },
      ],
    };
  }

  /**
   * Builds record visibility WHERE clause for Deals.
   */
  getDealsVisibilityFilter(context: UserSecurityContext): Prisma.DealWhereInput {
    const baseWhere: Prisma.DealWhereInput = {
      tenantId: context.tenantId,
      deletedAt: null,
    };

    if (context.isSystemAdmin) {
      return baseWhere;
    }

    if (context.roleName === 'MANAGER') {
      const allowedUserIds = [context.userId, ...context.subordinateUserIds];
      return {
        ...baseWhere,
        ownerId: { in: allowedUserIds },
      };
    }

    // Employee / Sales scoping
    return {
      ...baseWhere,
      ownerId: context.userId,
    };
  }

  /**
   * Builds record visibility WHERE clause for Customers.
   */
  getCustomersVisibilityFilter(
    context: UserSecurityContext,
  ): Prisma.CustomerWhereInput {
    const baseWhere: Prisma.CustomerWhereInput = {
      tenantId: context.tenantId,
      deletedAt: null,
    };

    if (context.isSystemAdmin) {
      return baseWhere;
    }

    if (context.roleName === 'MANAGER') {
      const allowedUserIds = [context.userId, ...context.subordinateUserIds];
      return {
        ...baseWhere,
        OR: [
          { assignedToId: { in: allowedUserIds } },
          { assignedToId: null },
        ],
      };
    }

    // Employee scoping
    return {
      ...baseWhere,
      assignedToId: context.userId,
    };
  }

  /**
   * Builds record visibility WHERE clause for Tasks.
   */
  getTasksVisibilityFilter(context: UserSecurityContext): Prisma.TaskWhereInput {
    const baseWhere: Prisma.TaskWhereInput = {
      tenantId: context.tenantId,
      deletedAt: null,
    };

    if (context.isSystemAdmin) {
      return baseWhere;
    }

    const allowedUserIds =
      context.roleName === 'MANAGER'
        ? [context.userId, ...context.subordinateUserIds]
        : [context.userId];

    const orConditions: Prisma.TaskWhereInput[] = [
      { assignedToId: { in: allowedUserIds } },
      { createdById: { in: allowedUserIds } },
      { visibility: 'ORGANIZATION' },
    ];

    if (context.teamUserIds.length > 0) {
      orConditions.push({
        visibility: 'TEAM',
        OR: [
          { assignedToId: { in: context.teamUserIds } },
          { createdById: { in: context.teamUserIds } },
        ],
      });
    }

    return {
      ...baseWhere,
      OR: orConditions,
    };
  }

  /**
   * Builds record visibility WHERE clause for Meetings / Calendar.
   */
  getMeetingsVisibilityFilter(
    context: UserSecurityContext,
  ): Prisma.MeetingWhereInput {
    const baseWhere: Prisma.MeetingWhereInput = {
      tenantId: context.tenantId,
    };

    if (context.isSystemAdmin) {
      return baseWhere;
    }

    const allowedUserIds =
      context.roleName === 'MANAGER'
        ? [context.userId, ...context.subordinateUserIds]
        : [context.userId];

    const orConditions: Prisma.MeetingWhereInput[] = [
      { assignedToId: { in: allowedUserIds } },
      { ownerId: { in: allowedUserIds } },
      { visibility: 'ORGANIZATION' },
    ];

    if (context.teamUserIds.length > 0) {
      orConditions.push({
        visibility: 'TEAM',
        OR: [
          { assignedToId: { in: context.teamUserIds } },
          { ownerId: { in: context.teamUserIds } },
        ],
      });
    }

    return {
      ...baseWhere,
      OR: orConditions,
    };
  }

  /**
   * Builds record visibility WHERE clause for Quotations.
   */
  getQuotationsVisibilityFilter(
    context: UserSecurityContext,
  ): Prisma.QuotationWhereInput {
    const baseWhere: Prisma.QuotationWhereInput = {
      tenantId: context.tenantId,
      deletedAt: null,
    };

    if (context.isSystemAdmin) {
      return baseWhere;
    }

    if (context.roleName === 'MANAGER') {
      const allowedUserIds = [context.userId, ...context.subordinateUserIds];
      return {
        ...baseWhere,
        OR: [
          { assignedToId: { in: allowedUserIds } },
          { assignedToId: null },
        ],
      };
    }

    // Employee scoping
    return {
      ...baseWhere,
      assignedToId: context.userId,
    };
  }

  /**
   * Log AI tool execution to AuditLog table.
   */
  async logToolExecution(
    context: UserSecurityContext,
    toolName: string,
    status: 'ALLOWED' | 'DENIED' | 'ERROR',
    details?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: context.tenantId,
          userId: context.userId,
          action: `AI_TOOL:${toolName}`,
          module: 'AI_CHAT',
          details: {
            toolName,
            status,
            role: context.roleName,
            ...details,
          },
        },
      });
    } catch (e: any) {
      this.logger.error(`Failed to record AI tool audit log: ${e.message}`);
    }
  }
}
