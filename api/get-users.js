const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers() {
  try {
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Users:", users.map(u => u.email));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

getUsers();
