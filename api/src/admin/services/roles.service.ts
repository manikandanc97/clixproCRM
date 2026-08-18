/**
 * @file admin/services/roles.service.ts
 * Role CRUD operations with privilege escalation protection.
 * Stats aggregation is in role-stats.service.ts.
 */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { invalidateUserTenantCache } from '../../auth/tenant.guard';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoles(tenantId: string) {
    const roles = await this.prisma.role.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { users: true, permissions: true, invitations: true },
        },
        permissions: true,
      },
      orderBy: [{ isSystem: 'desc' }, { priority: 'desc' }, { name: 'asc' }],
    });
    return roles;
  }

  async getRoleById(tenantId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { tenantId, id: roleId },
      include: {
        _count: {
          select: { users: true, permissions: true, invitations: true },
        },
        permissions: true,
        users: {
          take: 20,
          include: {
            user: {
              select: { id: true, name: true, email: true, status: true },
            },
          },
        },
      },
    });

    if (!role) {
      throw new HttpException(
        { success: false, message: 'Role not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return role;
  }

  /**
   * Validates against privilege escalation:
   * Ensures the acting user only grants permissions that they themselves possess.
   */
  private async validatePermissionAuthority(
    tenantId: string,
    actorUserId: string,
    actorRoleName: string,
    requestedPermissions: string[],
  ): Promise<void> {
    const roleUpper = actorRoleName.toUpperCase();
    if (roleUpper === 'SUPER ADMIN' || roleUpper === 'ADMIN' || roleUpper === 'OWNER') {
      return; // Admins have full authority
    }

    // Fetch actor's active permissions
    const actorTenantUser = await this.prisma.tenantUser.findFirst({
      where: { tenantId, userId: actorUserId, status: 'ACTIVE' },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!actorTenantUser || !actorTenantUser.role) {
      throw new HttpException(
        { success: false, message: 'Unauthorized: Actor role not found' },
        HttpStatus.FORBIDDEN,
      );
    }

    const actorAllowedModules = new Set(
      actorTenantUser.role.permissions
        .filter((p) => p.hasAccess)
        .map((p) => p.module.toLowerCase()),
    );

    const unauthorizedPerms = requestedPermissions.filter(
      (perm) => !actorAllowedModules.has(perm.toLowerCase()),
    );

    if (unauthorizedPerms.length > 0) {
      throw new HttpException(
        {
          success: false,
          code: 'PRIVILEGE_ESCALATION_DENIED',
          message: `Cannot grant permissions beyond your own authority: ${unauthorizedPerms.join(', ')}`,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async createRole(
    tenantId: string,
    actorUserId: string,
    actorRoleName: string,
    data: {
      name: string;
      description?: string;
      color?: string;
      priority?: number;
      permissions?: string[];
      isActive?: boolean;
    },
    reqIp?: string,
    userAgent?: string,
  ) {
    const { name, description, color, priority, permissions, isActive } = data;
    const trimmedName = name.trim();

    // Check duplicate role name in tenant
    const existing = await this.prisma.role.findFirst({
      where: {
        tenantId,
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new HttpException(
        { success: false, message: 'A role with this name already exists' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Privilege escalation verification
    if (permissions && permissions.length > 0) {
      await this.validatePermissionAuthority(
        tenantId,
        actorUserId,
        actorRoleName,
        permissions,
      );
    }

    const role = await this.prisma.$transaction(async (tx) => {
      const newRole = await tx.role.create({
        data: {
          tenantId,
          name: trimmedName,
          description: description || '',
          color: color || '#3b82f6',
          priority: priority || 0,
          isSystem: false,
          isActive: isActive ?? true,
        },
      });

      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((module) => ({
            roleId: newRole.id,
            module,
            hasAccess: true,
          })),
        });
      }

      return newRole;
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorUserId,
        action: 'ROLE_CREATED',
        module: 'Roles',
        details: {
          roleId: role.id,
          roleName: role.name,
          permissionsCount: permissions?.length || 0,
        },
        ipAddress: reqIp,
        userAgent,
      },
    });

    return role;
  }

  async updateRole(
    tenantId: string,
    actorUserId: string,
    roleId: string,
    actorRoleName: string,
    parsedData: {
      name?: string;
      description?: string;
      color?: string;
      priority?: number;
      isActive?: boolean;
      permissions?: string[];
    },
    reqIp?: string,
    userAgent?: string,
  ) {
    const existingRole = await this.prisma.role.findFirst({
      where: { tenantId, id: roleId },
      include: { permissions: true },
    });

    if (!existingRole) {
      throw new HttpException(
        { success: false, message: 'Role not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const actorUpper = actorRoleName.toUpperCase();
    if (
      existingRole.name.toUpperCase() === 'SUPER ADMIN' &&
      actorUpper !== 'SUPER ADMIN'
    ) {
      throw new HttpException(
        {
          success: false,
          message: 'Only Super Admin can modify the Super Admin role',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      existingRole.isSystem &&
      parsedData.name &&
      parsedData.name.trim().toLowerCase() !== existingRole.name.toLowerCase()
    ) {
      throw new HttpException(
        { success: false, message: 'Cannot rename system roles' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (existingRole.isSystem && parsedData.isActive === false) {
      throw new HttpException(
        { success: false, message: 'Cannot deactivate system roles' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Privilege escalation check
    if (parsedData.permissions && Array.isArray(parsedData.permissions)) {
      await this.validatePermissionAuthority(
        tenantId,
        actorUserId,
        actorRoleName,
        parsedData.permissions,
      );
    }

    // Check name uniqueness if renaming custom role
    if (
      parsedData.name &&
      parsedData.name.trim().toLowerCase() !== existingRole.name.toLowerCase()
    ) {
      const duplicate = await this.prisma.role.findFirst({
        where: {
          tenantId,
          name: { equals: parsedData.name.trim(), mode: 'insensitive' },
          id: { not: roleId },
        },
      });
      if (duplicate) {
        throw new HttpException(
          { success: false, message: 'A role with this name already exists' },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const isStatusChanging =
      parsedData.isActive !== undefined &&
      parsedData.isActive !== existingRole.isActive;

    const updatedRole = await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.update({
        where: { id: roleId },
        data: {
          name: existingRole.isSystem ? existingRole.name : (parsedData.name?.trim() ?? existingRole.name),
          description: parsedData.description !== undefined ? parsedData.description : existingRole.description,
          color: parsedData.color ?? existingRole.color,
          priority: parsedData.priority ?? existingRole.priority,
          isActive: existingRole.isSystem
            ? true
            : (parsedData.isActive ?? existingRole.isActive),
        },
      });

      if (parsedData.permissions && Array.isArray(parsedData.permissions)) {
        await tx.rolePermission.deleteMany({
          where: { roleId },
        });

        if (parsedData.permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: parsedData.permissions.map((module: string) => ({
              roleId: role.id,
              module,
              hasAccess: true,
            })),
          });
        }
      }

      return role;
    });

    // Invalidate user tenant cache for all affected users
    invalidateUserTenantCache();

    // Audit logs
    if (isStatusChanging) {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId: actorUserId,
          action: parsedData.isActive ? 'ROLE_REACTIVATED' : 'ROLE_DEACTIVATED',
          module: 'Roles',
          details: { roleId: updatedRole.id, roleName: updatedRole.name },
          ipAddress: reqIp,
          userAgent,
        },
      });
    }

    if (parsedData.permissions && Array.isArray(parsedData.permissions)) {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId: actorUserId,
          action: 'ROLE_PERMISSIONS_CHANGED',
          module: 'Roles',
          details: {
            roleId: updatedRole.id,
            roleName: updatedRole.name,
            permissions: parsedData.permissions,
          },
          ipAddress: reqIp,
          userAgent,
        },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorUserId,
        action: 'ROLE_UPDATED',
        module: 'Roles',
        details: { roleId: updatedRole.id, roleName: updatedRole.name },
        ipAddress: reqIp,
        userAgent,
      },
    });

    return updatedRole;
  }

  async toggleRoleStatus(
    tenantId: string,
    actorUserId: string,
    roleId: string,
    isActive: boolean,
    reqIp?: string,
    userAgent?: string,
  ) {
    const existingRole = await this.prisma.role.findFirst({
      where: { tenantId, id: roleId },
    });

    if (!existingRole) {
      throw new HttpException(
        { success: false, message: 'Role not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (existingRole.isSystem && !isActive) {
      throw new HttpException(
        { success: false, message: 'Cannot deactivate system roles' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: { isActive },
    });

    invalidateUserTenantCache();

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorUserId,
        action: isActive ? 'ROLE_REACTIVATED' : 'ROLE_DEACTIVATED',
        module: 'Roles',
        details: { roleId: updatedRole.id, roleName: updatedRole.name },
        ipAddress: reqIp,
        userAgent,
      },
    });

    return updatedRole;
  }

  async deleteRole(
    tenantId: string,
    actorUserId: string,
    roleId: string,
    replacementRoleId?: string,
    reqIp?: string,
    userAgent?: string,
  ) {
    const existingRole = await this.prisma.role.findFirst({
      where: { tenantId, id: roleId },
      include: {
        _count: {
          select: { users: true, invitations: true },
        },
      },
    });

    if (!existingRole) {
      throw new HttpException(
        { success: false, message: 'Role not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (existingRole.isSystem) {
      throw new HttpException(
        { success: false, message: 'Cannot delete system roles' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const assignedUsers = existingRole._count.users;
    const pendingInvites = existingRole._count.invitations;

    if (assignedUsers > 0 || pendingInvites > 0) {
      if (!replacementRoleId) {
        throw new HttpException(
          {
            success: false,
            code: 'ROLE_HAS_ASSIGNED_USERS',
            message: `This role is currently assigned to ${assignedUsers} user(s) and ${pendingInvites} invitation(s). Reassign them to a replacement role before deleting.`,
            assignedUsers,
            pendingInvites,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (replacementRoleId === roleId) {
        throw new HttpException(
          {
            success: false,
            message: 'Replacement role cannot be the role being deleted',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Verify replacement role exists in the same tenant and is active
      const replacementRole = await this.prisma.role.findFirst({
        where: { tenantId, id: replacementRoleId },
      });

      if (!replacementRole) {
        throw new HttpException(
          { success: false, message: 'Replacement role not found in workspace' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (!replacementRole.isActive) {
        throw new HttpException(
          {
            success: false,
            message: 'Cannot reassign users to a deactivated role',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Transactional Reassignment & Deletion
      await this.prisma.$transaction(async (tx) => {
        // Reassign all active TenantUsers
        await tx.tenantUser.updateMany({
          where: { tenantId, roleId },
          data: { roleId: replacementRoleId },
        });

        // Reassign all Invitations
        await tx.invitation.updateMany({
          where: { tenantId, roleId },
          data: { roleId: replacementRoleId },
        });

        // Delete permissions
        await tx.rolePermission.deleteMany({
          where: { roleId },
        });

        // Delete role
        await tx.role.delete({
          where: { id: roleId },
        });
      });

      // Invalidate cache for reassigned users
      invalidateUserTenantCache();

      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId: actorUserId,
          action: 'ROLE_USERS_REASSIGNED',
          module: 'Roles',
          details: {
            deletedRoleId: roleId,
            deletedRoleName: existingRole.name,
            replacementRoleId,
            replacementRoleName: replacementRole.name,
            reassignedUsersCount: assignedUsers,
            reassignedInvitesCount: pendingInvites,
          },
          ipAddress: reqIp,
          userAgent,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId: actorUserId,
          action: 'ROLE_DELETED',
          module: 'Roles',
          details: {
            roleId: existingRole.id,
            roleName: existingRole.name,
            reassignedTo: replacementRole.name,
          },
          ipAddress: reqIp,
          userAgent,
        },
      });

      return {
        success: true,
        message: `Role deleted successfully. ${assignedUsers} user(s) reassigned to ${replacementRole.name}.`,
      };
    }

    // No assigned users - direct safe deletion
    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      await tx.role.delete({
        where: { id: roleId },
      });
    });

    invalidateUserTenantCache();

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorUserId,
        action: 'ROLE_DELETED',
        module: 'Roles',
        details: { roleId: existingRole.id, roleName: existingRole.name },
        ipAddress: reqIp,
        userAgent,
      },
    });

    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }

  async duplicateRole(
    tenantId: string,
    userId: string,
    roleId: string,
    reqIp?: string,
    userAgent?: string,
  ) {
    const existingRole = await this.prisma.role.findFirst({
      where: { tenantId, id: roleId },
      include: {
        permissions: true,
      },
    });

    if (!existingRole) {
      throw new HttpException(
        { success: false, message: 'Role not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    let copyIndex = 1;
    let newRoleName = `${existingRole.name} (Copy)`;
    while (
      await this.prisma.role.findFirst({
        where: { tenantId, name: { equals: newRoleName, mode: 'insensitive' } },
      })
    ) {
      copyIndex++;
      newRoleName = `${existingRole.name} (Copy ${copyIndex})`;
    }

    const newRole = await this.prisma.$transaction(async (tx) => {
      const createdRole = await tx.role.create({
        data: {
          tenantId,
          name: newRoleName,
          description: existingRole.description ? `Copy of ${existingRole.description}` : `Copy of ${existingRole.name}`,
          color: existingRole.color || '#3b82f6',
          priority: existingRole.priority,
          isSystem: false,
          isActive: true,
        },
      });

      if (existingRole.permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: existingRole.permissions.map((rp) => ({
            roleId: createdRole.id,
            module: rp.module,
            hasAccess: rp.hasAccess,
          })),
        });
      }

      return createdRole;
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'ROLE_DUPLICATED',
        module: 'Roles',
        details: {
          originalRoleId: existingRole.id,
          originalRoleName: existingRole.name,
          newRoleId: newRole.id,
          newRoleName: newRole.name,
        },
        ipAddress: reqIp,
        userAgent,
      },
    });

    return newRole;
  }

}
