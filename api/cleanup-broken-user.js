const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function run() {
  try {
    const email = 'emp1@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.tenantUser.deleteMany({ where: { userId: user.id } });
      await prisma.invitation.deleteMany({ where: { email } });
      await prisma.user.delete({ where: { id: user.id } });
      console.log('Cleaned up broken employee from Prisma database.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
