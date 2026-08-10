import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  await prisma.$executeRawUnsafe(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE email LIKE '%audit.test.user%'`);
  console.log('Updated');
}

run().catch(console.error).finally(() => prisma.$disconnect());
