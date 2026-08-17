import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL!;
const directUrl = process.env.DIRECT_URL!;

async function testApproaches(connectionName: string, url: string) {
  console.log(`\n================ TESTING TENANTGUARD APPROACHES ON: ${connectionName} ================`);
  const queryEvents: { query: string; duration: number }[] = [];
  const prisma = new PrismaClient({
    datasourceUrl: url,
    log: [{ emit: 'event', level: 'query' }],
  });
  (prisma as any).$on('query', (e: any) => {
    queryEvents.push({ query: e.query, duration: e.duration });
  });

  const user = await prisma.user.findFirst();
  const userId = user!.id;

  // Approach 1: Original user.findUnique (4-level include)
  queryEvents.length = 0;
  const t1_0 = performance.now();
  const res1 = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { role: { include: { permissions: true } } },
      },
    },
  });
  const t1_1 = performance.now();
  const dur1 = t1_1 - t1_0;
  const sqlCount1 = queryEvents.length;
  console.log(`Approach 1 (Original user.findUnique 4-level include): ${dur1.toFixed(2)} ms (${sqlCount1} SQL queries)`);

  // Approach 2: prisma.tenantUser.findMany (2-level include)
  queryEvents.length = 0;
  const t2_0 = performance.now();
  const res2 = await prisma.tenantUser.findMany({
    where: { userId: userId, status: 'ACTIVE' },
    include: {
      role: {
        include: { permissions: true },
      },
    },
  });
  const t2_1 = performance.now();
  const dur2 = t2_1 - t2_0;
  const sqlCount2 = queryEvents.length;
  console.log(`Approach 2 (prisma.tenantUser.findMany 2-level include): ${dur2.toFixed(2)} ms (${sqlCount2} SQL queries)`);

  // Approach 3: Single Parameterized Raw SQL Query with JOINs
  queryEvents.length = 0;
  const t3_0 = performance.now();
  const res3 = await prisma.$queryRaw<
    Array<{
      tenantId: string;
      role: {
        id: string;
        name: string;
        permissions: Array<{ roleId: string; module: string; hasAccess: boolean }>;
      };
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
  const t3_1 = performance.now();
  const dur3 = t3_1 - t3_0;
  const sqlCount3 = queryEvents.length;
  console.log(`Approach 3 (Single Raw SQL with JOIN & json_build_object): ${dur3.toFixed(2)} ms (${sqlCount3} SQL query)`);

  console.log('Result verification:');
  console.log('Approach 1 memberships:', res1?.memberships.length, 'Role:', res1?.memberships[0]?.role?.name, 'Permissions count:', res1?.memberships[0]?.role?.permissions?.length);
  console.log('Approach 3 memberships:', res3.length, 'Role:', res3[0]?.role?.name, 'Permissions count:', res3[0]?.role?.permissions?.length);

  await prisma.$disconnect();
}

async function main() {
  await testApproaches('Pooler (6543)', dbUrl);
  await testApproaches('Direct (5432)', directUrl);
}

main().catch(console.error);
