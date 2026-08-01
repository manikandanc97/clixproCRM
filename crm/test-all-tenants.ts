import { CrmService } from './services/crm.service';
import prisma from './lib/prisma';

async function main() {
  const tenants = await prisma.tenant.findMany();
  console.log(`Found ${tenants.length} tenants.`);
  
  for (const tenant of tenants) {
    console.log(`Testing dashboard for tenant: ${tenant.id} (${tenant.name})`);
    try {
      await CrmService.getDashboardData(tenant.id);
      console.log(`✅ Success for tenant: ${tenant.id}`);
    } catch (error) {
      console.error(`❌ Error for tenant: ${tenant.id}`);
      console.error(error);
    }
    
    try {
      await CrmService.getTasks(tenant.id, 1, 10, "");
      console.log(`✅ Tasks Success for tenant: ${tenant.id}`);
    } catch (error) {
      console.error(`❌ Tasks Error for tenant: ${tenant.id}`);
      console.error(error);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
