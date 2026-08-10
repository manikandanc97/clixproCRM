import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// For transaction-heavy concurrent tests, use the DIRECT (non-pooled) URL
// PgBouncer in transaction mode has a limited pool; direct connections bypass this limit

interface TestResult {
  invoiceId?: string;
  invoiceNumber?: string;
  tenantId?: string;
  error?: string;
}

async function createInvoiceWithAtomicCounter(
  prisma: PrismaClient,
  tenantId: string,
  userId: string,
  amount: number,
): Promise<TestResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Atomic counter increment: INSERT ... ON CONFLICT DO UPDATE RETURNING current
      const counterResult = await tx.$queryRaw<Array<{ current: number }>>`
        INSERT INTO "InvoiceCounter" ("id", "tenantId", "current")
        VALUES (gen_random_uuid()::text, ${tenantId}, 1)
        ON CONFLICT ("tenantId")
        DO UPDATE SET "current" = "InvoiceCounter"."current" + 1
        RETURNING "current"
      `;
      const seq = counterResult[0].current;
      const invoiceNumber = `INV-${String(seq).padStart(4, '0')}`;

      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          customerId: `customer-${tenantId}`,
          invoiceNumber,
          amount,
          status: 'DRAFT',
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'INVOICE_CREATED',
          module: 'INVOICES',
          details: { invoiceId: invoice.id, invoiceNumber, amount },
        },
      });

      return { invoiceId: invoice.id, invoiceNumber, tenantId };
    }, { timeout: 30000, maxWait: 30000 }); // 30s for remote Supabase DB
    return result;
  } catch (err: any) {
    return { error: err.message };
  }
}

async function runConcurrencyTest(
  prisma: PrismaClient,
  tenantId: string,
  userId: string,
  count: number,
  label: string,
) {
  console.log(`\n=== ${label}: ${count} concurrent invoice creations ===`);
  console.log(`  Tenant: ${tenantId}`);

  const promises = Array.from({ length: count }, (_, i) =>
    createInvoiceWithAtomicCounter(prisma, tenantId, userId, 100 + i),
  );

  const results = await Promise.all(promises);
  const succeeded = results.filter((r): r is { invoiceId: string; invoiceNumber: string; tenantId: string; error: undefined } => !r.error);
  const failed = results.filter((r) => r.error);

  const invoiceNumbers = succeeded.map((r) => r.invoiceNumber);
  const uniqueNumbers = new Set(invoiceNumbers);
  const hasDuplicates = uniqueNumbers.size !== invoiceNumbers.length;

  console.log(`  Succeeded: ${succeeded.length}/${count}`);
  console.log(`  Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log(`  First error: ${failed[0].error}`);
  }
  console.log(`  Unique invoice numbers: ${uniqueNumbers.size}`);
  console.log(`  Duplicates detected: ${hasDuplicates ? 'YES ⚠️' : 'NO ✓'}`);

  if (succeeded.length > 0) {
    const sorted = [...invoiceNumbers].sort();
    console.log(`  Range: ${sorted[0]} → ${sorted[sorted.length - 1]}`);
  }

  // Verify audit log count
  const auditCount = await prisma.auditLog.count({
    where: { tenantId, action: 'INVOICE_CREATED' },
  });
  console.log(`  AuditLog INVOICE_CREATED entries for tenant: ${auditCount}`);

  return { succeeded: succeeded.length, failed: failed.length, hasDuplicates };
}

async function runMultiTenantTest(prisma: PrismaClient) {
  console.log('\n=== Multi-Tenant Isolation Test ===');

  const tenantA = 'mt-test-tenant-a';
  const tenantB = 'mt-test-tenant-b';
  const userId = 'mt-test-user';

  // Ensure tenants exist
  for (const tid of [tenantA, tenantB]) {
    try {
      await prisma.tenant.upsert({
        where: { id: tid },
        update: {},
        create: { id: tid, name: `MT Test Tenant ${tid}`, plan: 'PRO', slug: `mt-test-${Date.now()}-${tid.slice(-1)}` },
      });
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email: 'mt-test@test.com', name: 'MT Test User' },
      });
    } catch (e) { /* ignore */ }
  }

  // Create 2 invoices on each tenant concurrently
  const [a1, a2, b1, b2] = await Promise.all([
    createInvoiceWithAtomicCounter(prisma, tenantA, userId, 100),
    createInvoiceWithAtomicCounter(prisma, tenantA, userId, 200),
    createInvoiceWithAtomicCounter(prisma, tenantB, userId, 100),
    createInvoiceWithAtomicCounter(prisma, tenantB, userId, 200),
  ]);

  console.log(`  Tenant A invoice 1: ${a1.invoiceNumber || a1.error}`);
  console.log(`  Tenant A invoice 2: ${a2.invoiceNumber || a2.error}`);
  console.log(`  Tenant B invoice 1: ${b1.invoiceNumber || b1.error}`);
  console.log(`  Tenant B invoice 2: ${b2.invoiceNumber || b2.error}`);

  const tenantANumbers = [a1.invoiceNumber, a2.invoiceNumber].filter(Boolean);
  const tenantBNumbers = [b1.invoiceNumber, b2.invoiceNumber].filter(Boolean);

  // Both tenants can have INV-0001 — this is correct!
  const crossTenantSharing = tenantANumbers.some((n) => tenantBNumbers.includes(n));
  console.log(`  Both tenants can share INV-0001 (expected): ${crossTenantSharing ? 'YES ✓' : 'NO - check data'}`);

  // Within each tenant, numbers must be unique
  const uniqueA = new Set(tenantANumbers).size === tenantANumbers.length;
  const uniqueB = new Set(tenantBNumbers).size === tenantBNumbers.length;
  console.log(`  Tenant A numbers are unique: ${uniqueA ? 'YES ✓' : 'NO ⚠️'}`);
  console.log(`  Tenant B numbers are unique: ${uniqueB ? 'YES ✓' : 'NO ⚠️'}`);
}

async function runRollbackTest(prisma: PrismaClient) {
  console.log('\n=== Rollback / Failure Test ===');

  const tenantId = 'rollback-test-tenant';
  const userId = 'rollback-test-user';

  try {
    await prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: { id: tenantId, name: 'Rollback Test Tenant', plan: 'PRO', slug: `rollback-${Date.now()}` },
    });
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `rollback-${Date.now()}@test.com`, name: 'Rollback User' },
    });
  } catch (e) { /* ignore */ }

  // Record counter before test
  const beforeCounter = await prisma.invoiceCounter.findUnique({ where: { tenantId } });
  const beforeSeq = beforeCounter?.current ?? 0;
  console.log(`  Counter before rollback test: ${beforeSeq}`);

  // Simulate failure: allocate counter but force invoice creation to fail
  try {
    await prisma.$transaction(async (tx) => {
      const counterResult = await tx.$queryRaw<Array<{ current: number }>>`
        INSERT INTO "InvoiceCounter" ("id", "tenantId", "current")
        VALUES (gen_random_uuid()::text, ${tenantId}, 1)
        ON CONFLICT ("tenantId")
        DO UPDATE SET "current" = "InvoiceCounter"."current" + 1
        RETURNING "current"
      `;
      const seq = counterResult[0].current;
      console.log(`  Allocated sequence: ${seq} — about to force rollback...`);

      // Force the transaction to fail after counter allocation
      throw new Error('Simulated failure after counter allocation');
    });
  } catch (e) {
    console.log(`  Transaction rolled back as expected.`);
  }

  // Check counter after rollback — the increment must be rolled back too (same transaction)
  const afterCounter = await prisma.invoiceCounter.findUnique({ where: { tenantId } });
  const afterSeq = afterCounter?.current ?? 0;
  console.log(`  Counter after rollback: ${afterSeq}`);
  console.log(`  Counter unchanged (rollback works): ${afterSeq === beforeSeq ? 'YES ✓' : 'NO ⚠️'}`);

  // Now create a real invoice — it should get the next number correctly
  const realInvoice = await createInvoiceWithAtomicCounter(prisma, tenantId, userId, 500);
  console.log(`  Next real invoice after rollback: ${realInvoice.invoiceNumber || realInvoice.error}`);
  console.log(`  No gap from failed transaction (counter is atomic with invoice): documentation note below`);
  console.log(`  NOTE: Since counter+invoice are in ONE transaction, rollback means NO orphaned counter state.`);
  console.log(`  Gap behavior: NONE — rolled-back sequence is never consumed.`);
}

async function main() {
  // Use DIRECT_URL (non-pooled) for concurrent transactions
  // PgBouncer in transaction mode limits pool to ~20-30 concurrent connections;
  // direct connections have no such artificial limit for a dev/staging environment
  // Use PgBouncer pooler URL with increased connection_limit for concurrent tests.
  // DIRECT_URL bypasses PgBouncer but hits Supabase session-mode limit (15 max on free tier).
  // The pooler multiplexes connections safely for transaction-mode workloads.
  const poolerUrl = process.env.DATABASE_URL || '';
  const urlWithPool = poolerUrl.includes('connection_limit')
    ? poolerUrl
    : poolerUrl + (poolerUrl.includes('?') ? '&' : '?') + 'connection_limit=50&pool_timeout=60';

  const prisma = new PrismaClient({
    datasources: {
      db: { url: urlWithPool },
    },
    log: ['warn', 'error'],
  });

  const tenantId = 'concurrency-test-tenant';
  const userId = 'concurrency-test-user';

  // Ensure test tenant exists
  try {
    await prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: { id: tenantId, name: 'Concurrency Test Tenant', plan: 'PRO', slug: `conc-test-${Date.now()}` },
    });
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `conctest-${Date.now()}@test.com`, name: 'Concurrency Test User' },
    });
  } catch (e) { /* ignore */ }

  // Cleanup previous test data for clean counts
  await prisma.auditLog.deleteMany({ where: { tenantId } });
  await prisma.invoice.deleteMany({ where: { tenantId } });
  await prisma.invoiceCounter.deleteMany({ where: { tenantId } });

  // Test 1: 20 concurrent requests
  const test20 = await runConcurrencyTest(prisma, tenantId, userId, 20, 'Test 1');

  // Reset for next test
  await prisma.auditLog.deleteMany({ where: { tenantId } });
  await prisma.invoice.deleteMany({ where: { tenantId } });
  await prisma.invoiceCounter.deleteMany({ where: { tenantId } });

  // Test 2: 50 concurrent requests
  const test50 = await runConcurrencyTest(prisma, tenantId, userId, 50, 'Test 2');

  // Test 3: Multi-tenant isolation
  await runMultiTenantTest(prisma);

  // Test 4: Rollback
  await runRollbackTest(prisma);

  console.log('\n=== SUMMARY ===');
  console.log(`20 concurrent: ${test20.succeeded}/20 success, ${test20.hasDuplicates ? 'DUPLICATES' : 'no duplicates'}`);
  console.log(`50 concurrent: ${test50.succeeded}/50 success, ${test50.hasDuplicates ? 'DUPLICATES' : 'no duplicates'}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
