import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    include: { memberships: true },
  });
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email, name: u.name, memberships: u.memberships.length })));
}

checkUsers().finally(() => prisma.$disconnect());
