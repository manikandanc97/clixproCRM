import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { PlatformAuditLogsService } from '../services/platform-audit-logs.service';

@Controller(['super-admin/audit-logs', 'super_admin/audit-logs'])
@UseGuards(SupabaseAuthGuard, SuperAdminGuard)
export class PlatformAuditLogsController {
  constructor(private readonly auditLogsService: PlatformAuditLogsService) {}

  @Get()
  async listAuditLogs(
    @Query('tenantId') tenantId?: string,
    @Query('action') action?: string,
    @Query('module') module?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.auditLogsService.listAuditLogs({
      tenantId,
      action,
      module,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    return {
      success: true,
      data,
    };
  }
}
