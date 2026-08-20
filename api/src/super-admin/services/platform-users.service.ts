import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class PlatformUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(query: {
    search?: string;
    status?: UserStatus;
    isSuperAdmin?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(query.limit || 20, 1000));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.isSuperAdmin !== undefined) {
      where.isSuperAdmin = query.isSuperAdmin;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          memberships: {
            include: {
              tenant: { select: { id: true, name: true, slug: true, status: true } },
              role: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        status: u.status,
        isSuperAdmin: u.isSuperAdmin,
        createdAt: u.createdAt.toISOString(),
        organizations: u.memberships.map((m) => ({
          tenantId: m.tenant.id,
          name: m.tenant.name,
          slug: m.tenant.slug,
          status: m.tenant.status,
          role: m.role.name,
          membershipStatus: m.status,
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            tenant: true,
            role: { include: { permissions: true } },
            department: true,
          },
        },
        _count: {
          select: {
            assignedLeads: true,
            assignedTasks: true,
            assignedCustomers: true,
            ownedDeals: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      counts: user._count,
      memberships: user.memberships.map((m) => ({
        id: m.id,
        tenantId: m.tenantId,
        organizationName: m.tenant.name,
        organizationSlug: m.tenant.slug,
        organizationStatus: m.tenant.status,
        role: m.role.name,
        department: m.department?.name || null,
        status: m.status,
        joinedAt: m.joinedAt.toISOString(),
      })),
    };
  }

  async updateUserStatus(
    id: string,
    status: UserStatus,
    adminActorId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isSuperAdmin && user.id === adminActorId && status !== 'ACTIVE') {
      throw new ForbiddenException('You cannot deactivate your own Super Admin account');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminActorId,
        targetUserId: id,
        action: 'USER_STATUS_UPDATED',
        module: 'SuperAdmin',
        details: { previousStatus: user.status, newStatus: status },
      },
    });

    return updated;
  }

  async toggleSuperAdmin(
    id: string,
    isSuperAdmin: boolean,
    adminActorId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!isSuperAdmin && user.isSuperAdmin) {
      // Ensure there is at least one other active super admin
      const superAdminCount = await this.prisma.user.count({
        where: { isSuperAdmin: true, status: 'ACTIVE' },
      });
      if (superAdminCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the last remaining active Super Admin.',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isSuperAdmin },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminActorId,
        targetUserId: id,
        action: isSuperAdmin ? 'USER_PROMOTED_SUPER_ADMIN' : 'USER_DEMOTED_SUPER_ADMIN',
        module: 'SuperAdmin',
        details: { isSuperAdmin },
      },
    });

    return updated;
  }
}
