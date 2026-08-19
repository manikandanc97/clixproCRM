import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { userRole } = context.switchToHttp().getRequest();

    if (!userRole) {
      throw new ForbiddenException('No permissions found for user');
    }

    if (userRole.isActive === false) {
      throw new ForbiddenException('Role is currently deactivated');
    }

    const roleName = (userRole.name || '').toUpperCase().trim();
    const normalizedRole = roleName.replace(/[\s_]+/g, '');
    if (
      normalizedRole === 'SUPERADMIN' ||
      normalizedRole === 'ADMIN' ||
      normalizedRole === 'OWNER'
    ) {
      return true;
    }

    const matchesPermission = (required: string, userMod: string) => {
      if (!required || !userMod) return false;
      if (userMod === 'ALL' || userMod === 'all') return true;
      if (required === userMod) return true;
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const reqNorm = normalize(required);
      const userNorm = normalize(userMod);
      if (reqNorm === userNorm) return true;
      if (reqNorm.startsWith(userNorm) || userNorm.startsWith(reqNorm)) return true;
      if (
        (reqNorm.includes('role') && userNorm.includes('role')) ||
        (reqNorm.includes('report') && userNorm.includes('report')) ||
        (reqNorm.includes('employee') && userNorm.includes('employee')) ||
        (reqNorm.includes('support') && userNorm.includes('support'))
      ) {
        return true;
      }
      return false;
    };

    const hasPermission = userRole.permissions?.some(
      (p: any) =>
        p.hasAccess &&
        requiredPermissions.some((reqPerm) => matchesPermission(reqPerm, p.module)),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

