import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SYSTEM_ROLE_PERMISSIONS } from '../../common/role-permissions.constants';
import * as crypto from 'crypto';

@Injectable()
export class PlatformOrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrganizations(query: {
    search?: string;
    status?: 'ACTIVE' | 'SUSPENDED';
    plan?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(query.limit || 20, 100));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.plan) {
      where.plan = query.plan;
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              leads: true,
              customers: true,
              deals: true,
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      organizations: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        status: t.status,
        currency: t.currency,
        timezone: t.timezone,
        userCount: t._count.users,
        leadCount: t._count.leads,
        customerCount: t._count.customers,
        dealCount: t._count.deals,
        taskCount: t._count.tasks,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrganizationDetails(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, status: true },
            },
            role: {
              select: { id: true, name: true, priority: true },
            },
          },
        },
        _count: {
          select: {
            leads: true,
            customers: true,
            deals: true,
            tasks: true,
            invoices: true,
            quotations: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Organization not found');
    }

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      taxId: tenant.taxId,
      address: tenant.address,
      currency: tenant.currency,
      timezone: tenant.timezone,
      logo: tenant.logo,
      counts: tenant._count,
      members: tenant.users.map((m) => ({
        membershipId: m.id,
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        phone: m.user.phone,
        status: m.status,
        role: m.role?.name || 'EMPLOYEE',
        joinedAt: m.joinedAt.toISOString(),
      })),
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString(),
    };
  }

  async createOrganization(
    data: {
      name: string;
      slug?: string;
      plan?: string;
      currency?: string;
      timezone?: string;
    },
    adminActorId: string,
  ) {
    let slug = data.slug
      ? data.slug.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const existingSlug = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.name,
          slug,
          plan: data.plan || 'free',
          currency: data.currency || 'INR',
          timezone: data.timezone || 'utc',
          status: 'ACTIVE',
        },
      });

      // Seed standard system roles
      const STANDARD_ROLES = ['ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE'] as const;
      for (const roleName of STANDARD_ROLES) {
        const r = await tx.role.create({
          data: {
            name: roleName,
            tenantId: tenant.id,
            isSystem: true,
            priority:
              roleName === 'ADMIN'
                ? 100
                : roleName === 'MANAGER'
                  ? 70
                  : roleName === 'SALES'
                    ? 40
                    : 10,
          },
        });

        const moduleList = SYSTEM_ROLE_PERMISSIONS[roleName] || [];
        if (moduleList.length > 0) {
          await tx.rolePermission.createMany({
            data: moduleList.map((module: string) => ({
              roleId: r.id,
              module,
              hasAccess: true,
            })),
          });
        }
      }

      // Record platform audit log
      await tx.auditLog.create({
        data: {
          userId: adminActorId,
          tenantId: tenant.id,
          action: 'ORGANIZATION_CREATED',
          module: 'SuperAdmin',
          details: { name: tenant.name, plan: tenant.plan, slug: tenant.slug },
        },
      });

      return tenant;
    });
  }

  async updateOrganization(
    id: string,
    data: {
      name?: string;
      plan?: string;
      status?: 'ACTIVE' | 'SUSPENDED';
      currency?: string;
      timezone?: string;
      taxId?: string;
      address?: string;
    },
    adminActorId: string,
  ) {
    const existing = await this.prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Organization not found');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.plan && { plan: data.plan }),
        ...(data.status && { status: data.status }),
        ...(data.currency && { currency: data.currency }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.taxId !== undefined && { taxId: data.taxId }),
        ...(data.address !== undefined && { address: data.address }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminActorId,
        tenantId: id,
        action: 'ORGANIZATION_UPDATED',
        module: 'SuperAdmin',
        details: { previous: existing, updated: data },
      },
    });

    return updated;
  }

  async updateStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED',
    adminActorId: string,
    reason?: string,
  ) {
    const existing = await this.prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Organization not found');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { status },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminActorId,
        tenantId: id,
        action: status === 'ACTIVE' ? 'ORGANIZATION_ACTIVATED' : 'ORGANIZATION_SUSPENDED',
        module: 'SuperAdmin',
        details: { previousStatus: existing.status, newStatus: status, reason },
      },
    });

    return updated;
  }
}
