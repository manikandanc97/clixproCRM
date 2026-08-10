import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoles(tenantId: string) {
    const roles = await this.prisma.role.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { users: true, permissions: true }
        },
        permissions: true
      },
      orderBy: [
        { isSystem: 'desc' },
        { priority: 'desc' },
        { name: 'asc' }
      ]
    });
    return roles;
  }

  async createRole(tenantId: string, userId: string, data: any) {
    const { name, description, color, priority, permissions } = data;

    const existing = await this.prisma.role.findFirst({
      where: { tenantId, name }
    });

    if (existing) {
      throw new HttpException({ success: false, message: 'Role name already exists' }, HttpStatus.BAD_REQUEST);
    }

    const role = await this.prisma.$transaction(async (tx) => {
      const newRole = await tx.role.create({
        data: {
          tenantId,
          name,
          description,
          color,
          priority: priority || 0,
          isSystem: false
        }
      });

      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map(module => ({
            roleId: newRole.id,
            module,
            hasAccess: true
          }))
        });
      }

      return newRole;
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE_ROLE',
        module: 'Roles',
        details: { roleName: role.name }
      }
    });

    return role;
  }

  async updateRole(tenantId: string, userId: string, roleId: string, currentUserRole: string, parsedData: any, reqIp: string, userAgent: string) {
    const existingRole = await this.prisma.role.findFirst({
      where: { tenantId, id: roleId }
    });

    if (!existingRole) {
      throw new HttpException({ success: false, message: 'Role not found' }, HttpStatus.NOT_FOUND);
    }

    if (existingRole.name.toUpperCase() === 'SUPER ADMIN' && currentUserRole !== 'SUPER ADMIN') {
      throw new HttpException({ success: false, message: 'Only Super Admin can modify the Super Admin role' }, HttpStatus.FORBIDDEN);
    }

    if (existingRole.isSystem && parsedData.name && parsedData.name !== existingRole.name) {
      throw new HttpException({ success: false, message: 'Cannot rename system roles' }, HttpStatus.BAD_REQUEST);
    }

    if (existingRole.isSystem && parsedData.isActive === false) {
      throw new HttpException({ success: false, message: 'Cannot disable system roles' }, HttpStatus.BAD_REQUEST);
    }

    const updatedRole = await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.update({
        where: { id: roleId },
        data: {
          name: parsedData.name,
          description: parsedData.description,
          color: parsedData.color,
          priority: parsedData.priority,
          isActive: existingRole.isSystem ? true : (parsedData.isActive ?? true),
        }
      });

      if (parsedData.permissions && Array.isArray(parsedData.permissions)) {
        await tx.rolePermission.deleteMany({
          where: { roleId }
        });

        if (parsedData.permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: parsedData.permissions.map((module: string) => ({
              roleId: role.id,
              module,
              hasAccess: true
            }))
          });
        }
      }

      return role;
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'UPDATE_ROLE',
        module: 'Roles',
        details: { roleName: updatedRole.name },
        ipAddress: reqIp,
        userAgent,
      }
    });

    return updatedRole;
  }

  async deleteRole(tenantId: string, userId: string, roleId: string, reqIp: string, userAgent: string) {
    const existingRole = await this.prisma.role.findFirst({
      where: { tenantId, id: roleId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!existingRole) {
      throw new HttpException({ success: false, message: 'Role not found' }, HttpStatus.NOT_FOUND);
    }

    if (existingRole.isSystem) {
      throw new HttpException({ success: false, message: 'Cannot delete system roles' }, HttpStatus.BAD_REQUEST);
    }

    if (existingRole._count.users > 0) {
      throw new HttpException({ success: false, message: 'Cannot delete role because it is assigned to users' }, HttpStatus.BAD_REQUEST);
    }

    await this.prisma.role.delete({
      where: { id: roleId }
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'DELETE_ROLE',
        module: 'Roles',
        details: { roleName: existingRole.name },
        ipAddress: reqIp,
        userAgent,
      }
    });

    return true;
  }

  async duplicateRole(tenantId: string, userId: string, roleId: string, reqIp: string, userAgent: string) {
    const existingRole = await this.prisma.role.findFirst({
      where: { tenantId, id: roleId },
      include: {
        permissions: true
      }
    });

    if (!existingRole) {
      throw new HttpException({ success: false, message: 'Role not found' }, HttpStatus.NOT_FOUND);
    }

    const newRoleName = `${existingRole.name} (Copy)`;

    const duplicateNameExists = await this.prisma.role.findFirst({
      where: { tenantId, name: newRoleName }
    });

    if (duplicateNameExists) {
      throw new HttpException({ success: false, message: 'A copy of this role already exists. Rename it first.' }, HttpStatus.BAD_REQUEST);
    }

    const newRole = await this.prisma.$transaction(async (tx) => {
      const createdRole = await tx.role.create({
        data: {
          tenantId,
          name: newRoleName,
          description: existingRole.description,
          color: existingRole.color,
          priority: existingRole.priority,
          isSystem: false
        }
      });

      if (existingRole.permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: existingRole.permissions.map((rp) => ({
            roleId: createdRole.id,
            module: rp.module,
            hasAccess: rp.hasAccess,
          }))
        });
      }

      return createdRole;
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'DUPLICATE_ROLE',
        module: 'Roles',
        details: { originalRole: existingRole.name, newRole: newRole.name },
        ipAddress: reqIp,
        userAgent,
      }
    });

    return newRole;
  }

  async getRoleManagementStats(tenantId: string) {
    const [
      totalUsers,
      activeUsers,
      disabledUsers,
      pendingInvites,
      totalRoles,
      customRoles,
      totalPermissions,
      totalDepartments,
      auditEvents
    ] = await Promise.all([
      this.prisma.tenantUser.count({ where: { tenantId } }),
      this.prisma.tenantUser.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.tenantUser.count({ where: { tenantId, status: { not: 'ACTIVE' } } }),
      this.prisma.invitation.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.role.count({ where: { tenantId } }),
      this.prisma.role.count({ where: { tenantId, isSystem: false } }),
      this.prisma.rolePermission.count({ where: { role: { tenantId } } }),
      this.prisma.department.count({ where: { tenantId } }),
      this.prisma.auditLog.count({ where: { tenantId } })
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        disabled: disabledUsers,
        pendingInvites
      },
      roles: {
        total: totalRoles,
        custom: customRoles,
        permissions: totalPermissions
      },
      departments: {
        total: totalDepartments
      },
      audit: {
        events: auditEvents
      }
    };
  }
}
