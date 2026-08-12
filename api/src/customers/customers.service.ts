import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CustomerStatus } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getCustomers(tenantId: string, page = 1, limit = 10, search = '') {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 10000));
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
    userId: string,
    data: {
      name: string;
      company: string;
      email?: string;
      revenue?: number | string;
      status?: CustomerStatus;
    },
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

  async updateCustomer(
    tenantId: string,
    id: string,
    data: Partial<Prisma.CustomerUpdateInput>,
  ) {
    return this.prisma.customer.update({
      where: { id, tenantId },
      data,
    });
  }

  async deleteCustomer(tenantId: string, id: string) {
    return this.prisma.customer.update({
      where: { id, tenantId },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async bulkDeleteCustomers(tenantId: string, ids: string[]) {
    return this.prisma.customer.updateMany({
      where: { id: { in: ids }, tenantId },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }
}
