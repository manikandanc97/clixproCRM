import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function inspectInvoices() {
  const prisma = new PrismaClient();
  
  const invoices = await prisma.invoice.findMany({
    select: {
      id: true,
      tenantId: true,
      amount: true,
      status: true,
      createdAt: true,
    },
    orderBy: [{ tenantId: 'asc' }, { createdAt: 'asc' }],
  });

  console.log(`Total existing invoices: ${invoices.length}`);
  
  const byTenant = invoices.reduce<Record<string, typeof invoices>>((acc, inv) => {
    if (!acc[inv.tenantId]) acc[inv.tenantId] = [];
    acc[inv.tenantId].push(inv);
    return acc;
  }, {});

  for (const [tenantId, tenantInvoices] of Object.entries(byTenant)) {
    console.log(`\nTenant ${tenantId}: ${tenantInvoices.length} invoices`);
    tenantInvoices.slice(0, 5).forEach((inv, i) => {
      console.log(`  [${i+1}] id=${inv.id.slice(0,8)}... amount=${inv.amount} status=${inv.status} createdAt=${inv.createdAt.toISOString()}`);
    });
  }

  await prisma.$disconnect();
}

inspectInvoices().catch(console.error);
