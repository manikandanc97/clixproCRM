import jwt from 'jsonwebtoken';

async function main() {
  const token = jwt.sign({
    userId: '123',
    tenantId: '',
    role: 'ADMIN'
  }, process.env.JWT_SECRET || 'orbit_super_secret_key');

  const res = await fetch(`http://localhost:3000/api/crm/dashboard`, {
    headers: { Cookie: `auth_token=${token}` }
  });
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}
main();
