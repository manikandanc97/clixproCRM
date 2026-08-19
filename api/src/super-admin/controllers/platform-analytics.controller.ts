import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { PlatformAnalyticsService } from '../services/platform-analytics.service';

@Controller(['super-admin/analytics', 'super_admin/analytics'])
@UseGuards(SupabaseAuthGuard, SuperAdminGuard)
export class PlatformAnalyticsController {
  constructor(private readonly analyticsService: PlatformAnalyticsService) {}

  @Get()
  async getAnalytics() {
    const data = await this.analyticsService.getPlatformAnalytics();
    return {
      success: true,
      data,
    };
  }
}
