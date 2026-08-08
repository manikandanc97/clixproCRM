import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class CompanyService {
  static async getCompanies(tenantId: string, page = 1, limit = 10, search = "") {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    
    const where: Prisma.CompanyWhereInput = { tenantId };
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
            select: { customers: true, deals: true }
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
      where: { id, tenantId },
      include: {
        customers: true,
        deals: true,
        timelineEvents: { orderBy: { createdAt: "desc" } }
      }
    });
  }

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

  static async updateCompany(tenantId: string, id: string, data: any) {
    return prisma.company.update({
      where: { id, tenantId },
      data,
    });
  }

  static async deleteCompany(tenantId: string, id: string) {
    return prisma.company.delete({
      where: { id, tenantId }
    });
  }
}
