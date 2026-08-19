import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  Logger,
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
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string, tenantId?: string, email?: string) {
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
          where: { status: 'ACTIVE' },
          include: {
            role: { include: { permissions: true } },
            tenant: true,
          },
        },
      },
    });

    if (!user && email) {
      const emailUser = await this.prisma.user.findUnique({
        where: { email },
        include: {
          memberships: {
            where: { status: 'ACTIVE' },
            include: {
              role: { include: { permissions: true } },
              tenant: true,
            },
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
              where: { status: 'ACTIVE' },
              include: {
                role: { include: { permissions: true } },
                tenant: true,
              },
            },
          },
        });
      }
    }

    if (!user || !user.memberships || user.memberships.length === 0) {
      throw new ForbiddenException('NEEDS_ONBOARDING');
    }

    const membership = tenantId
      ? user.memberships.find((m: any) => m.tenantId === tenantId) || user.memberships[0]
      : user.memberships[0];

    if (!membership || !membership.role) {
      throw new ForbiddenException('NEEDS_ONBOARDING');
    }

    const roleName = membership.role.name;
    const permissions = (membership.role.permissions || [])
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
        companyName: membership.tenant?.name || 'My Workspace',
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

  async deleteAccount(
    userId: string,
    tenantId: string,
    confirmation: { confirm1?: string; confirm2?: string },
  ) {
    const membership = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('User is not a member of this workspace.');
    }

    const expectedCompanyName = (membership.tenant?.name || '').trim().toLowerCase();
    const providedConfirm1 = (confirmation?.confirm1 || '').trim().toLowerCase();
    const providedConfirm2 = (confirmation?.confirm2 || '').trim().toLowerCase();

    const isCompanyMatch =
      providedConfirm1 === expectedCompanyName ||
      providedConfirm1 === 'clixprocrm' ||
      (membership.tenant?.slug && providedConfirm1 === membership.tenant.slug.toLowerCase());

    const isSecondMatch = providedConfirm2 === 'delete my account';

    if (!confirmation || !isCompanyMatch || !isSecondMatch) {
      throw new BadRequestException(
        'Confirmation strings do not match the required text.',
      );
    }

    const isAdmin = membership.role.name === 'ADMIN';

    try {
      if (isAdmin) {
        // Complete workspace-level permanent deletion in a single atomic transaction
        await this.prisma.$transaction(
          async (tx: any) => {
            // 1. Break circular / self-referential / non-cascading FK references
          await tx.$executeRawUnsafe(
            `UPDATE "TenantUser" SET "reportingManagerId" = NULL, "departmentId" = NULL WHERE "tenantId" = $1`,
            tenantId,
          );
          await tx.$executeRawUnsafe(
            `UPDATE "Task" SET "relatedCustomerId" = NULL, "relatedLeadId" = NULL, "relatedMeetingId" = NULL, "relatedQuotationId" = NULL, "relatedDealId" = NULL WHERE "tenantId" = $1`,
            tenantId,
          );
          await tx.$executeRawUnsafe(
            `UPDATE "Meeting" SET "customerId" = NULL, "leadId" = NULL, "quotationId" = NULL, "dealId" = NULL WHERE "tenantId" = $1`,
            tenantId,
          );
          await tx.$executeRawUnsafe(
            `UPDATE "Quotation" SET "customerId" = NULL, "dealId" = NULL WHERE "tenantId" = $1`,
            tenantId,
          );
          await tx.$executeRawUnsafe(
            `UPDATE "Deal" SET "companyId" = NULL, "customerId" = NULL, "leadId" = NULL WHERE "tenantId" = $1`,
            tenantId,
          );
          await tx.$executeRawUnsafe(
            `UPDATE "Lead" SET "customerId" = NULL, "companyId" = NULL WHERE "tenantId" = $1`,
            tenantId,
          );
          await tx.$executeRawUnsafe(
            `UPDATE "Customer" SET "companyId" = NULL WHERE "tenantId" = $1`,
            tenantId,
          );

          // 2. Delete child models of AI & RAG
          const convs = await tx.aiConversation.findMany({
            where: { tenantId },
            select: { id: true },
          });
          if (convs.length > 0) {
            const convIds = convs.map((c: any) => c.id);
            await tx.aiMessage.deleteMany({
              where: { conversationId: { in: convIds } },
            });
          }
          await tx.aiConversation.deleteMany({ where: { tenantId } });

          const docs = await tx.document.findMany({
            where: { tenantId },
            select: { id: true },
          });
          if (docs.length > 0) {
            const docIds = docs.map((d: any) => d.id);
            await tx.documentChunk.deleteMany({
              where: { documentId: { in: docIds } },
            });
          }
          await tx.document.deleteMany({ where: { tenantId } });
          await tx.tenantAiConfig.deleteMany({ where: { tenantId } });

          // 3. Delete tenant timeline events, attachments, notes, notifications
          await tx.timelineEvent.deleteMany({ where: { tenantId } });
          await tx.attachment.deleteMany({ where: { tenantId } });
          await tx.note.deleteMany({ where: { tenantId } });
          await tx.notification.deleteMany({ where: { tenantId } });

          // 4. Delete financial & operational records
          await tx.invoice.deleteMany({ where: { tenantId } });
          await tx.invoiceCounter.deleteMany({ where: { tenantId } });
          await tx.quotation.deleteMany({ where: { tenantId } });
          await tx.task.deleteMany({ where: { tenantId } });
          await tx.meeting.deleteMany({ where: { tenantId } });
          await tx.deal.deleteMany({ where: { tenantId } });
          await tx.lead.deleteMany({ where: { tenantId } });
          await tx.customer.deleteMany({ where: { tenantId } });
          await tx.company.deleteMany({ where: { tenantId } });
          await tx.product.deleteMany({ where: { tenantId } });
          await tx.revenueTarget.deleteMany({ where: { tenantId } });
          await tx.invitation.deleteMany({ where: { tenantId } });

          // 5. Gather all users who belong to this tenant
          const tenantUsers = await tx.tenantUser.findMany({
            where: { tenantId },
            select: { userId: true },
          });
          const userIdsInTenant: string[] = tenantUsers.map(
            (tu: any) => tu.userId,
          );

          // Delete tenant user memberships
          await tx.tenantUser.deleteMany({ where: { tenantId } });

          // 6. Delete roles, permissions, departments
          const roles = await tx.role.findMany({
            where: { tenantId },
            select: { id: true },
          });
          if (roles.length > 0) {
            const roleIds = roles.map((r: any) => r.id);
            await tx.rolePermission.deleteMany({
              where: { roleId: { in: roleIds } },
            });
          }
          await tx.role.deleteMany({ where: { tenantId } });
          await tx.department.deleteMany({ where: { tenantId } });

          // 7. Delete Audit Logs associated with this tenant
          await tx.auditLog.deleteMany({ where: { tenantId } });

          // 8. Delete Tenant
          await tx.tenant.delete({ where: { id: tenantId } });

          // 9. Clean up users who have no other tenant memberships
          for (const uid of userIdsInTenant) {
            const otherMemberships = await tx.tenantUser.count({
              where: { userId: uid },
            });
            if (otherMemberships === 0) {
              await tx.auditLog.deleteMany({
                where: {
                  OR: [{ userId: uid }, { targetUserId: uid }],
                },
              });
              await tx.user.delete({ where: { id: uid } });
            }
          }
        },
        { maxWait: 10000, timeout: 30000 },
      );
      } else {
        // Normal non-admin user deletion: Remove user's membership and personal records only
        await this.prisma.$transaction(
          async (tx: any) => {
            await tx.$executeRawUnsafe(
              `UPDATE "TenantUser" SET "reportingManagerId" = NULL WHERE "id" = $1 OR "reportingManagerId" = $1`,
              membership.id,
            );

            await tx.$executeRawUnsafe(
              `UPDATE "Customer" SET "assignedToId" = NULL WHERE "assignedToId" = $1 AND "tenantId" = $2`,
              userId,
              tenantId,
            );
            await tx.$executeRawUnsafe(
              `UPDATE "Lead" SET "assignedToId" = NULL, "createdById" = NULL, "updatedById" = NULL WHERE ("assignedToId" = $1 OR "createdById" = $1 OR "updatedById" = $1) AND "tenantId" = $2`,
              userId,
              tenantId,
            );
            await tx.$executeRawUnsafe(
              `UPDATE "Task" SET "assignedToId" = NULL, "createdById" = NULL, "completedById" = NULL WHERE ("assignedToId" = $1 OR "createdById" = $1 OR "completedById" = $1) AND "tenantId" = $2`,
              userId,
              tenantId,
            );
            await tx.$executeRawUnsafe(
              `UPDATE "Quotation" SET "assignedToId" = NULL WHERE "assignedToId" = $1 AND "tenantId" = $2`,
              userId,
              tenantId,
            );
            await tx.$executeRawUnsafe(
              `UPDATE "Meeting" SET "assignedToId" = NULL, "ownerId" = NULL WHERE ("assignedToId" = $1 OR "ownerId" = $1) AND "tenantId" = $2`,
              userId,
              tenantId,
            );
            await tx.$executeRawUnsafe(
              `UPDATE "Company" SET "ownerId" = NULL WHERE "ownerId" = $1 AND "tenantId" = $2`,
              userId,
              tenantId,
            );
            await tx.$executeRawUnsafe(
              `UPDATE "Deal" SET "ownerId" = NULL WHERE "ownerId" = $1 AND "tenantId" = $2`,
              userId,
              tenantId,
            );

            const convs = await tx.aiConversation.findMany({
              where: { userId, tenantId },
              select: { id: true },
            });
            if (convs.length > 0) {
              const convIds = convs.map((c: any) => c.id);
              await tx.aiMessage.deleteMany({
                where: { conversationId: { in: convIds } },
              });
            }
            await tx.aiConversation.deleteMany({ where: { userId, tenantId } });
            await tx.notification.deleteMany({ where: { userId, tenantId } });
            await tx.attachment.deleteMany({ where: { userId, tenantId } });
            await tx.note.deleteMany({ where: { userId, tenantId } });
            await tx.timelineEvent.deleteMany({ where: { userId, tenantId } });

            await tx.tenantUser.delete({ where: { id: membership.id } });

            const otherMemberships = await tx.tenantUser.count({
              where: { userId },
            });
            if (otherMemberships === 0) {
              await tx.auditLog.deleteMany({
                where: {
                  OR: [{ userId }, { targetUserId: userId }],
                },
              });
              await tx.user.delete({ where: { id: userId } });
            }
          },
          { maxWait: 10000, timeout: 30000 },
        );
      }

      this.logger.log(
        `Initiating account deletion transaction for tenantId: ${tenantId}, userId: ${userId}, isAdmin: ${isAdmin}`,
      );

      // Purge user from Supabase Auth Provider if user ID is a valid UUID
      try {
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            userId,
          );
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey =
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.SUPABASE_ANON_KEY;
        if (isUUID && supabaseUrl && supabaseKey) {
          const { createClient } = require('@supabase/supabase-js');
          const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
          await supabaseAdmin.auth.admin.deleteUser(userId);
        }
      } catch (authErr: any) {
        this.logger.warn(
          `Supabase Auth admin deleteUser warning for userId: ${userId}: ${authErr?.message || authErr}`,
        );
      }

      // Invalidate memory caches
      invalidateGetMeCache(userId);
      try {
        const { invalidateUserTenantCache } = require('./tenant.guard');
        invalidateUserTenantCache(userId);
      } catch (_) {}

      this.logger.log(
        `Account deletion transaction committed successfully for tenantId: ${tenantId}, userId: ${userId}`,
      );

      return {
        success: true,
        message:
          'Your account and workspace data have been permanently deleted.',
      };
    } catch (error: any) {
      this.logger.error(
        `Account deletion transaction failed for tenantId: ${tenantId}, userId: ${userId}: ${error?.message || error}`,
      );
      throw new BadRequestException(
        'Account deletion failed. No data was deleted. Please try again.',
      );
    }
  }
}
