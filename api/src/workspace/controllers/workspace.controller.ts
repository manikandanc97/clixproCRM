import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { WorkspaceService } from '../services/workspace.service';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { TenantGuard } from '../../auth/tenant.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('crm/workspace')
@UseGuards(SupabaseAuthGuard, TenantGuard, RolesGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER')
  async getWorkspace(@Req() req: any) {
    const data = await this.workspaceService.getWorkspace(req.tenantId);
    return { success: true, data };
  }

  @Patch()
  @Roles('ADMIN')
  async updateWorkspace(@Req() req: any, @Body() data: any) {
    const updated = await this.workspaceService.updateWorkspace(
      req.tenantId,
      data,
    );
    return { success: true, data: updated };
  }
}
