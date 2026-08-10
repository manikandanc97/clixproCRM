import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Backfill Script — Phase 2J.2
 * 
 * Assigns sequential INV-XXXX numbers to all existing invoices (per tenant),
 * ordered by createdAt ASC (deterministic ordering).
 * Also seeds InvoiceCounter for each tenant with the correct current value.
 * 
 * Safe to re-run: skips invoices that already have an invoiceNumber.
 */
async function backfillInvoiceNumbers() {
  const prisma = new PrismaClient({
    log: ['warn', 'error'],
  });

  console.log('=== Invoice Numbering Backfill Script ===\n');

  // 1. Get all invoices without an invoiceNumber, grouped by tenant
  const unNumberedInvoices = await prisma.invoice.findMany({
    where: { invoiceNumber: null },
    orderBy: [{ tenantId: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, tenantId: true, createdAt: true },
  });

  console.log(`Found ${unNumberedInvoices.length} invoices without a number.`);

  if (unNumberedInvoices.length === 0) {
    console.log('Nothing to backfill. All invoices already have numbers.');
    // Still ensure counters exist
    await ensureCounters(prisma);
    await prisma.$disconnect();
    return;
  }

  // 2. Group by tenant
  const byTenant = unNumberedInvoices.reduce<Record<string, typeof unNumberedInvoices>>((acc, inv) => {
    if (!acc[inv.tenantId]) acc[inv.tenantId] = [];
    acc[inv.tenantId].push(inv);
    return acc;
  }, {});

  // 3. For each tenant, get current max to start from correct base
  for (const [tenantId, invoices] of Object.entries(byTenant)) {
    // Find the highest existing invoice number for this tenant
    const lastNumbered = await prisma.invoice.findFirst({
      where: { tenantId, invoiceNumber: { not: null } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let startSeq = 1;
    if (lastNumbered?.invoiceNumber) {
      const match = lastNumbered.invoiceNumber.match(/^INV-(\d+)$/);
      if (match) startSeq = parseInt(match[1], 10) + 1;
    }

    console.log(`\nTenant ${tenantId}: ${invoices.length} invoices to backfill (starting at ${startSeq})`);

    // 4. Assign numbers sequentially
    for (let i = 0; i < invoices.length; i++) {
      const inv = invoices[i];
      const seq = startSeq + i;
      const invoiceNumber = `INV-${String(seq).padStart(4, '0')}`;

      await prisma.invoice.update({
        where: { id: inv.id },
        data: { invoiceNumber },
      });

      console.log(`  Updated invoice ${inv.id.slice(0, 8)}... -> ${invoiceNumber}`);
    }

    // 5. Upsert the InvoiceCounter for this tenant
    const finalSeq = startSeq + invoices.length - 1;
    await prisma.invoiceCounter.upsert({
      where: { tenantId },
      update: { current: finalSeq },
      create: { tenantId, current: finalSeq },
    });
    console.log(`  Set InvoiceCounter for tenant ${tenantId} to ${finalSeq}`);
  }

  // 6. Ensure counters exist for tenants that already had numbered invoices
  await ensureCounters(prisma);

  console.log('\n=== Backfill complete ===');
  await prisma.$disconnect();
}

async function ensureCounters(prisma: PrismaClient) {
  // For any tenant with invoices but no counter, create the counter
  const tenantsWithInvoices = await prisma.invoice.groupBy({
    by: ['tenantId'],
    _count: { id: true },
  });

  for (const { tenantId } of tenantsWithInvoices) {
    const existingCounter = await prisma.invoiceCounter.findUnique({ where: { tenantId } });
    if (!existingCounter) {
      // Get the highest sequence number already assigned
      const lastNumbered = await prisma.invoice.findFirst({
        where: { tenantId, invoiceNumber: { not: null } },
        orderBy: { invoiceNumber: 'desc' },
        select: { invoiceNumber: true },
      });

      let current = 0;
      if (lastNumbered?.invoiceNumber) {
        const match = lastNumbered.invoiceNumber.match(/^INV-(\d+)$/);
        if (match) current = parseInt(match[1], 10);
      }

      await prisma.invoiceCounter.create({ data: { tenantId, current } });
      console.log(`  Created InvoiceCounter for ${tenantId} at ${current}`);
    }
  }
}

backfillInvoiceNumbers().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
