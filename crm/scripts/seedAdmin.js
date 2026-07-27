const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'admin';

    if (!email || !password) {
      console.error('Please provide ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
      process.exit(1);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }
    
    await prisma.$transaction(async (tx) => {
      const tenantName = `Admin Workspace`;
      const tenantSlug = 'admin-workspace-' + Date.now();
      
      const newTenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: tenantSlug,
          plan: 'premium',
        }
      });
      
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      });
      
      await tx.tenantUser.create({
        data: {
          tenantId: newTenant.id,
          userId: newUser.id,
          role: 'ADMIN'
        }
      });
      
      console.log('Admin created successfully!');
    });
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
