import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AalGuard } from '../../auth/aal.guard';
import { RequireAal } from '../../auth/aal.decorator';
import { SecurityOperationsService } from '../services/security-operations.service';

@Controller([
  'super-admin/security/operations',
  'super_admin/security/operations',
])
@UseGuards(SupabaseAuthGuard, SuperAdminGuard, AalGuard)
@RequireAal('aal2')
export class PlatformSecurityOperationsController {
  constructor(private readonly secOpsService: SecurityOperationsService) {}

  @Get('health')
  async getHealth() {
    const data = await this.secOpsService.getSecurityHealth();
    return { success: true, data };
  }

  @Get('metrics')
  async getMetrics(@Query('period') period?: '24h' | '7d' | '30d') {
    const data = await this.secOpsService.getSecurityMetrics(period || '24h');
    return { success: true, data };
  }

  @Get('timeline')
  async getTimeline(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 25;
    const data = await this.secOpsService.getSecurityTimeline(limitNum);
    return { success: true, data };
  }

  @Get('config')
  getConfig() {
    const data = this.secOpsService.getSecurityConfig();
    return { success: true, data };
  }
}
