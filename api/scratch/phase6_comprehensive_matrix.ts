import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getMonthRanges } from '../src/common/utils/crm-formatters.util';

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL!;
const directUrl = process.env.DIRECT_URL!;

async function runScenario(
  scenarioName: string,
  url: string,
  useOptimizedGuard: boolean,
) {
  console.log(`\n================ RUNNING: ${scenarioName} ================`);
  const prisma = new PrismaClient({
    datasourceUrl: url,
  });
  await prisma.$connect();

  const tenant = await prisma.tenant.findFirst();
  const tenantId = tenant!.id;
  const user = await prisma.user.findFirst();
  const userId = user!.id;

  const now = new Date();
  const ranges = getMonthRanges();
  const currentStart = ranges.currentMonthStart;
  const previousStart = ranges.previousMonthStart;
  const nextStart = ranges.nextMonthStart;
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const startOfCurrentYear = new Date(now.getFullYear(), 0, 1);

  // 1. Measure Guard
  const tGuard0 = performance.now();
  let roleData: any;
  if (!useOptimizedGuard) {
    const userRec = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { role: { include: { permissions: true } } },
        },
      },
    });
    roleData = userRec?.memberships[0]?.role;
  } else {
    const res = await prisma.$queryRaw<
      Array<{
        tenantId: string;
        role: any;
      }>
    >`
      SELECT 
        tu."tenantId",
        json_build_object(
          'id', r."id",
          'name', r."name",
          'permissions', COALESCE(
            json_agg(
              json_build_object(
                'roleId', rp."roleId",
                'module', rp."module",
                'hasAccess', rp."hasAccess"
              )
            ) FILTER (WHERE rp."module" IS NOT NULL),
            '[]'::json
          )
        ) as role
      FROM "TenantUser" tu
      JOIN "Role" r ON r."id" = tu."roleId"
      LEFT JOIN "RolePermission" rp ON rp."roleId" = r."id"
      WHERE tu."userId" = ${userId} AND tu."status" = 'ACTIVE'::"UserStatus"
      GROUP BY tu."id", tu."tenantId", r."id", r."name"
    `;
    roleData = res[0]?.role;
  }
  const guardTime = performance.now() - tGuard0;

  // 2. Measure 5 passes of the Dashboard execution pipeline
  const passTimings: number[] = [];
  for (let pass = 1; pass <= 5; pass++) {
    const tPass0 = performance.now();

    // Tenant currency lookup (uncached on pass 1, cached 0ms on pass 2-5)
    let currency = 'USD';
    if (pass === 1) {
      const tCurr = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { currency: true },
      });
      currency = tCurr?.currency || 'USD';
    }

    // 8 Dashboard Queries
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

    const dur = performance.now() - tPass0;
    passTimings.push(dur);
    console.log(`  Pass ${pass}: ${dur.toFixed(2)} ms`);
  }

  await prisma.$disconnect();

  return {
    scenarioName,
    guardTime,
    passTimings,
  };
}

async function main() {
  const s0 = await runScenario('Baseline (Pooler 6543 + Original 4-level Guard)', dbUrl, false);
  const s1 = await runScenario('Phase 1 (Direct 5432 + Original 4-level Guard)', directUrl, false);
  const s2 = await runScenario('Phase 2 (Direct 5432 + Optimized Single-Query Guard)', directUrl, true);

  console.log('\n================ COMPLETE MATRIX SUMMARY ================');
  console.log('Baseline (Pooler):', { Guard: `${s0.guardTime.toFixed(2)} ms`, Cold: `${s0.passTimings[0].toFixed(2)} ms`, WarmAvg: `${(s0.passTimings.slice(1).reduce((a, b) => a + b, 0) / 4).toFixed(2)} ms` });
  console.log('Phase 1 (Direct):', { Guard: `${s1.guardTime.toFixed(2)} ms`, Cold: `${s1.passTimings[0].toFixed(2)} ms`, WarmAvg: `${(s1.passTimings.slice(1).reduce((a, b) => a + b, 0) / 4).toFixed(2)} ms` });
  console.log('Phase 2 (Direct + Opt Guard):', { Guard: `${s2.guardTime.toFixed(2)} ms`, Cold: `${s2.passTimings[0].toFixed(2)} ms`, WarmAvg: `${(s2.passTimings.slice(1).reduce((a, b) => a + b, 0) / 4).toFixed(2)} ms` });
}

main().catch(console.error);
