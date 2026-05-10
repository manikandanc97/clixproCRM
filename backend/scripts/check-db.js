const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const customerCount = await prisma.customer.count();
  const leadCount = await prisma.lead.count();
  const taskCount = await prisma.task.count();
  const quotationCount = await prisma.quotation.count();

  console.log("Database Stats:");
  console.log(`Users: ${userCount}`);
  console.log(`Customers: ${customerCount}`);
  console.log(`Leads: ${leadCount}`);
  console.log(`Tasks: ${taskCount}`);
  console.log(`Quotations: ${quotationCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
