import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PipelineService } from './services/pipeline.service';
import { DealsService } from './services/deals.service';
import { UpdateDealDto } from './dto/update-deal.dto';
import { SupabaseAuthGuard } from '../auth/supabase.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('crm/pipeline')
@UseGuards(SupabaseAuthGuard, TenantGuard, RolesGuard)
export class PipelineController {
  constructor(
    private readonly pipelineService: PipelineService,
    private readonly dealsService: DealsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'MANAGER', 'SALES')
  async getPipeline(@Req() req: any) {
    const data = await this.pipelineService.getPipeline(req.tenantId);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'SALES')
  async updateDealStage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateDealDto,
  ) {
    // Reusing dealsService.updateDeal for pipeline stage updates
    const data = await this.dealsService.updateDeal(
      req.tenantId,
      id,
      req.user.sub,
      body,
    );
    return { success: true, data };
  }
}
