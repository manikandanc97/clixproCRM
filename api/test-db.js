const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("DATABASE_CONNECTED");
    
    // Optional: Fetch a user just to be sure
    const users = await prisma.user.findFirst();
    console.log("DB_QUERY_SUCCESS");
  } catch (e) {
    console.error("DATABASE_ERROR", e);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
