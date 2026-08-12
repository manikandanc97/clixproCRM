import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { TenantGuard } from '../../auth/tenant.guard';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  tenantId: string;
}

@Controller('crm/dashboard')
@UseGuards(SupabaseAuthGuard, TenantGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @Req() req: AuthenticatedRequest,
    @Query('timeframe') timeframe = 'month',
  ) {
    const tenantId = req.tenantId;
    const data = await this.dashboardService.getDashboardData(
      tenantId,
      timeframe,
    );
    return { success: true, data };
  }

  @Get('revenue-growth')
  async getRevenueGrowth(
    @Req() req: AuthenticatedRequest,
    @Query('filter') filter = 'Year',
  ) {
    const tenantId = req.tenantId;
    const data = await this.dashboardService.getRevenueGrowth(
      tenantId,
      filter,
    );
    return { success: true, data };
  }
}
