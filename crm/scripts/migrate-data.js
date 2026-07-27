const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    console.log('Migrating User names...');
    await prisma.$executeRawUnsafe(`UPDATE "User" SET name = TRIM(COALESCE("firstName", '') || ' ' || COALESCE("lastName", '')) WHERE "firstName" IS NOT NULL OR "lastName" IS NOT NULL;`);
    await prisma.$executeRawUnsafe(`UPDATE "User" SET name = "displayName" WHERE "displayName" IS NOT NULL AND "displayName" != '';`);
    console.log('Data migration complete.');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
