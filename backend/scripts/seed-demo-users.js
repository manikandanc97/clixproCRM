const { PrismaClient } = require("../src/generated/prisma");
const bcrypt = require("bcryptjs");
const { DEMO_ACCOUNTS } = require("../src/config/demo-accounts.config");

const prisma = new PrismaClient();

async function seedDemoUsers() {
  try {
    console.log("Starting demo users seeding...");

    // Only seed in development environment
    if (process.env.NODE_ENV !== "development") {
      console.log("Demo seeding is only allowed in development environment");
      return;
    }

    for (const account of DEMO_ACCOUNTS) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: account.email },
      });

      if (existingUser) {
        console.log(`Demo user ${account.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 10);

      // Create user
      await prisma.user.create({
        data: {
          name: account.name,
          email: account.email,
          password: hashedPassword,
          role: account.role,
        },
      });

      console.log(`Created demo user: ${account.email} (${account.role})`);
    }

    console.log("Demo users seeding completed!");
  } catch (error) {
    console.error("Error seeding demo users:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDemoUsers();