import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultRoles = [
  { name: 'Super Admin', isSystem: true, priority: 100, color: 'red' },
  { name: 'Admin', isSystem: true, priority: 90, color: 'blue' },
  { name: 'HR Manager', isSystem: true, priority: 80, color: 'purple' },
  { name: 'Sales Manager', isSystem: true, priority: 70, color: 'orange' },
  { name: 'Finance', isSystem: true, priority: 60, color: 'green' },
  { name: 'Employee', isSystem: true, priority: 10, color: 'gray' },
  { name: 'Support', isSystem: true, priority: 20, color: 'teal' },
];

async function main() {
  const tenants = await prisma.tenant.findMany();
  
  for (const tenant of tenants) {
    for (const role of defaultRoles) {
      await prisma.role.upsert({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: role.name
          }
        },
        update: {
          isSystem: role.isSystem,
          priority: role.priority,
          color: role.color
        },
        create: {
          tenantId: tenant.id,
          name: role.name,
          isSystem: role.isSystem,
          priority: role.priority,
          color: role.color
        }
      });
    }
  }
  
  console.log('Seeded default roles for all tenants.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
