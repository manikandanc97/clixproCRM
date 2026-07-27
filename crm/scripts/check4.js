const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const tables = ['Customer', 'Lead', 'Task', 'Quotation'];
    for (const table of tables) {
      const res = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
      console.log(`${table} columns:`, res.map(r => r.column_name));
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
