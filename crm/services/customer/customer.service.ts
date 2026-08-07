import prisma from "@/lib/prisma";
import { Prisma, CustomerStatus } from "@prisma/client";



import { CustomerSyncService } from "./customer.sync.service";

export class CustomerService {
  static async getCustomers(tenantId: string, page = 1, limit = 10, search = "") {
    await CustomerSyncService.cleanupCustomerAnomalies(tenantId);

    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.CustomerWhereInput = { tenantId, deletedAt: null };
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);
    return {
      customers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async createCustomer(tenantId: string, data: { name: string; company: string; email?: string; revenue?: number | string; status?: CustomerStatus }, userId: string) {
    return prisma.customer.create({
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        tenantId,
        revenue: data.revenue || 0,
        status: data.status || "ACTIVE",
        assignedToId: userId,
      } as Prisma.CustomerUncheckedCreateInput,
    });
  }

  static async updateCustomer(tenantId: string, id: string, data: Partial<Prisma.CustomerUpdateInput>) {
    return prisma.customer.update({
      where: { id, tenantId },
      data,
    });
  }

  static async deleteCustomer(tenantId: string, id: string) {
    return prisma.customer.update({
      where: { id, tenantId },
      data: { deletedAt: new Date(), status: "INACTIVE" as const }
    });
  }
}


