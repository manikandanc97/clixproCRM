import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployees(tenantId: string, page = 1, limit = 10) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 10000));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { memberships: { some: { tenantId } } },
        include: {
          memberships: {
            where: { tenantId },
            select: { role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: { memberships: { some: { tenantId } } },
      }),
    ]);

    return {
      employees: users.map((u) => ({
        id: u.id,
        name: u.name || 'Unknown User',
        email: u.email,
        role: u.memberships[0]?.role?.name || 'EMPLOYEE',
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      })),
      stats: [
        {
          title: 'Total Employees',
          value: users.length.toString(),
          change: '+1',
          positive: true,
        },
        {
          title: 'Active Staff',
          value: users.length.toString(),
          change: '+1',
          positive: true,
        },
        { title: 'On Leave', value: '0', change: '0', positive: true },
      ],
      activities: [],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async inviteEmployee(tenantId: string, email: string, roleName: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingTenantUser = await this.prisma.tenantUser.findFirst({
      where: {
        tenantId,
        user: { email: normalizedEmail },
      },
    });

    if (existingTenantUser) {
      throw new Error('User is already an employee in this workspace');
    }

    let roleObj = await this.prisma.role.findFirst({
      where: { tenantId, name: roleName },
    });
    if (!roleObj) {
      roleObj = await this.prisma.role.create({
        data: { name: roleName, tenantId, isSystem: true },
      });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.upsert({
      where: { tenantId_email: { tenantId, email: normalizedEmail } },
      update: { roleId: roleObj.id, token, expiresAt, status: 'PENDING' },
      create: {
        tenantId,
        email: normalizedEmail,
        roleId: roleObj.id,
        token,
        expiresAt,
      },
    });

    return {
      email: invitation.email,
      role: roleName,
      status: 'INVITED',
      createdAt: invitation.createdAt.toISOString(),
      inviteToken: token,
    };
  }

  async updateEmployee(
    tenantId: string,
    userId: string,
    actorRole: string,
    data: { name?: string; email?: string; role?: string },
  ) {
    if (data.role === 'ADMIN' && actorRole !== 'ADMIN') {
      throw new HttpException(
        'Only ADMIN can assign the ADMIN role',
        HttpStatus.FORBIDDEN,
      );
    }

    const existingUser = await this.prisma.tenantUser.findFirst({
      where: { userId, tenantId },
      include: { user: true, role: true },
    });

    if (!existingUser) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }

    if (existingUser.role.name === 'ADMIN' && actorRole !== 'ADMIN') {
      throw new HttpException(
        'Only an ADMIN can modify an ADMIN',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const userData: Prisma.UserUpdateInput = {};
      if (data.name) userData.name = data.name;
      if (data.email) userData.email = data.email;

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userData,
        });
      }

      if (data.role !== undefined && data.role !== existingUser.role.name) {
        if (existingUser.role.name === 'ADMIN') {
          const adminCount = await tx.tenantUser.count({
            where: { tenantId, role: { name: 'ADMIN' }, status: 'ACTIVE' },
          });
          if (adminCount <= 1) {
            throw new HttpException(
              'Cannot demote the last active ADMIN.',
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        let finalRoleId: string = data.role;
        const roleObj = await tx.role.findFirst({
          where: { tenantId, name: data.role },
        });
        if (roleObj) finalRoleId = roleObj.id;

        await tx.tenantUser.update({
          where: { id: existingUser.id },
          data: { roleId: finalRoleId },
        });
      }
    });

    return { id: userId };
  }

  async patchEmployeeStatus(
    tenantId: string,
    userId: string,
    actorRole: string,
    status: string,
  ) {
    const existingUser = await this.prisma.tenantUser.findFirst({
      where: { userId, tenantId },
      include: { role: true },
    });

    if (!existingUser) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }

    if (existingUser.role.name === 'ADMIN' && actorRole !== 'ADMIN') {
      throw new HttpException(
        'Only an ADMIN can deactivate an ADMIN',
        HttpStatus.FORBIDDEN,
      );
    }

    if (existingUser.role.name === 'ADMIN' && status === 'INACTIVE') {
      const adminCount = await this.prisma.tenantUser.count({
        where: { tenantId, role: { name: 'ADMIN' }, status: 'ACTIVE' },
      });
      if (adminCount <= 1) {
        throw new HttpException(
          'Cannot deactivate the last active ADMIN.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: status as UserStatus },
    });

    return { id: userId };
  }

  async deleteEmployee(tenantId: string, userId: string, actorRole: string) {
    const existingUser = await this.prisma.tenantUser.findFirst({
      where: { userId, tenantId },
      include: { role: true },
    });

    if (!existingUser) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }

    if (existingUser.role.name === 'ADMIN' && actorRole !== 'ADMIN') {
      throw new HttpException(
        'Only an ADMIN can delete an ADMIN',
        HttpStatus.FORBIDDEN,
      );
    }

    if (existingUser.role.name === 'ADMIN') {
      const adminCount = await this.prisma.tenantUser.count({
        where: { tenantId, role: { name: 'ADMIN' }, status: 'ACTIVE' },
      });
      if (adminCount <= 1) {
        throw new HttpException(
          'Cannot delete the last active ADMIN.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const [leadsCount, dealsCount, tasksCount, customersCount] =
      await Promise.all([
        this.prisma.lead.count({
          where: {
            OR: [{ createdById: userId }, { assignedToId: userId }],
            tenantId,
          },
        }),
        this.prisma.deal.count({ where: { ownerId: userId, tenantId } }),
        this.prisma.task.count({
          where: {
            OR: [{ createdById: userId }, { assignedToId: userId }],
            tenantId,
          },
        }),
        this.prisma.customer.count({
          where: { assignedToId: userId, tenantId },
        }),
      ]);

    if (
      leadsCount > 0 ||
      dealsCount > 0 ||
      tasksCount > 0 ||
      customersCount > 0
    ) {
      throw new HttpException(
        'Cannot delete employee with historical CRM activity. Please DEACTIVATE the employee instead to preserve data.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.tenantUser.delete({
        where: { id: existingUser.id },
      });

      const remainingMemberships = await tx.tenantUser.count({
        where: { userId },
      });

      if (remainingMemberships === 0) {
        await tx.user.delete({
          where: { id: userId },
        });
      }
    });

    return { id: userId };
  }
}
