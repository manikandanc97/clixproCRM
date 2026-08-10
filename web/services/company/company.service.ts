import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class CompanyService {
  static async getCompanies(tenantId: string, page = 1, limit = 10, search = "") {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    
    const where: Prisma.CompanyWhereInput = { tenantId, deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: { customers: { where: { deletedAt: null } }, deals: true }
          }
        }
      }),
      prisma.company.count({ where }),
    ]);
    
    return {
      companies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getCompanyById(tenantId: string, id: string) {
    return prisma.company.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customers: { where: { deletedAt: null } },
        deals: true,
        timelineEvents: { orderBy: { createdAt: "desc" } }
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async createCompany(tenantId: string, data: any, userId: string) {
    return prisma.company.create({
      data: {
        tenantId,
        ownerId: userId,
        name: data.name,
        industry: data.industry,
        website: data.website,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        status: data.status || "ACTIVE",
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async updateCompany(tenantId: string, id: string, data: any) {
    return prisma.company.update({
      where: { id, tenantId },
      data,
    });
  }

  static async deleteCompany(tenantId: string, id: string) {
    return prisma.company.update({
      where: { id, tenantId },
      data: { deletedAt: new Date() }
    });
  }

  static async bulkDeleteCompanies(tenantId: string, ids: string[]) {
    return prisma.company.updateMany({
      where: { id: { in: ids }, tenantId },
      data: { deletedAt: new Date() }
    });
  }
}
