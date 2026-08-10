import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RevenueController } from './controllers/revenue.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { QuotationsController } from './controllers/quotations.controller';
import { RevenueService } from './services/revenue.service';
import { InvoicesService } from './services/invoices.service';
import { QuotationsService } from './services/quotations.service';

@Module({
  imports: [PrismaModule],
  controllers: [RevenueController, InvoicesController, QuotationsController],
  providers: [RevenueService, InvoicesService, QuotationsService],
  exports: [RevenueService, InvoicesService, QuotationsService],
})
export class FinanceModule {}
