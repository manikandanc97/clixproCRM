import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CachedUserRecord {
  memberships: Array<{
    tenantId: string;
    role: any;
  }>;
  expiresAt: number;
}

const userMembershipCache = new Map<string, CachedUserRecord>();

// Periodically clean expired user memberships
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of userMembershipCache.entries()) {
    if (val.expiresAt <= now) {
      userMembershipCache.delete(key);
    }
  }
}, 60000).unref?.();

/**
 * Invalidate cached membership for a user when roles/status change
 */
export function invalidateUserTenantCache(userId?: string) {
  if (userId) {
    userMembershipCache.delete(userId);
  } else {
    userMembershipCache.clear();
  }
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const t0 = performance.now();
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id'];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const now = Date.now();
    let memberships: Array<{ tenantId: string; role: any }> | null = null;
    const cached = userMembershipCache.get(user.id);

    let isCached = false;
    if (cached && cached.expiresAt > now) {
      memberships = cached.memberships;
      isCached = true;
    } else {
      const tDb0 = performance.now();
      const userRecord = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          memberships: {
            where: { status: 'ACTIVE' },
            include: { role: { include: { permissions: true } } },
          },
        },
      });
      const tDb1 = performance.now();
      console.log(`[PROFILE: TenantGuard] DB query for user memberships: ${(tDb1 - tDb0).toFixed(2)} ms`);

      if (!userRecord || userRecord.memberships.length === 0) {
        userMembershipCache.delete(user.id);
        throw new UnauthorizedException('User has no active tenant memberships');
      }

      memberships = userRecord.memberships.map((m: any) => ({
        tenantId: m.tenantId,
        role: m.role,
      }));

      userMembershipCache.set(user.id, {
        memberships,
        expiresAt: now + 30000, // 30s TTL
      });
    }

    const membership = tenantId
      ? memberships.find((m: any) => m.tenantId === tenantId)
      : memberships[0];

    if (!membership) {
      throw new UnauthorizedException('Invalid tenant');
    }

    request.tenantId = membership.tenantId;
    request.userRole = membership.role;
    const totalDur = performance.now() - t0;
    console.log(`[PROFILE: TenantGuard] Total guard duration: ${totalDur.toFixed(2)} ms (Cached: ${isCached})`);
    return true;
  }
}

