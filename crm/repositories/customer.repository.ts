import prisma from "@/lib/prisma";
import { Customer } from "@prisma/client";

export class CustomerRepository {
  static async findAll(tenantId: string): Promise<Customer[]> {
    return prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string, tenantId: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { id, tenantId },
    });
  }

  static async create(data: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    return prisma.customer.create({
      data,
    });
  }
}
