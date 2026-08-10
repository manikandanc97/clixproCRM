import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { userRole } = context.switchToHttp().getRequest();

    if (!userRole) {
      throw new ForbiddenException('No role assigned to user');
    }

    const roleName = userRole.name.toUpperCase();
    if (roleName === 'SUPER ADMIN' || roleName === 'ADMIN') {
      return true;
    }

    const hasRole = requiredRoles
      .map((r) => r.toUpperCase())
      .includes(roleName);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
