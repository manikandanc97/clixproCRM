import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { DashboardController } from '../src/insights/controllers/dashboard.controller';
import { DashboardService } from '../src/insights/services/dashboard.service';
import { SupabaseAuthGuard } from '../src/auth/supabase.guard';
import { TenantGuard } from '../src/auth/tenant.guard';
import { ExecutionContext } from '@nestjs/common';

async function runProfile() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const prisma = app.get(PrismaService);
  const controller = app.get(DashboardController);
  const dashboardService = app.get(DashboardService);
  const tenantGuard = app.get(TenantGuard);
  const authGuard = app.get(SupabaseAuthGuard);

  const tenant = await prisma.tenant.findFirst({
    include: { users: { include: { user: true, role: true } } },
  });

  if (!tenant) {
    console.error('No tenant found!');
    await app.close();
    return;
  }

  const tenantId = tenant.id;
  const user = tenant.users[0]?.user;
  if (!user) {
    console.error('No user found in tenant!');
    await app.close();
    return;
  }

  console.log(`\n================ REAL ENVIRONMENT DASHBOARD PROFILING ================`);
  console.log(`Tenant: ${tenant.name} (${tenantId})`);
  console.log(`User: ${user.name} (${user.id})\n`);

  // Let's run 5 full passes through the pipeline
  const requestTimings: number[] = [];

  for (let pass = 1; pass <= 5; pass++) {
    console.log(`\n--- PASS ${pass} ---`);
    const tPassStart = performance.now();

    // 1. Auth Guard (Token Validation / Cache)
    const tAuth0 = performance.now();
    // Simulate auth token check (either cached or supabase remote call)
    // To simulate realistic auth:
    const mockAuthContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer mock-token-' + pass,
          },
        }),
      }),
    };
    // Let's measure direct Supabase Auth ping / API call duration
    const tAuth1 = performance.now();
    const authTime = tAuth1 - tAuth0;

    // 2. User & Tenant Lookup / RBAC (TenantGuard)
    const tTenant0 = performance.now();
    // In TenantGuard, if not cached or cached:
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { role: { include: { permissions: true } } },
        },
      },
    });
    const tTenant1 = performance.now();
    const tenantGuardTime = tTenant1 - tTenant0;

    // 3. Controller execution -> Service
    const tCtrl0 = performance.now();
    const req: any = {
      tenantId: tenantId,
      user: { id: user.id },
      userRole: userRecord?.memberships[0]?.role,
    };

    const dashboardData = await controller.getDashboard(req, 'month');
    const tCtrl1 = performance.now();
    const controllerTotal = tCtrl1 - tCtrl0;

    const tPassEnd = performance.now();
    const totalPassTime = tPassEnd - tPassStart;
    requestTimings.push(totalPassTime);

    console.log(`Pass ${pass} Total: ${totalPassTime.toFixed(2)} ms (TenantGuard DB: ${tenantGuardTime.toFixed(2)} ms, Controller+Service: ${controllerTotal.toFixed(2)} ms)`);
  }

  console.log('\n================ 5 REQUEST MEASUREMENTS ================');
  requestTimings.forEach((t, i) => console.log(`Request ${i + 1}: ${t.toFixed(2)} ms`));
  const avgTotal = requestTimings.reduce((a, b) => a + b, 0) / requestTimings.length;
  console.log(`Average: ${avgTotal.toFixed(2)} ms`);

  await app.close();
}

runProfile().catch(console.error);
