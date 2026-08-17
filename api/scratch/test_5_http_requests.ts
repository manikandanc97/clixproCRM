import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const supabaseUrl = 'https://oscksafwlfkpqvifcvae.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zY2tzYWZ3bGZrcHF2aWZjdmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjU0NTAsImV4cCI6MjA5MjYwMTQ1MH0.sPWAYd62hP1Htlxa_9s2-T1ZzN9C5UbxHbiOatHFxZs';

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tenant = await prisma.tenant.findFirst();
  const role = await prisma.role.findFirst({ where: { tenantId: tenant?.id } });
  if (!tenant || !role) {
    console.error('No tenant/role');
    return;
  }

  // Create temporary test user
  const email = `profile_test_${Date.now()}@gmail.com`;
  const password = 'TestPassword123!';

  const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
    email,
    password,
  });

  if (signUpError || !signUpData.user) {
    console.error('Sign up error:', signUpError);
    return;
  }

  const userId = signUpData.user.id;
  const token = signUpData.session?.access_token;
  console.log(`Created auth user: ${userId}, token acquired: ${!!token}`);

  // Link in DB
  await prisma.user.create({
    data: {
      id: userId,
      email,
      name: 'Profile Tester',
      status: 'ACTIVE',
      memberships: {
        create: {
          tenantId: tenant.id,
          roleId: role.id,
          status: 'ACTIVE',
        },
      },
    },
  });

  console.log('Linked user to tenant memberships in DB');

  const url = 'http://127.0.0.1:4000/api/crm/dashboard?timeframe=month';
  console.log(`\nCalling ${url} 5 times sequentially...\n`);

  for (let i = 1; i <= 5; i++) {
    const t0 = performance.now();
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenant.id,
        'Content-Type': 'application/json',
      },
    });
    const t1 = performance.now();
    const json = await res.json();
    const t2 = performance.now();
    console.log(`Request ${i}: HTTP ${res.status} | Network+Server Time: ${(t1 - t0).toFixed(2)} ms | Total With Parse: ${(t2 - t0).toFixed(2)} ms (Success: ${json.success})`);
    if (i < 5) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Clean up test user
  await prisma.tenantUser.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
}

main().finally(() => prisma.$disconnect());
