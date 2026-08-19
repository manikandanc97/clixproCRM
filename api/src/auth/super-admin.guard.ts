import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Direct database check for isSuperAdmin flag
    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, isSuperAdmin: true, status: true },
    });

    if (!userRecord) {
      throw new ForbiddenException('User record not found');
    }

    if (userRecord.status !== 'ACTIVE') {
      throw new ForbiddenException('User account is not active');
    }

    if (!userRecord.isSuperAdmin) {
      throw new ForbiddenException('Access denied: Super Admin platform privileges required');
    }

    request.isSuperAdmin = true;
    return true;
  }
}
