import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const supabaseUrl = process.env.SUPABASE_URL || 'https://oscksafwlfkpqvifcvae.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zY2tzYWZ3bGZrcHF2aWZjdmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjU0NTAsImV4cCI6MjA5MjYwMTQ1MH0.sPWAYd62hP1Htlxa_9s2-T1ZzN9C5UbxHbiOatHFxZs';

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

const NEXTJS_URL = 'http://localhost:3000/api/crm';
const NESTJS_URL = 'http://localhost:4000/api/crm'; // Direct NestJS test

async function run() {
  const email = 'e2e_admin_1786276028193@gmail.com';
  const password = 'TestPassword123!';

  console.log('Signing in test user...', email);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error('Failed to sign in:', authError);
    return;
  }

  const token = authData.session?.access_token;
  const userId = authData.user.id;
  console.log('Got user id:', userId, 'and token');

  // Skip Prisma setup because this is an E2E test user that should already exist.

  const endpoints = [
    '/dashboard',
    '/leads',
    '/customers',
    '/companies',
    '/deals',
    '/tasks',
    '/meetings',
    '/pipeline',
    '/quotations',
    '/invoices',
    '/analytics',
    '/reports',
    '/notifications',
    '/employees',
    '/departments',
    '/roles',
    '/workspace',
    '/search?query=test',
    '/ai-insights',
  ];

  const results = [];

  const cookieName = 'sb-oscksafwlfkpqvifcvae-auth-token';
  const cookieValue = encodeURIComponent(JSON.stringify([{
    access_token: token,
    refresh_token: authData.session?.refresh_token,
  }]));
  const cookieString = `${cookieName}=${cookieValue}`;

  for (const ep of endpoints) {
    console.log(`\nTesting ${ep} via Next.js proxy...`);
    const start = Date.now();
    const res = await fetch(`${NEXTJS_URL}${ep}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: cookieString
      }
    });
    const latency = Date.now() - start;
    const isOk = res.ok;
    const status = res.status;
    let data = null;
    try {
      data = await res.json();
    } catch(e) {}
    
    const timeColor = latency > 2000 ? '\x1b[31m' : '\x1b[32m';
    console.log(`[NextJS] ${status} in ${timeColor}${latency}ms\x1b[0m. Is OK: ${isOk}`);

    // Direct NestJS
    const start2 = Date.now();
    const res2 = await fetch(`${NESTJS_URL}${ep}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const latency2 = Date.now() - start2;
    const isOk2 = res2.ok;
    const status2 = res2.status;
    let data2 = null;
    try { data2 = await res2.json(); } catch(e){}
    
    console.log(`[NestJS] ${status2} in ${latency2}ms. Is OK: ${isOk2}`, data2 ? data2 : '');
    
    results.push({ endpoint: ep, proxyStatus: status, directStatus: status2, latency, shape: data ? Object.keys(data) : 'N/A' });
  }

  // Invoice creation test
  console.log('\nTesting Invoice Creation...');
  const createInvRes = await fetch(`${NEXTJS_URL}/invoices`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerId: userId
    })
  });
  console.log('Invoice Creation Status:', createInvRes.status);
  try {
    console.log('Invoice response:', await createInvRes.json());
  } catch(e){}

  // Unauthenticated test
  console.log('\nTesting Unauthenticated...');
  const unauthRes = await fetch(`${NEXTJS_URL}/dashboard`);
  console.log('Unauth Status:', unauthRes.status);

  // console.log('\n--- CLEANUP ---');
  // await prisma.tenantUser.deleteMany({ where: { userId } });
  // await prisma.role.deleteMany({ where: { tenantId: tenant.id } });
  // await prisma.tenant.delete({ where: { id: tenant.id } });
  // await prisma.user.delete({ where: { id: userId } });
  // console.log('Cleanup complete.');

  console.log('\n--- RESULTS SUMMARY ---');
  console.table(results);
}

run().catch(console.error);
