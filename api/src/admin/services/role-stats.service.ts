import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * @file admin/services/role-stats.service.ts
 * Role management statistics aggregation.
 * Extracted from roles.service.ts — single responsibility: tenant-wide role/user/audit metrics.
 */
@Injectable()
export class RoleStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoleManagementStats(tenantId: string) {
    const [
      totalUsers,
      activeUsers,
      disabledUsers,
      pendingInvites,
      totalRoles,
      systemRoles,
      customRoles,
      activeRoles,
      totalPermissions,
      totalDepartments,
      auditEvents,
    ] = await Promise.all([
      this.prisma.tenantUser.count({ where: { tenantId } }),
      this.prisma.tenantUser.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.tenantUser.count({ where: { tenantId, status: { not: 'ACTIVE' } } }),
      this.prisma.invitation.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.role.count({ where: { tenantId } }),
      this.prisma.role.count({ where: { tenantId, isSystem: true } }),
      this.prisma.role.count({ where: { tenantId, isSystem: false } }),
      this.prisma.role.count({ where: { tenantId, isActive: true } }),
      this.prisma.rolePermission.count({ where: { role: { tenantId } } }),
      this.prisma.department.count({ where: { tenantId } }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers, disabled: disabledUsers, pendingInvites },
      roles: { total: totalRoles, system: systemRoles, custom: customRoles, active: activeRoles, permissions: totalPermissions },
      departments: { total: totalDepartments },
      audit: { events: auditEvents },
    };
  }
}
