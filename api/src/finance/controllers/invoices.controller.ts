import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { TenantGuard } from '../../auth/tenant.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';

@Controller('crm/invoices')
@UseGuards(SupabaseAuthGuard, TenantGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE')
  async getInvoices(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    const invoices = await this.invoicesService.getInvoices(req.tenantId, p, l);
    return { success: true, data: invoices };
  }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'SALES')
  async createInvoice(@Req() req: any, @Body() body: CreateInvoiceDto) {
    const invoice = await this.invoicesService.createInvoice(
      req.tenantId,
      req.user.sub,
      body,
    );
    return { success: true, data: invoice };
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE')
  async getInvoiceById(@Req() req: any, @Param('id') id: string) {
    const invoice = await this.invoicesService.getInvoiceById(req.tenantId, id);
    if (!invoice) return { success: false, message: 'Invoice not found' };
    return { success: true, data: invoice };
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'SALES')
  async updateInvoice(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateInvoiceDto & { status?: string },
  ) {
    if (body.status && Object.keys(body).length === 1) {
      const updated = await this.invoicesService.updateInvoiceStatus(
        req.tenantId,
        id,
        body.status,
      );
      return { success: true, data: updated };
    }
    const invoice = await this.invoicesService.updateInvoice(
      req.tenantId,
      id,
      body,
    );
    return { success: true, data: invoice };
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  async deleteInvoice(@Req() req: any, @Param('id') id: string) {
    await this.invoicesService.deleteInvoice(req.tenantId, id, req.user.sub);
    return { success: true, data: { id } };
  }
}
