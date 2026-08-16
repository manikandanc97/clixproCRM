const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const result = await prisma.$queryRaw`SELECT id, email, email_confirmed_at, confirmed_at FROM auth.users WHERE email = 'emp2@gmail.com'`;
    console.log("Users:", result);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
