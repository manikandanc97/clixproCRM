const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const email = 'admin@admin.com';
    const name = 'admin';
    
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
