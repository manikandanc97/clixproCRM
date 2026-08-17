import { PrismaClient } from '@prisma/client';
import { getMonthRanges } from '../src/common/utils/crm-formatters.util';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});

async function profileDashboard() {
  const queryLogs: { query: string; duration: number }[] = [];
  
  (prisma as any).$on('query', (e: any) => {
    queryLogs.push({
      query: e.query,
      duration: e.duration,
    });
  });

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('No tenant found');
    return;
  }
  const tenantId = tenant.id;

  console.log(`\n================= DEEP PROFILE: GET /crm/dashboard =================`);
  console.log(`Tenant: ${tenant.name} (${tenantId})`);

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

  // 1. Measure Individual Queries sequentially
  console.log('\n--- 1. Individual Sequential Query Timings ---');
  async function timeQuery(name: string, fn: () => Promise<any>) {
    const t0 = performance.now();
    const res = await fn();
    const t1 = performance.now();
    const dur = t1 - t0;
    const rowCount = Array.isArray(res) ? res.length : (typeof res === 'number' ? res : 1);
    console.log(`${name.padEnd(45)}: ${dur.toFixed(2)} ms (rows/result: ${JSON.stringify(rowCount)})`);
    return { name, dur, res };
  }

  await timeQuery('Q1: totalDealsCount (count)', () =>
    prisma.deal.count({ where: { tenantId, deletedAt: null } })
  );
  await timeQuery('Q2: currentPeriodDealsCount (count)', () =>
    prisma.deal.count({ where: { tenantId, deletedAt: null, createdAt: { gte: currentStart, lt: nextStart } } })
  );
  await timeQuery('Q3: previousPeriodDealsCount (count)', () =>
    prisma.deal.count({ where: { tenantId, deletedAt: null, createdAt: { gte: previousStart, lt: currentStart } } })
  );
  await timeQuery('Q4: currentPeriodRevenue (aggregate _sum)', () =>
    prisma.deal.aggregate({ where: { tenantId, deletedAt: null, stage: 'WON', updatedAt: { gte: currentStart, lt: nextStart } }, _sum: { value: true } })
  );
  await timeQuery('Q5: previousPeriodRevenue (aggregate _sum)', () =>
    prisma.deal.aggregate({ where: { tenantId, deletedAt: null, stage: 'WON', updatedAt: { gte: previousStart, lt: currentStart } }, _sum: { value: true } })
  );
  await timeQuery('Q6: currentPeriodCustomers (count)', () =>
    prisma.customer.count({ where: { tenantId, deletedAt: null, createdAt: { gte: currentStart, lt: nextStart } } })
  );
  await timeQuery('Q7: previousPeriodCustomers (count)', () =>
    prisma.customer.count({ where: { tenantId, deletedAt: null, createdAt: { gte: previousStart, lt: currentStart } } })
  );
  await timeQuery('Q8: pendingTasksTotal (count)', () =>
    prisma.task.count({ where: { tenantId, deletedAt: null, status: { not: 'COMPLETED' } } })
  );
  await timeQuery('Q9: currentPeriodPendingTasks (count)', () =>
    prisma.task.count({ where: { tenantId, deletedAt: null, status: { not: 'COMPLETED' }, createdAt: { gte: currentStart, lt: nextStart } } })
  );
  await timeQuery('Q10: previousPeriodPendingTasks (count)', () =>
    prisma.task.count({ where: { tenantId, deletedAt: null, status: { not: 'COMPLETED' }, createdAt: { gte: previousStart, lt: currentStart } } })
  );
  await timeQuery('Q11: recentDeals (findMany take 5)', () =>
    prisma.deal.findMany({ where: { tenantId, deletedAt: null }, select: { id: true, name: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 })
  );
  await timeQuery('Q12: recentQuotations (findMany take 5)', () =>
    prisma.quotation.findMany({ where: { tenantId, deletedAt: null }, select: { id: true, client: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 })
  );
  await timeQuery('Q13: recentCompletedTasks (findMany take 5)', () =>
    prisma.task.findMany({ where: { tenantId, deletedAt: null, status: 'COMPLETED' }, select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 5 })
  );
  await timeQuery('Q14: revenueTarget (findFirst)', () =>
    prisma.revenueTarget.findFirst({ where: { tenantId, isActive: true }, orderBy: { createdAt: 'desc' }, select: { value: true } })
  );
  await timeQuery('Q15: weekWonDeals (findMany)', () =>
    prisma.deal.findMany({ where: { tenantId, deletedAt: null, stage: 'WON', updatedAt: { gte: sevenDaysAgo } }, select: { value: true, updatedAt: true } })
  );
  await timeQuery('Q16: weekNewDeals (findMany)', () =>
    prisma.deal.findMany({ where: { tenantId, deletedAt: null, createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } })
  );
  await timeQuery('Q17: yearWonDeals (findMany)', () =>
    prisma.deal.findMany({ where: { tenantId, deletedAt: null, stage: 'WON', updatedAt: { gte: startOfCurrentYear } }, select: { value: true, updatedAt: true } })
  );

  // 2. Measure Concurrent Promise.all
  console.log('\n--- 2. Promise.all (Current Dashboard Implementation) ---');
  const tAllStart = performance.now();
  await Promise.all([
    prisma.deal.count({ where: { tenantId, deletedAt: null } }),
    prisma.deal.count({ where: { tenantId, deletedAt: null, createdAt: { gte: currentStart, lt: nextStart } } }),
    prisma.deal.count({ where: { tenantId, deletedAt: null, createdAt: { gte: previousStart, lt: currentStart } } }),
    prisma.deal.aggregate({ where: { tenantId, deletedAt: null, stage: 'WON', updatedAt: { gte: currentStart, lt: nextStart } }, _sum: { value: true } }),
    prisma.deal.aggregate({ where: { tenantId, deletedAt: null, stage: 'WON', updatedAt: { gte: previousStart, lt: currentStart } }, _sum: { value: true } }),
    prisma.customer.count({ where: { tenantId, deletedAt: null, createdAt: { gte: currentStart, lt: nextStart } } }),
    prisma.customer.count({ where: { tenantId, deletedAt: null, createdAt: { gte: previousStart, lt: currentStart } } }),
    prisma.task.count({ where: { tenantId, deletedAt: null, status: { not: 'COMPLETED' } } }),
    prisma.task.count({ where: { tenantId, deletedAt: null, status: { not: 'COMPLETED' }, createdAt: { gte: currentStart, lt: nextStart } } }),
    prisma.task.count({ where: { tenantId, deletedAt: null, status: { not: 'COMPLETED' }, createdAt: { gte: previousStart, lt: currentStart } } }),
    prisma.deal.findMany({ where: { tenantId, deletedAt: null }, select: { id: true, name: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.quotation.findMany({ where: { tenantId, deletedAt: null }, select: { id: true, client: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.task.findMany({ where: { tenantId, deletedAt: null, status: 'COMPLETED' }, select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.revenueTarget.findFirst({ where: { tenantId, isActive: true }, orderBy: { createdAt: 'desc' }, select: { value: true } }),
    prisma.deal.findMany({ where: { tenantId, deletedAt: null, stage: 'WON', updatedAt: { gte: sevenDaysAgo } }, select: { value: true, updatedAt: true } }),
    prisma.deal.findMany({ where: { tenantId, deletedAt: null, createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } }),
    prisma.deal.findMany({ where: { tenantId, deletedAt: null, stage: 'WON', updatedAt: { gte: startOfCurrentYear } }, select: { value: true, updatedAt: true } }),
  ]);
  const tAllEnd = performance.now();
  console.log(`Promise.all total duration: ${(tAllEnd - tAllStart).toFixed(2)} ms`);

  // 3. Consolidated Single Query / Batch Query comparison
  console.log('\n--- 3. Combined SQL Aggregation Comparison ---');
  const tSqlStart = performance.now();
  const sqlResults = await prisma.$queryRaw<any[]>`
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
  const tSqlEnd = performance.now();
  console.log(`Single aggregated SQL query duration: ${(tSqlEnd - tSqlStart).toFixed(2)} ms`);
  console.log('Result:', sqlResults[0]);

  console.log('\n=====================================================================');
}

profileDashboard()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
