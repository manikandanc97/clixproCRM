import { PrismaClient } from '@prisma/client';
import { getMonthRanges } from '../src/common/utils/crm-formatters.util';

const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
});

async function runProfile() {
  const queryEvents: { query: string; duration: number }[] = [];
  (prisma as any).$on('query', (e: any) => {
    queryEvents.push({ query: e.query, duration: e.duration });
  });

  console.log('=== Step 1: Network & Connection Latency Test ===');
  const pingTimes: number[] = [];
  for (let i = 0; i < 5; i++) {
    const t0 = performance.now();
    await prisma.$queryRaw`SELECT 1 as ping`;
    const t1 = performance.now();
    pingTimes.push(t1 - t0);
    console.log(`Ping ${i + 1}: ${(t1 - t0).toFixed(2)} ms`);
  }
  const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
  console.log(`Average DB round-trip ping latency: ${avgPing.toFixed(2)} ms\n`);

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('No tenant found!');
    return;
  }
  const tenantId = tenant.id;
  console.log(`Using Tenant: ${tenant.name} (${tenantId})`);

  const user = await prisma.user.findFirst();
  const userId = user?.id || '';
  console.log(`Using User: ${user?.name} (${userId})\n`);

  console.log('=== Step 2: Guard / Auth / Tenant Overhead Profile ===');
  // Tenant lookup
  const tTenant0 = performance.now();
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { role: { include: { permissions: true } } },
      },
    },
  });
  const tTenant1 = performance.now();
  console.log(`Tenant Guard DB lookup (user + memberships + permissions): ${(tTenant1 - tTenant0).toFixed(2)} ms`);

  // Currency lookup
  const tCurr0 = performance.now();
  const tenantData = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { currency: true },
  });
  const tCurr1 = performance.now();
  console.log(`Tenant Currency DB lookup (uncached): ${(tCurr1 - tCurr0).toFixed(2)} ms\n`);

  console.log('=== Step 3: Individual Dashboard Query Latency (Sequential) ===');
  const now = new Date();
  const ranges = getMonthRanges();
  const currentStart = ranges.currentMonthStart;
  const previousStart = ranges.previousMonthStart;
  const nextStart = ranges.nextMonthStart;

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const currentYear = new Date().getFullYear();
  const startOfCurrentYear = new Date(currentYear, 0, 1);

  // Q1: statsRaw
  const tQ1_0 = performance.now();
  const statsRaw = await prisma.$queryRaw<Array<any>>`
    SELECT
      (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL) as total_deals,
      (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${currentStart} AND "createdAt" < ${nextStart}) as current_period_deals,
      (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${previousStart} AND "createdAt" < ${currentStart}) as prev_period_deals,
      (SELECT COALESCE(SUM("value"), 0)::float FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "stage" = 'WON'::"DealStage" AND "updatedAt" >= ${currentStart} AND "updatedAt" < ${nextStart}) as current_period_revenue,
      (SELECT COALESCE(SUM("value"), 0)::float FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "stage" = 'WON'::"DealStage" AND "updatedAt" >= ${previousStart} AND "updatedAt" < ${currentStart}) as prev_period_revenue,
      (SELECT COUNT(*)::int FROM "Customer" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${currentStart} AND "createdAt" < ${nextStart}) as current_period_customers,
      (SELECT COUNT(*)::int FROM "Customer" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${previousStart} AND "createdAt" < ${currentStart}) as prev_period_customers,
      (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus") as pending_tasks_total,
      (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus" AND "createdAt" >= ${currentStart} AND "createdAt" < ${nextStart}) as current_period_pending_tasks,
      (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus" AND "createdAt" >= ${previousStart} AND "createdAt" < ${currentStart}) as prev_period_pending_tasks
  `;
  const tQ1_1 = performance.now();
  console.log(`Q1: statsRaw ($queryRaw 10 subqueries): ${(tQ1_1 - tQ1_0).toFixed(2)} ms`);

  // Q2: monthlySalesRaw
  const tQ2_0 = performance.now();
  const monthlySalesRaw = await prisma.$queryRaw<Array<any>>`
    SELECT 
      (EXTRACT(MONTH FROM "updatedAt")::int - 1) as month_index,
      COALESCE(SUM("value"), 0)::float as total
    FROM "Deal"
    WHERE "tenantId" = ${tenantId} 
      AND "deletedAt" IS NULL 
      AND "stage" = 'WON'::"DealStage" 
      AND "updatedAt" >= ${startOfCurrentYear}
    GROUP BY (EXTRACT(MONTH FROM "updatedAt")::int - 1)
  `;
  const tQ2_1 = performance.now();
  console.log(`Q2: monthlySalesRaw ($queryRaw YTD grouped): ${(tQ2_1 - tQ2_0).toFixed(2)} ms`);

  // Q3: sparklineDealsRaw
  const tQ3_0 = performance.now();
  const sparklineDealsRaw = await prisma.$queryRaw<Array<any>>`
    SELECT
      DATE_TRUNC('day', "createdAt")::date as day_date,
      COUNT(*)::int as deal_count
    FROM "Deal"
    WHERE "tenantId" = ${tenantId} 
      AND "deletedAt" IS NULL 
      AND "createdAt" >= ${sevenDaysAgo}
    GROUP BY DATE_TRUNC('day', "createdAt")::date
  `;
  const tQ3_1 = performance.now();
  console.log(`Q3: sparklineDealsRaw ($queryRaw 7d grouped): ${(tQ3_1 - tQ3_0).toFixed(2)} ms`);

  // Q4: sparklineRevenueRaw
  const tQ4_0 = performance.now();
  const sparklineRevenueRaw = await prisma.$queryRaw<Array<any>>`
    SELECT
      DATE_TRUNC('day', "updatedAt")::date as day_date,
      COALESCE(SUM("value"), 0)::float as revenue
    FROM "Deal"
    WHERE "tenantId" = ${tenantId} 
      AND "deletedAt" IS NULL 
      AND "stage" = 'WON'::"DealStage" 
      AND "updatedAt" >= ${sevenDaysAgo}
    GROUP BY DATE_TRUNC('day', "updatedAt")::date
  `;
  const tQ4_1 = performance.now();
  console.log(`Q4: sparklineRevenueRaw ($queryRaw 7d grouped): ${(tQ4_1 - tQ4_0).toFixed(2)} ms`);

  // Q5: recentDeals
  const tQ5_0 = performance.now();
  const recentDeals = await prisma.deal.findMany({
    where: { tenantId, deletedAt: null },
    select: { id: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  const tQ5_1 = performance.now();
  console.log(`Q5: recentDeals (findMany take 5): ${(tQ5_1 - tQ5_0).toFixed(2)} ms`);

  // Q6: recentQuotations
  const tQ6_0 = performance.now();
  const recentQuotations = await prisma.quotation.findMany({
    where: { tenantId, deletedAt: null },
    select: { id: true, client: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  const tQ6_1 = performance.now();
  console.log(`Q6: recentQuotations (findMany take 5): ${(tQ6_1 - tQ6_0).toFixed(2)} ms`);

  // Q7: recentCompletedTasks
  const tQ7_0 = performance.now();
  const recentCompletedTasks = await prisma.task.findMany({
    where: { tenantId, deletedAt: null, status: 'COMPLETED' },
    select: { id: true, title: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });
  const tQ7_1 = performance.now();
  console.log(`Q7: recentCompletedTasks (findMany take 5): ${(tQ7_1 - tQ7_0).toFixed(2)} ms`);

  // Q8: revenueTargetData
  const tQ8_0 = performance.now();
  const revenueTargetData = await prisma.revenueTarget.findFirst({
    where: { tenantId, isActive: true },
    orderBy: { createdAt: 'desc' },
    select: { value: true },
  });
  const tQ8_1 = performance.now();
  console.log(`Q8: revenueTargetData (findFirst): ${(tQ8_1 - tQ8_0).toFixed(2)} ms`);

  const sumSequential = (tQ1_1 - tQ1_0) + (tQ2_1 - tQ2_0) + (tQ3_1 - tQ3_0) + (tQ4_1 - tQ4_0) + (tQ5_1 - tQ5_0) + (tQ6_1 - tQ6_0) + (tQ7_1 - tQ7_0) + (tQ8_1 - tQ8_0);
  console.log(`\nTotal if 8 queries ran sequentially: ${sumSequential.toFixed(2)} ms`);

  console.log('\n=== Step 4: Current Promise.all Execution Profile ===');
  const tParallel0 = performance.now();
  await Promise.all([
    prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL) as total_deals,
        (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${currentStart} AND "createdAt" < ${nextStart}) as current_period_deals,
        (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${previousStart} AND "createdAt" < ${currentStart}) as prev_period_deals,
        (SELECT COALESCE(SUM("value"), 0)::float FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "stage" = 'WON'::"DealStage" AND "updatedAt" >= ${currentStart} AND "updatedAt" < ${nextStart}) as current_period_revenue,
        (SELECT COALESCE(SUM("value"), 0)::float FROM "Deal" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "stage" = 'WON'::"DealStage" AND "updatedAt" >= ${previousStart} AND "updatedAt" < ${currentStart}) as prev_period_revenue,
        (SELECT COUNT(*)::int FROM "Customer" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${currentStart} AND "createdAt" < ${nextStart}) as current_period_customers,
        (SELECT COUNT(*)::int FROM "Customer" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "createdAt" >= ${previousStart} AND "createdAt" < ${currentStart}) as prev_period_customers,
        (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus") as pending_tasks_total,
        (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus" AND "createdAt" >= ${currentStart} AND "createdAt" < ${nextStart}) as current_period_pending_tasks,
        (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus" AND "createdAt" >= ${previousStart} AND "createdAt" < ${currentStart}) as prev_period_pending_tasks
    `,
    prisma.$queryRaw`
      SELECT 
        (EXTRACT(MONTH FROM "updatedAt")::int - 1) as month_index,
        COALESCE(SUM("value"), 0)::float as total
      FROM "Deal"
      WHERE "tenantId" = ${tenantId} 
        AND "deletedAt" IS NULL 
        AND "stage" = 'WON'::"DealStage" 
        AND "updatedAt" >= ${startOfCurrentYear}
      GROUP BY (EXTRACT(MONTH FROM "updatedAt")::int - 1)
    `,
    prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', "createdAt")::date as day_date,
        COUNT(*)::int as deal_count
      FROM "Deal"
      WHERE "tenantId" = ${tenantId} 
        AND "deletedAt" IS NULL 
        AND "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE_TRUNC('day', "createdAt")::date
    `,
    prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', "updatedAt")::date as day_date,
        COALESCE(SUM("value"), 0)::float as revenue
      FROM "Deal"
      WHERE "tenantId" = ${tenantId} 
        AND "deletedAt" IS NULL 
        AND "stage" = 'WON'::"DealStage" 
        AND "updatedAt" >= ${sevenDaysAgo}
      GROUP BY DATE_TRUNC('day', "updatedAt")::date
    `,
    prisma.deal.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.quotation.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, client: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: { tenantId, deletedAt: null, status: 'COMPLETED' },
      select: { id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.revenueTarget.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { value: true },
    }),
  ]);
  const tParallel1 = performance.now();
  console.log(`Promise.all of the 8 queries total duration: ${(tParallel1 - tParallel0).toFixed(2)} ms`);

  console.log('\n=== Step 5: Explain Analyze on Q1 (statsRaw) ===');
  const explainStats = await prisma.$queryRawUnsafe<any[]>(`
    EXPLAIN ANALYZE
    SELECT
      (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL) as total_deals,
      (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL AND "createdAt" >= '${currentStart.toISOString()}' AND "createdAt" < '${nextStart.toISOString()}') as current_period_deals,
      (SELECT COUNT(*)::int FROM "Deal" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL AND "createdAt" >= '${previousStart.toISOString()}' AND "createdAt" < '${currentStart.toISOString()}') as prev_period_deals,
      (SELECT COALESCE(SUM("value"), 0)::float FROM "Deal" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL AND "stage" = 'WON'::"DealStage" AND "updatedAt" >= '${currentStart.toISOString()}' AND "updatedAt" < '${nextStart.toISOString()}') as current_period_revenue,
      (SELECT COALESCE(SUM("value"), 0)::float FROM "Deal" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL AND "stage" = 'WON'::"DealStage" AND "updatedAt" >= '${previousStart.toISOString()}' AND "updatedAt" < '${currentStart.toISOString()}') as prev_period_revenue,
      (SELECT COUNT(*)::int FROM "Customer" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL AND "createdAt" >= '${currentStart.toISOString()}' AND "createdAt" < '${nextStart.toISOString()}') as current_period_customers,
      (SELECT COUNT(*)::int FROM "Customer" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL AND "createdAt" >= '${previousStart.toISOString()}' AND "createdAt" < '${currentStart.toISOString()}') as prev_period_customers,
      (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus") as pending_tasks_total,
      (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus" AND "createdAt" >= '${currentStart.toISOString()}' AND "createdAt" < '${nextStart.toISOString()}') as current_period_pending_tasks,
      (SELECT COUNT(*)::int FROM "Task" WHERE "tenantId" = '${tenantId}' AND "deletedAt" IS NULL AND "status" != 'COMPLETED'::"TaskStatus" AND "createdAt" >= '${previousStart.toISOString()}' AND "createdAt" < '${currentStart.toISOString()}') as prev_period_pending_tasks
  `);
  console.log('EXPLAIN ANALYZE result:');
  explainStats.forEach((r) => console.log(r['QUERY PLAN']));
}

runProfile()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
