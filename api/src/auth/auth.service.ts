import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { SYSTEM_ROLE_PERMISSIONS } from '../common/role-permissions.constants';

interface CachedUserProfile {
  data: any;
  expiresAt: number;
}

const meProfileCache = new Map<string, CachedUserProfile>();

export function invalidateGetMeCache(userId?: string) {
  if (userId) {
    for (const key of meProfileCache.keys()) {
      if (key.startsWith(userId)) {
        meProfileCache.delete(key);
      }
    }
  } else {
    meProfileCache.clear();
  }
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string, tenantId: string, email?: string) {
    const cacheKey = `${userId}:${tenantId || ''}`;
    const now = Date.now();
    const cached = meProfileCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: tenantId ? { tenantId } : undefined,
          include: { role: { include: { permissions: true } } },
        },
      },
    });

    if (!user && email) {
      const emailUser = await this.prisma.user.findUnique({
        where: { email },
        include: {
          memberships: {
            where: tenantId ? { tenantId } : undefined,
            include: { role: { include: { permissions: true } } },
          },
        },
      });

      if (emailUser) {
        // Link the existing user by updating their ID to match Supabase UUID
        user = await this.prisma.user.update({
          where: { id: emailUser.id },
          data: { id: userId },
          include: {
            memberships: {
              where: tenantId ? { tenantId } : undefined,
              include: { role: { include: { permissions: true } } },
            },
          },
        });
      }
    }

    if (!user || user.memberships.length === 0) {
      throw new ForbiddenException('NEEDS_ONBOARDING');
    }

    const membership = user.memberships[0];
    const roleName = membership.role.name;
    const permissions = membership.role.permissions
      .filter((rp: any) => rp.hasAccess)
      .map((rp: any) => rp.module);

    const result = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        tenantId: membership.tenantId,
        role: roleName,
        permissions,
      },
    };

    meProfileCache.set(cacheKey, {
      data: result,
      expiresAt: now + 30000, // 30s TTL
    });

    return result;
  }

  async updateMe(userId: string, data: any) {
    invalidateGetMeCache(userId);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
    });
    return { user: updated };
  }

  async register(
    data: { userId: string; name: string; email: string; companyName: string },
    reqInfo: { ip?: string; userAgent?: string },
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: data.userId },
      include: { memberships: true },
    });

    if (
      existingUser &&
      existingUser.memberships &&
      existingUser.memberships.length > 0
    ) {
      throw new BadRequestException('User already completed onboarding');
    }

    // Attempt to link by email if user ID wasn't found
    if (!existingUser) {
      const existingEmailUser = await this.prisma.user.findUnique({
        where: { email: data.email },
        include: { memberships: true },
      });

      if (existingEmailUser) {
        if (
          existingEmailUser.memberships &&
          existingEmailUser.memberships.length > 0
        ) {
          throw new BadRequestException('User already completed onboarding');
        }
        // Update their ID to the new Supabase UUID so the transaction can safely use findUnique below
        await this.prisma.user.update({
          where: { id: existingEmailUser.id },
          data: { id: data.userId },
        });
      }
    }

    let slug = data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (existingTenant) {
      slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    return this.prisma.$transaction(async (tx: any) => {
      const tenant = await tx.tenant.create({
        data: { name: data.companyName, slug },
      });

      // Seed all 4 standard system roles with their canonical permission sets.
      // ADMIN role is created first so we can link the registering user to it.
      const STANDARD_ROLES = ['ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE'] as const;
      const createdRoles: Record<string, any> = {};

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

        createdRoles[roleName] = r;
      }

      const adminRole = createdRoles['ADMIN'];

      let user = await tx.user.findUnique({ where: { id: data.userId } });
      if (!user) {
        user = await tx.user.create({
          data: {
            id: data.userId,
            name: data.name,
            email: data.email,
          },
        });
      } else if (!user.name && data.name) {
        user = await tx.user.update({
          where: { id: user.id },
          data: { name: data.name },
        });
      }

      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          action: 'REGISTER_SUCCESS',
          module: 'Authentication',
          ipAddress: reqInfo.ip || null,
          userAgent: reqInfo.userAgent || null,
        },
      });

      return { user, tenant };
    });
  }
}
