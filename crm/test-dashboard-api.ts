import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'orbit_super_secret_key';

async function main() {
  const token = jwt.sign({
    userId: 'test-user-id',
    tenantId: 'test-tenant-id',
    role: 'ADMIN'
  }, JWT_SECRET);

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
    try {
      const res = await fetch(`http://localhost:3000${ep}`, {
        headers: {
          Cookie: `auth_token=${token}`
        }
      });
      const data = await res.json();
      console.log(`${ep} status:`, res.status, data);
    } catch (err) {
      console.error(`${ep} failed:`, err);
    }
  }
}

main();
