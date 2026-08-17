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
    const limit = Math.max(1, Math.min(query.limit || 1000, 10000));
    const search = query.search?.trim();
    const offset = (page - 1) * limit;

    const whereConditions: Prisma.Sql[] = [
      Prisma.sql`c."tenantId" = ${tenantId}`,
      Prisma.sql`c."deletedAt" IS NULL`,
    ];

    if (search) {
      const searchPattern = `%${search}%`;
      whereConditions.push(
        Prisma.sql`(c."name" ILIKE ${searchPattern} OR c."email" ILIKE ${searchPattern} OR c."company" ILIKE ${searchPattern})`,
      );
    }

    const whereSql = Prisma.join(whereConditions, ' AND ');

    const rawCustomers = await this.prisma.$queryRaw<Array<{
      id: string;
      tenantId: string;
      assignedToId: string | null;
      name: string;
      company: string;
      email: string | null;
      status: CustomerStatus;
      revenue: number | string;
      lastContactAt: Date | null;
      deletedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      leadId: string | null;
      companyId: string | null;
      deals_count: number;
      deals_revenue: number;
      full_count: number;
    }>>`
      SELECT
        c."id",
        c."tenantId",
        c."assignedToId",
        c."name",
        c."company",
        c."email",
        c."status",
        c."revenue"::float as revenue,
        c."lastContactAt",
        c."deletedAt",
        c."createdAt",
        c."updatedAt",
        c."leadId",
        c."companyId",
        COALESCE(d.deals_count, 0)::int as deals_count,
        COALESCE(d.deals_revenue, 0)::float as deals_revenue,
        COUNT(*) OVER()::int as full_count
      FROM "Customer" c
      LEFT JOIN (
        SELECT
          "customerId",
          COUNT(*)::int as deals_count,
          COALESCE(SUM("value"), 0)::float as deals_revenue
        FROM "Deal"
        WHERE "stage" <> 'LOST'::"DealStage" AND "deletedAt" IS NULL
        GROUP BY "customerId"
      ) d ON c."id" = d."customerId"
      WHERE ${whereSql}
      ORDER BY c."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    let total = 0;
    if (rawCustomers.length > 0) {
      total = Number(rawCustomers[0].full_count);
    } else if (offset > 0) {
      // If beyond range on page > 1, get actual count
      total = await this.prisma.customer.count({
        where: {
          tenantId,
          deletedAt: null,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                  { company: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
      });
    }

    const mappedCustomers = rawCustomers.map((c) => {
      const dealsRevenue = Number(c.deals_revenue || 0);
      const baseRevenue = Number(c.revenue || 0);

      return {
        id: c.id,
        tenantId: c.tenantId,
        assignedToId: c.assignedToId,
        name: c.name,
        company: c.company,
        email: c.email,
        status: c.status,
        revenue: c.revenue,
        lastContactAt: c.lastContactAt,
        deletedAt: c.deletedAt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        leadId: c.leadId,
        companyId: c.companyId,
        dealsCount: Number(c.deals_count || 0),
        revenueValue: dealsRevenue > 0 ? dealsRevenue : baseRevenue,
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
