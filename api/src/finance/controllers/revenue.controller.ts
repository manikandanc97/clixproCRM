import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RevenueService } from '../services/revenue.service';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { TenantGuard } from '../../auth/tenant.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateRevenueTargetDto } from '../dto/create-revenue-target.dto';
import { UpdateRevenueTargetDto } from '../dto/update-revenue-target.dto';

@Controller('crm/settings/revenue-targets')
@UseGuards(SupabaseAuthGuard, TenantGuard, RolesGuard)
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER', 'USER', 'SALES', 'EMPLOYEE') // Original Next.js required "ADMIN", "MANAGER", "USER" (mapping USER correctly)
  async getRevenueTargets(@Req() req: any) {
    const targets = await this.revenueService.getRevenueTargets(req.tenantId);
    return { success: true, data: targets };
  }

  @Post()
  @Roles('ADMIN')
  async createRevenueTarget(
    @Req() req: any,
    @Body() body: CreateRevenueTargetDto,
  ) {
    const target = await this.revenueService.createRevenueTarget(
      req.tenantId,
      body,
    );
    return { success: true, data: target };
  }

  @Put(':id')
  @Roles('ADMIN')
  async updateRevenueTarget(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateRevenueTargetDto,
  ) {
    const target = await this.revenueService.updateRevenueTarget(
      req.tenantId,
      id,
      body,
    );
    return { success: true, data: target };
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteRevenueTarget(@Req() req: any, @Param('id') id: string) {
    await this.revenueService.deleteRevenueTarget(req.tenantId, id);
    return { success: true, data: { id } };
  }
}
