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

    if (userRole.isActive === false) {
      throw new ForbiddenException('Role is currently deactivated');
    }

    const roleName = (userRole.name || '').toUpperCase();
    if (roleName === 'SUPER ADMIN' || roleName === 'ADMIN' || roleName === 'OWNER') {
      return true;
    }

    const hasRole = requiredRoles
      .map((r) => r.toUpperCase())
      .includes(roleName);

    if (hasRole) {
      return true;
    }

    // For custom roles: Check if user's permissions satisfy the module access
    // E.g., requiredRoles ['ADMIN', 'MANAGER', 'SALES'] for Leads/Deals/etc.
    if (userRole.permissions && Array.isArray(userRole.permissions)) {
      const activeModules = userRole.permissions
        .filter((p: any) => p.hasAccess)
        .map((p: any) => (p.module || '').toLowerCase());

      const normalizedRoles = requiredRoles.map((r) => r.toLowerCase());
      
      const hasModuleEquivalence = activeModules.some((mod: string) =>
        normalizedRoles.some(
          (reqRole) =>
            reqRole === mod ||
            (reqRole === 'sales' && (mod.includes('lead') || mod.includes('deal') || mod.includes('quotation') || mod.includes('customer') || mod.includes('contact') || mod.includes('company'))) ||
            (reqRole === 'manager' && (mod.includes('lead') || mod.includes('deal') || mod.includes('report') || mod.includes('employee'))) ||
            (reqRole === 'employee' && (mod.includes('task') || mod.includes('calendar'))),
        ),
      );

      if (hasModuleEquivalence) {
        return true;
      }
    }

    throw new ForbiddenException('Insufficient role permissions');
  }
}
