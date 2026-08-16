const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const result = await prisma.$queryRaw`SELECT * FROM "User" WHERE email = 'emp2@gmail.com'`;
    console.log("Prisma Users:", result);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
