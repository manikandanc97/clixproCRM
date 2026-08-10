import prisma from "@/lib/prisma";
import { Prisma, CustomerStatus } from "@prisma/client";



import { CustomerSyncService } from "./customer.sync.service";

export class CustomerService {
  static async getCustomers(tenantId: string, page = 1, limit = 10, search = "") {
    // Fire-and-forget: cleanup anomalies in background, don't block the response
    CustomerSyncService.cleanupCustomerAnomalies(tenantId).catch(() => {});


    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const where: Prisma.CustomerWhereInput = { tenantId, deletedAt: null };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: { deals: { where: { status: { not: "LOST" } } } }
          },
          deals: {
            select: { value: true, stage: true }
          }
        }
      }),
      prisma.customer.count({ where }),
    ]);

    const mappedCustomers = customers.map(c => {
      // Real revenue from DB Deal value, won or open Deals (excluding lost usually, but let's include all won/open)
      const dealsRevenue = c.deals
        .filter(d => d.stage !== "LOST")
        .reduce((sum, d) => sum + Number(d.value || 0), 0);
      
      return {
        ...c,
        dealsCount: c._count.deals,
        revenueValue: dealsRevenue > 0 ? dealsRevenue : Number(c.revenue || 0)
      };
    });

    return {
      customers: mappedCustomers,
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

  static async bulkDeleteCustomers(tenantId: string, ids: string[]) {
    return prisma.customer.updateMany({
      where: { id: { in: ids }, tenantId },
      data: { deletedAt: new Date(), status: "INACTIVE" as const }
    });
  }
}


