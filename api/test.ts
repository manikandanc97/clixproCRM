import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function testRegister() {
  // Try with an ID we know doesn't exist to simulate the onboarding of a brand new user
  // (Assuming Supabase creates the Auth user but not the Prisma user)
  const newUserId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
  
  const data = { userId: newUserId, name: 'John Doe', email: 'johndoe123@clixpro.com', companyName: 'Johns Company' };
  const reqInfo = { ip: '127.0.0.1', userAgent: 'test-agent' };

  try {
    const existingUser = await prisma.user.findUnique({ where: { id: data.userId } });
    if (existingUser) {
      console.log('User already exists, throwing BadRequestException');
      return;
    }

    let slug = data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const tenant = await tx.tenant.create({
        data: { name: data.companyName, slug },
      });

      const role = await tx.role.create({
        data: { name: 'ADMIN', tenantId: tenant.id, isSystem: true },
      });

      const user = await tx.user.create({
        data: {
          id: data.userId,
          name: data.name,
          email: data.email,
        },
      });

      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: role.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          action: 'REGISTER_SUCCESS',
          module: 'Authentication',
          ipAddress: reqInfo.ip || null,
          userAgent: reqInfo.userAgent || null,
        }
      });

      return { user, tenant };
    });

    console.log('Success:', result);
  } catch (error) {
    console.error('Error in transaction:', error);
  }
}

testRegister().finally(() => prisma.$disconnect());
