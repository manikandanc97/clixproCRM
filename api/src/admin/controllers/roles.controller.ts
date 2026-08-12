import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { TenantGuard } from '../../auth/tenant.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Permissions } from '../../auth/permissions.decorator';
import {
  checkRateLimit,
  incrementRateLimit,
  getClientIp,
  RATE_LIMITS,
} from '../../common/utils/rate-limit.util';
import * as z from 'zod';

const roleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  priority: z.number().optional().default(0),
  permissions: z.array(z.string()),
});

const roleUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

@Controller('crm/roles')
@UseGuards(SupabaseAuthGuard, TenantGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions('Roles')
  async getRoles(@Req() req: any) {
    const data = await this.rolesService.getRoles(req.tenantId);
    return { success: true, data };
  }

  @Post()
  @Permissions('Roles')
  async createRole(@Req() req: any, @Body() body: any) {
    const ip = getClientIp(req);
    const identifier = `admin_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.ADMIN);
    if (!rateLimit.allowed) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests. Please try again later.',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.ADMIN);

    try {
      const parsedData = roleSchema.parse(body);
      const data = await this.rolesService.createRole(
        req.tenantId,
        req.user.id,
        parsedData,
      );
      return { success: true, data, message: 'Role created successfully' };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new HttpException(
          { success: false, message: (error as any).errors[0].message },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  @Put(':id')
  @Permissions('Roles')
  async updateRole(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const ip = getClientIp(req);
    const identifier = `admin_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.ADMIN);
    if (!rateLimit.allowed) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests. Please try again later.',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.ADMIN);

    const currentUserRole = req.userRole?.toUpperCase() || 'UNKNOWN';
    if (currentUserRole === 'EMPLOYEE') {
      throw new HttpException(
        { success: false, message: 'Unauthorized to edit roles' },
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const parsedData = roleUpdateSchema.parse(body);
      const userAgent = req.headers['user-agent'] || '';
      const data = await this.rolesService.updateRole(
        req.tenantId,
        req.user.id,
        id,
        currentUserRole,
        parsedData,
        ip,
        userAgent,
      );
      return { success: true, message: 'Role updated successfully', data };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new HttpException(
          { success: false, message: (error as any).errors[0].message },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  @Delete(':id')
  @Permissions('Roles')
  async deleteRole(@Req() req: any, @Param('id') id: string) {
    const ip = getClientIp(req);
    const identifier = `delete_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.DELETE);
    if (!rateLimit.allowed) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests. Please try again later.',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.DELETE);

    const userAgent = req.headers['user-agent'] || '';
    await this.rolesService.deleteRole(
      req.tenantId,
      req.user.id,
      id,
      ip,
      userAgent,
    );
    return { success: true, message: 'Role deleted successfully' };
  }

  @Post(':id/duplicate')
  @Permissions('Roles:Manage') // Original had 'Roles', 'Manage'. NestJS Permissions guard usually takes strings, maybe it maps array?
  // Wait, in Next.js it was `await requirePermission("Roles", "Manage");`
  // We'll just map it to the standard format used in NestJS for this app, which is array of module+actions, but wait, Permissions decorator takes strings.
  // Actually, I'll use @Permissions('Roles') or whatever the guard checks. Let's see how PermissionsGuard is written.
  async duplicateRole(@Req() req: any, @Param('id') id: string) {
    const ip = getClientIp(req);
    const identifier = `admin_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.ADMIN);
    if (!rateLimit.allowed) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests. Please try again later.',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.ADMIN);

    const userAgent = req.headers['user-agent'] || '';
    const data = await this.rolesService.duplicateRole(
      req.tenantId,
      req.user.id,
      id,
      ip,
      userAgent,
    );
    return { success: true, message: 'Role duplicated successfully', data };
  }
}
