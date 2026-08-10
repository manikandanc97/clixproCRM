import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseAuthGuard } from './auth/supabase.guard';
import { TenantGuard } from './auth/tenant.guard';
import { RolesGuard } from './auth/roles.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { Roles } from './auth/roles.decorator';
import { Permissions } from './auth/permissions.decorator';

@Controller('crm')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): string {
    return 'OK';
  }

  @Get('auth-test')
  @UseGuards(SupabaseAuthGuard)
  testAuth(@Req() req: any) {
    return {
      message: 'Authenticated successfully',
      user: req.user,
    };
  }

  @Get('tenant-test')
  @UseGuards(SupabaseAuthGuard, TenantGuard)
  testTenant(@Req() req: any) {
    return {
      message: 'Tenant resolved successfully',
      tenantId: req.tenantId,
      role: req.userRole,
    };
  }

  @Get('rbac-test')
  @UseGuards(SupabaseAuthGuard, TenantGuard, RolesGuard, PermissionsGuard)
  @Roles('ADMIN')
  @Permissions('DASHBOARD_READ')
  testRbac() {
    return { message: 'RBAC verification successful' };
  }
}
