import { CrmService } from './services/crm.service';
import prisma from './lib/prisma';

async function main() {
  const tenants = await prisma.tenant.findMany();
  
  for (const tenant of tenants) {
    console.log(`Testing tenant: ${tenant.id}`);
    
    const fns = [
      () => CrmService.getDashboardData(tenant.id),
      () => CrmService.getTasks(tenant.id, 1, 10, ""),
      () => CrmService.getLeads(tenant.id, "USD", 1, 10, "", ""),
      () => CrmService.getCustomers(tenant.id, 1, 10, ""),
      // () => CrmService.getPipeline(tenant.id), // Let's check if this exists
      // () => CrmService.getMeetings(tenant.id), // Let's check if this exists
      // () => CrmService.getHotLeads(tenant.id), // Let's check if this exists
    ];

    for (const fn of fns) {
      try {
        await fn();
        console.log(`✅ ${fn.toString().substring(0, 50)}...`);
      } catch (err) {
        console.error(`❌ ${fn.toString().substring(0, 50)}... FAILED:`, err);
      }
    }
  }
}
main().finally(() => prisma.$disconnect());
