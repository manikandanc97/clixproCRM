import { PrismaClient } from '@prisma/client';
import { CrmService } from './services/crm.service';

const prisma = new PrismaClient();

async function main() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log('No tenant found');
      return;
    }
    const tenantId = tenant.id;
    console.log(`Using tenantId: ${tenantId}`);
    
    // Check getDashboardData
    console.log('Testing getDashboardData...');
    const dashboardData = await CrmService.getDashboardData(tenantId);
    console.log('Dashboard Data Success:', JSON.stringify(dashboardData).slice(0, 100));
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
