import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getMonthRanges } from '../src/common/utils/crm-formatters.util';

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL!;
const directUrl = process.env.DIRECT_URL!;

interface ModeResult {
  name: string;
  connectTime: number;
  select1: { min: number; max: number; avg: number; all: number[] };
  tenantQuery: { min: number; max: number; avg: number; all: number[] };
  dashboard5: number[];
}

async function benchmarkMode(name: string, url: string): Promise<ModeResult> {
  console.log(`\n================ BENCHMARKING: ${name} ================`);
  const prisma = new PrismaClient({
    datasourceUrl: url,
    log: [{ emit: 'event', level: 'query' }],
  });

  const tConn0 = performance.now();
  await prisma.$connect();
  const connectTime = performance.now() - tConn0;
  console.log(`Prisma $connect(): ${connectTime.toFixed(2)} ms`);

  // 1. SELECT 1 x 10
  const s1Timings: number[] = [];
  for (let i = 0; i < 10; i++) {
    const t0 = performance.now();
    await prisma.$queryRaw`SELECT 1 as ping`;
    s1Timings.push(performance.now() - t0);
  }
  const s1Avg = s1Timings.reduce((a, b) => a + b, 0) / s1Timings.length;
  const s1Min = Math.min(...s1Timings);
  const s1Max = Math.max(...s1Timings);
  console.log(`SELECT 1 (10x) -> Avg: ${s1Avg.toFixed(2)} ms, Min: ${s1Min.toFixed(2)} ms, Max: ${s1Max.toFixed(2)} ms`);

  // 2. Tenant query x 5
  const tenant = await prisma.tenant.findFirst();
  const tenantId = tenant!.id;
  const tqTimings: number[] = [];
  for (let i = 0; i < 5; i++) {
    const t0 = performance.now();
    await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, currency: true, name: true },
    });
    tqTimings.push(performance.now() - t0);
  }
  const tqAvg = tqTimings.reduce((a, b) => a + b, 0) / tqTimings.length;
  const tqMin = Math.min(...tqTimings);
  const tqMax = Math.max(...tqTimings);
  console.log(`Tenant query (5x) -> Avg: ${tqAvg.toFixed(2)} ms, Min: ${tqMin.toFixed(2)} ms, Max: ${tqMax.toFixed(2)} ms`);

  // 3. Dashboard Queries x 5
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

  const dashTimings: number[] = [];
  for (let pass = 1; pass <= 5; pass++) {
    const t0 = performance.now();
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
    const passDur = performance.now() - t0;
    dashTimings.push(passDur);
    console.log(`Dashboard Query Wave Pass ${pass}: ${passDur.toFixed(2)} ms`);
  }

  await prisma.$disconnect();

  return {
    name,
    connectTime,
    select1: { min: s1Min, max: s1Max, avg: s1Avg, all: s1Timings },
    tenantQuery: { min: tqMin, max: tqMax, avg: tqAvg, all: tqTimings },
    dashboard5: dashTimings,
  };
}

async function main() {
  const resPooler = await benchmarkMode('Supavisor Transaction Pooler (Port 6543, pgbouncer=true)', dbUrl);
  const resDirect = await benchmarkMode('Direct / Session Connection (Port 5432)', directUrl);

  console.log('\n================ PHASE 1 COMPARISON SUMMARY ================');
  console.log('--- Mode A: ' + resPooler.name + ' ---');
  console.log(`Connection $connect(): ${resPooler.connectTime.toFixed(2)} ms`);
  console.log(`SELECT 1: Avg=${resPooler.select1.avg.toFixed(2)} ms (Min=${resPooler.select1.min.toFixed(2)} ms, Max=${resPooler.select1.max.toFixed(2)} ms)`);
  console.log(`Tenant query: Avg=${resPooler.tenantQuery.avg.toFixed(2)} ms (Min=${resPooler.tenantQuery.min.toFixed(2)} ms, Max=${resPooler.tenantQuery.max.toFixed(2)} ms)`);
  console.log(`Dashboard Queries:`, resPooler.dashboard5.map((d, i) => `Req ${i + 1}: ${d.toFixed(2)} ms`));

  console.log('\n--- Mode B/C: ' + resDirect.name + ' ---');
  console.log(`Connection $connect(): ${resDirect.connectTime.toFixed(2)} ms`);
  console.log(`SELECT 1: Avg=${resDirect.select1.avg.toFixed(2)} ms (Min=${resDirect.select1.min.toFixed(2)} ms, Max=${resDirect.select1.max.toFixed(2)} ms)`);
  console.log(`Tenant query: Avg=${resDirect.tenantQuery.avg.toFixed(2)} ms (Min=${resDirect.tenantQuery.min.toFixed(2)} ms, Max=${resDirect.tenantQuery.max.toFixed(2)} ms)`);
  console.log(`Dashboard Queries:`, resDirect.dashboard5.map((d, i) => `Req ${i + 1}: ${d.toFixed(2)} ms`));
}

main().catch(console.error);
