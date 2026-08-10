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

    const roleName = userRole.name.toUpperCase();
    if (
      roleName === 'SUPER ADMIN' ||
      roleName === 'ADMIN' ||
      userRole.isSystem
    ) {
      return true;
    }

    const hasPermission = userRole.permissions?.some(
      (p: any) => requiredPermissions.includes(p.module) && p.hasAccess,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
