import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TasksQueryService } from '../src/activities/services/tasks.query.service';
import { PipelineService } from '../src/deals/services/pipeline.service';
import { CustomersService } from '../src/customers/customers.service';
import { LeadsService } from '../src/leads/services/leads.service';
import { AnalyticsService } from '../src/insights/services/analytics.service';
import { DashboardService } from '../src/insights/services/dashboard.service';
import { MeetingsService } from '../src/activities/services/meetings.service';
import { NotificationsService } from '../src/notifications/services/notifications.service';
import { AuthService } from '../src/auth/auth.service';

async function runBenchmark() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const prisma = app.get(PrismaService);
  const tasksQueryService = app.get(TasksQueryService);
  const pipelineService = app.get(PipelineService);
  const customersService = app.get(CustomersService);
  const leadsService = app.get(LeadsService);
  const analyticsService = app.get(AnalyticsService);
  const dashboardService = app.get(DashboardService);
  const meetingsService = app.get(MeetingsService);
  const notificationsService = app.get(NotificationsService);
  const authService = app.get(AuthService);

  const tenant = await prisma.tenant.findFirst({
    include: { users: { include: { user: true, role: true } } },
  });

  if (!tenant) {
    console.log('No tenant found for testing');
    await app.close();
    return;
  }

  const tenantId = tenant.id;
  const tenantUser = tenant.users[0];
  const user = tenantUser?.user || { id: 'test-user', sub: 'test-user' };
  const userRole = tenantUser?.role?.name || 'ADMIN';

  console.log(`\n================ PERFORMANCE BENCHMARK ================`);
  console.log(`Tenant: ${tenant.name} (${tenantId})`);
  console.log(`User: ${user.id} (Role: ${userRole})\n`);

  async function measure(name: string, fn: () => Promise<any>): Promise<number> {
    const start = performance.now();
    await fn();
    const duration = performance.now() - start;
    console.log(`${name.padEnd(35)} : ${duration.toFixed(2)} ms`);
    return duration;
  }

  console.log('--- Pass 1: Cold Run ---');
  await measure('1. tasks', () =>
    tasksQueryService.getTasks(tenantId, {
      userId: user.id,
      role: userRole,
    }),
  );

  await measure('2. pipeline', () =>
    pipelineService.getPipeline(tenantId),
  );

  await measure('3. customers', () =>
    customersService.getCustomers(tenantId, 1, 50),
  );

  await measure('4. leads', () =>
    leadsService.getLeads(tenantId, { page: 1, limit: 50 }),
  );

  await measure('5. analytics', () =>
    analyticsService.getAnalytics(tenantId, 'This Month'),
  );

  await measure('6. dashboard?timeframe=month', () =>
    dashboardService.getDashboardData(tenantId, 'month'),
  );

  await measure('7. meetings', () =>
    meetingsService.getMeetings(tenantId, { id: user.id, role: userRole }),
  );

  await measure('8. ai-insights', () =>
    analyticsService.getAiInsights(tenantId),
  );

  await measure('9. hot-leads', () =>
    leadsService.getHotLeads(tenantId),
  );

  await measure('10. notifications', () =>
    notificationsService.getNotifications(tenantId, user.id),
  );

  await measure('11. me', () =>
    authService.getMe(user.id, tenantId, user.email),
  );

  await measure('12. revenue-growth?filter=Year', () =>
    analyticsService.getRevenueGrowthData(tenantId, 'Year'),
  );

  console.log('\n--- Pass 2: Warm Cache ---');
  await measure('1. tasks', () =>
    tasksQueryService.getTasks(tenantId, {
      userId: user.id,
      role: userRole,
    }),
  );

  await measure('2. pipeline', () =>
    pipelineService.getPipeline(tenantId),
  );

  await measure('3. customers', () =>
    customersService.getCustomers(tenantId, 1, 50),
  );

  await measure('4. leads', () =>
    leadsService.getLeads(tenantId, { page: 1, limit: 50 }),
  );

  await measure('5. analytics', () =>
    analyticsService.getAnalytics(tenantId, 'This Month'),
  );

  await measure('6. dashboard?timeframe=month', () =>
    dashboardService.getDashboardData(tenantId, 'month'),
  );

  await measure('7. meetings', () =>
    meetingsService.getMeetings(tenantId, { id: user.id, role: userRole }),
  );

  await measure('8. ai-insights', () =>
    analyticsService.getAiInsights(tenantId),
  );

  await measure('9. hot-leads', () =>
    leadsService.getHotLeads(tenantId),
  );

  await measure('10. notifications', () =>
    notificationsService.getNotifications(tenantId, user.id),
  );

  await measure('11. me', () =>
    authService.getMe(user.id, tenantId, user.email),
  );

  await measure('12. revenue-growth?filter=Year', () =>
    analyticsService.getRevenueGrowthData(tenantId, 'Year'),
  );

  console.log(`\n=======================================================\n`);

  await app.close();
}

runBenchmark().catch((err) => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
