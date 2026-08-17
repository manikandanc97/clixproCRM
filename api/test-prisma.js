const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const task = await prisma.task.findFirst();
    if (!task) {
      console.log('No task found');
      return;
    }
    await prisma.task.findUnique({
      where: { id: task.id, tenantId: task.tenantId },
    });
    console.log('findUnique succeeded');
  } catch (e) {
    console.error('findUnique failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
