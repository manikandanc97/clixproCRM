import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DashboardController } from '../src/insights/controllers/dashboard.controller';
import { PrismaService } from '../src/prisma/prisma.service';
import { DashboardService } from '../src/insights/services/dashboard.service';

async function main() {
  console.log('=== Initializing NestJS Testing Module ===');
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const prisma = app.get(PrismaService);
  const dashboardService = app.get(DashboardService);
  const controller = app.get(DashboardController);

  const user = await prisma.user.findFirst();
  const tenant = await prisma.tenant.findFirst();
  if (!user || !tenant) {
    console.error('No user or tenant');
    return;
  }
  const tenantId = tenant.id;
  const userId = user.id;

  console.log(`\n======================================================`);
  console.log(`BENCHMARK: 5 Consecutive Dashboard Invocations`);
  console.log(`Tenant: ${tenant.name} (${tenantId})`);
  console.log(`User: ${user.name} (${userId})`);
  console.log(`======================================================\n`);

  const timings: number[] = [];

  for (let i = 1; i <= 5; i++) {
    console.log(`--- [RUN ${i}] ---`);
    const t0 = performance.now();
    const req: any = {
      tenantId,
      user: { id: userId },
    };
    const result = await controller.getDashboard(req, 'month');
    const t1 = performance.now();
    const dur = t1 - t0;
    timings.push(dur);
    console.log(`[RUN ${i} TOTAL DURATION]: ${dur.toFixed(2)} ms (Success: ${result.success}, Stats count: ${result.data?.stats?.length})\n`);
    if (i < 5) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log('======================================================');
  console.log('SUMMARY OF 5 RUNS:');
  timings.forEach((t, idx) => console.log(`Request ${idx + 1} -> ${t.toFixed(2)} ms`));
  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
  console.log(`Average -> ${avg.toFixed(2)} ms`);
  console.log('======================================================\n');

  await app.close();
}

main().catch(console.error);
