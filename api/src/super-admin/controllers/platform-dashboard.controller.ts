import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { PlatformDashboardService } from '../services/platform-dashboard.service';

@Controller(['super-admin/dashboard', 'super_admin/dashboard'])
@UseGuards(SupabaseAuthGuard, SuperAdminGuard)
export class PlatformDashboardController {
  constructor(private readonly dashboardService: PlatformDashboardService) {}

  @Get()
  async getOverview() {
    const data = await this.dashboardService.getPlatformOverview();
    return {
      success: true,
      data,
    };
  }
}
