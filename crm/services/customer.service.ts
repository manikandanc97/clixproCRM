import { CustomerRepository } from "../repositories/customer.repository";
import { Customer } from "@prisma/client";

export class CustomerService {
  static async getCustomers(tenantId: string) {
    return CustomerRepository.findAll(tenantId);
  }

  static async createCustomer(tenantId: string, data: any, userId: string) {
    // Basic validation here or in a separate validator
    if (!data.name || !data.company) {
      throw new Error("Name and Company are required");
    }

    return CustomerRepository.create({
      ...data,
      tenantId,
      createdBy: userId,
      revenue: data.revenue || 0,
      status: data.status || "ACTIVE",
    });
  }
}
