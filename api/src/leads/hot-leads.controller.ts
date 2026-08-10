import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { LeadsService } from './services/leads.service';
import { SupabaseAuthGuard } from '../auth/supabase.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('crm/hot-leads')
@UseGuards(SupabaseAuthGuard, TenantGuard)
export class HotLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async getHotLeads(@Req() req: any) {
    const leads = await this.leadsService.getHotLeads(req.tenantId);
    return { success: true, data: { leads } };
  }
}
