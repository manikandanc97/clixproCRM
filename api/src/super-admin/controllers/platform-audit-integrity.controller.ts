import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AalGuard } from '../../auth/aal.guard';
import { RequireAal } from '../../auth/aal.decorator';
import { AuditIntegrityMonitorService } from '../../common/audit/integrity/audit-integrity-monitor.service';
import { AuditDisasterRecoveryService } from '../../common/audit/integrity/audit-dr.service';

@Controller([
  'super-admin/audit-integrity',
  'super-admin/security/audit-integrity',
  'super_admin/audit-integrity',
  'super_admin/security/audit-integrity',
])
@UseGuards(SupabaseAuthGuard, SuperAdminGuard, AalGuard)
@RequireAal('aal2')
export class PlatformAuditIntegrityController {
  constructor(
    private readonly monitorService: AuditIntegrityMonitorService,
    private readonly drService: AuditDisasterRecoveryService,
  ) {}

  @Get('status')
  async getStatus() {
    const report = await this.monitorService.getSystemStatus();
    return {
      success: true,
      data: report,
    };
  }

  @Get('recent')
  async getRecent(@Query('hours') hours?: string) {
    const parsedHours = hours ? parseInt(hours, 10) : 24;
    const report = await this.monitorService.verifyRecent(parsedHours);
    return {
      success: true,
      data: report,
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async triggerVerify(@Query('tenantId') tenantId?: string) {
    const report = await this.monitorService.runIntegrityVerification({
      tenantId: tenantId || null,
    });
    return {
      success: true,
      data: report,
    };
  }

  @Post('verify/:tenantId')
  @HttpCode(HttpStatus.OK)
  async triggerTenantVerify(@Param('tenantId') tenantId: string) {
    const report = await this.monitorService.runIntegrityVerification({
      tenantId,
    });
    return {
      success: true,
      data: report,
    };
  }

  @Post('dr-verify/:recordId')
  @HttpCode(HttpStatus.OK)
  async triggerDrVerify(@Param('recordId') recordId: string) {
    const result = await this.drService.verifyAuditArchiveRestore(recordId);
    return {
      success: true,
      data: result,
    };
  }
}
