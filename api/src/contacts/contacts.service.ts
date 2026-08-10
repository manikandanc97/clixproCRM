import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CustomerStatus } from '@prisma/client';
import { CreateContactDto } from './dto/create-contact.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class ContactsService implements OnModuleInit {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.cleanupCustomerAnomalies().catch((err) => {
      this.logger.error('Failed to cleanup customer anomalies', err);
    });
  }

  private async ensureDatabaseColumns() {
    try {
      await this.prisma.$executeRawUnsafe(
        `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "isConverted" BOOLEAN DEFAULT false;`,
      );
      await this.prisma.$executeRawUnsafe(
        `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);`,
      );
      await this.prisma.$executeRawUnsafe(
        `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "customerId" TEXT;`,
      );
      await this.prisma.$executeRawUnsafe(
        `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "leadId" TEXT;`,
      );
    } catch {
      // Ignore if columns already exist
    }
  }

  private async cleanupCustomerAnomalies() {
    try {
      await this.ensureDatabaseColumns();
    } catch (error) {
      this.logger.error('Cleanup anomalies non-fatal error', error);
    }
  }

  async getCustomers(tenantId: string, query: PaginationQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(query.limit || 10, 100));
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = { tenantId, deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { deals: { where: { status: { not: 'LOST' } } } },
          },
          deals: {
            select: { value: true, stage: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    const mappedCustomers = customers.map((c) => {
      const dealsRevenue = c.deals
        .filter((d) => d.stage !== 'LOST')
        .reduce((sum, d) => sum + Number(d.value || 0), 0);

      return {
        ...c,
        dealsCount: c._count.deals,
        revenueValue: dealsRevenue > 0 ? dealsRevenue : Number(c.revenue || 0),
      };
    });

    return {
      customers: mappedCustomers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createCustomer(
    tenantId: string,
    data: CreateContactDto,
    userId: string,
  ) {
    return this.prisma.customer.create({
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        tenantId,
        revenue: data.revenue || 0,
        status: data.status || 'ACTIVE',
        assignedToId: userId,
      },
    });
  }
}
