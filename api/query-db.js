const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTriggers() {
  try {
    const triggers = await prisma.$queryRaw`
      SELECT event_object_schema, event_object_table, trigger_name, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth';
    `;
    console.log("Triggers on auth schema:", triggers);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkTriggers();
