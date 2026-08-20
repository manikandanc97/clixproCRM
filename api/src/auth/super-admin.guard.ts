import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/context/tenant-context.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly tenantContext?: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Direct database check for isSuperAdmin flag (never trust frontend headers/flags)
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

    // Strict backend AAL2 enforcement for Super Admin platform access
    if (user.aal !== 'aal2') {
      // Record audit event for AAL2 denial
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'AAL2_REQUIRED_DENIED',
            module: 'SuperAdmin',
            details: {
              reason: 'Super Admin platform route accessed without AAL2 assurance',
              currentAal: user.aal || 'aal1',
              route: request.url || request.originalUrl,
            },
            ipAddress: request.ip || request.headers?.['x-forwarded-for'],
            userAgent: request.headers?.['user-agent'],
          },
        });
      } catch {
        // Suppress audit log insert errors so exception propagates cleanly
      }

      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        code: 'AAL2_REQUIRED',
        message: 'MFA verification required: AAL2 session assurance required for Super Admin platform access',
      });
    }

    request.isSuperAdmin = true;

    this.tenantContext?.setContext({
      userId: user.id,
      isSuperAdmin: true,
      userRole: { name: 'SUPER_ADMIN' },
    });

    return true;
  }
}

