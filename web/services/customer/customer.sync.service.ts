import prisma from "@/lib/prisma";




export class CustomerSyncService {
  static async ensureDatabaseColumns() {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "isConverted" BOOLEAN DEFAULT false;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "customerId" TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "leadId" TEXT;`);
    } catch {
      // Ignore if columns already exist
    }
  }

  static async cleanupCustomerAnomalies(_tenantId: string) {
    try {
      await CustomerSyncService.ensureDatabaseColumns();
      // Automatic lead-to-customer conversion logic has been removed 
      // per business rules. Customers should only be created explicitly 
      // via the Convert Lead manual action.
    } catch (error) {
      console.error("Cleanup anomalies non-fatal error:", error);
    }
  }

  static async syncWonLeadsToCustomers(tenantId: string) {
    return await CustomerSyncService.cleanupCustomerAnomalies(tenantId);
  }
}


