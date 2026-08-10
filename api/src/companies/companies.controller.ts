import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { SupabaseAuthGuard } from '../auth/supabase.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('crm/companies')
@UseGuards(SupabaseAuthGuard, TenantGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER', 'SALES')
  async getCompanies(@Req() req: any, @Query() query: PaginationQueryDto) {
    const data = await this.companiesService.getCompanies(req.tenantId, query);
    return { success: true, data };
  }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'SALES')
  async createCompany(@Req() req: any, @Body() body: CreateCompanyDto) {
    const data = await this.companiesService.createCompany(
      req.tenantId,
      body,
      req.user.sub,
    );
    return { success: true, data };
  }
}
