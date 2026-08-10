import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id'];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { role: { include: { permissions: true } } },
        },
      },
    });

    if (!userRecord || userRecord.memberships.length === 0) {
      throw new UnauthorizedException('User has no active tenant memberships');
    }

    const membership = tenantId
      ? userRecord.memberships.find((m: any) => m.tenantId === tenantId)
      : userRecord.memberships[0];

    if (!membership) {
      throw new UnauthorizedException('Invalid tenant');
    }

    request.tenantId = membership.tenantId;
    request.userRole = membership.role;
    return true;
  }
}
