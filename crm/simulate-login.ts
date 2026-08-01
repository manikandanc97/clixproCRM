import { AuthService } from './services/auth.service';
import prisma from './lib/prisma';

async function main() {
  const email = 'test-dashboard-user@example.com';
  const password = 'Password123!';
  
  try {
    // 1. Cleanup
    await prisma.user.deleteMany({ where: { email } });
    await prisma.tenant.deleteMany({ where: { name: 'Test Dashboard Inc' } });

    // 2. Register
    const regRes = await AuthService.register({
      name: 'Test Dashboard User',
      email,
      password,
      companyName: 'Test Dashboard Inc'
    }, {});
    console.log('Registered user:', regRes.user.id);

    // 3. Login
    const loginRes = await AuthService.login({
      email,
      password
    }, {});
    console.log('Logged in. Token:', loginRes.token);

    // 4. Test API
    const endpoints = [
      '/api/crm/dashboard',
      '/api/crm/tasks',
      '/api/crm/leads',
      '/api/crm/customers',
      '/api/crm/pipeline',
      '/api/crm/meetings',
      '/api/crm/hot-leads'
    ];

    for (const ep of endpoints) {
      console.log(`Testing ${ep}...`);
      const res = await fetch(`http://localhost:3000${ep}`, {
        headers: { Cookie: `auth_token=${loginRes.token}` }
      });
      const data = await res.json().catch(() => null);
      console.log(`${ep} status:`, res.status, data);
    }

  } catch (error) {
    console.error('Error in simulate-login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
