import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { TenantGuard } from '../../auth/tenant.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Permissions } from '../../auth/permissions.decorator';

@Controller('crm/role-management/stats')
@UseGuards(SupabaseAuthGuard, TenantGuard, PermissionsGuard)
export class RoleManagementController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions('Roles:View')
  async getRoleManagementStats(@Req() req: any) {
    const data = await this.rolesService.getRoleManagementStats(req.tenantId);
    return { success: true, data };
  }
}
