/**
 * One-time migration script: Seed standard system roles for existing tenants.
 *
 * Problem:
 *   When a tenant was registered before this fix, only the ADMIN role was
 *   created. MANAGER, SALES, and EMPLOYEE roles were not seeded.
 *   Existing employees assigned to any of these un-seeded roles have no
 *   RolePermission records → the PermissionsGuard denies all non-Admin access.
 *
 * What this script does:
 *   For every tenant:
 *     1. Ensure all 4 system roles exist (ADMIN, MANAGER, SALES, EMPLOYEE).
 *     2. For each system role, upsert the canonical RolePermission records.
 *
 * Usage:
 *   node seed-existing-tenants.js
 *
 * Run from: d:\Projects\project\clixprocrm\api\
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SYSTEM_ROLE_PERMISSIONS = {
  ADMIN: [
    'Dashboard', 'Leads', 'Contacts', 'Companies', 'Deals', 'Tasks',
    'Calendar', 'Quotations', 'Reports', 'Employees', 'Roles', 'Settings',
    'Organization', 'Integrations', 'AuditLogs', 'Support',
  ],
  MANAGER: [
    'Dashboard', 'Leads', 'Contacts', 'Companies', 'Deals', 'Tasks',
    'Calendar', 'Quotations', 'Reports', 'Employees',
  ],
  SALES: [
    'Dashboard', 'Leads', 'Contacts', 'Companies', 'Deals', 'Tasks',
    'Calendar', 'Quotations',
  ],
  EMPLOYEE: [
    'Dashboard', 'Tasks', 'Calendar',
  ],
};

const ROLE_PRIORITY = { ADMIN: 100, MANAGER: 70, SALES: 40, EMPLOYEE: 10 };

async function main() {
  const tenants = await prisma.tenant.findMany({ select: { id: true, name: true } });
  console.log(`Found ${tenants.length} tenant(s). Processing...`);

  for (const tenant of tenants) {
    console.log(`\n▶ Tenant: ${tenant.name} (${tenant.id})`);

    for (const [roleName, modules] of Object.entries(SYSTEM_ROLE_PERMISSIONS)) {
      // Upsert the role
      let role = await prisma.role.findFirst({
        where: { tenantId: tenant.id, name: roleName },
      });

      if (!role) {
        role = await prisma.role.create({
          data: {
            tenantId: tenant.id,
            name: roleName,
            isSystem: true,
            priority: ROLE_PRIORITY[roleName],
          },
        });
        console.log(`  ✅ Created role: ${roleName}`);
      } else {
        console.log(`  ℹ️  Role already exists: ${roleName}`);
        // Ensure isSystem and priority are correct
        await prisma.role.update({
          where: { id: role.id },
          data: { isSystem: true, priority: ROLE_PRIORITY[roleName] },
        });
      }

      // Upsert permissions for this role
      for (const module of modules) {
        await prisma.rolePermission.upsert({
          where: { roleId_module: { roleId: role.id, module } },
          create: { roleId: role.id, module, hasAccess: true },
          update: { hasAccess: true },
        });
      }
      console.log(`  ✅ Seeded ${modules.length} permissions for ${roleName}`);
    }
  }

  console.log('\n✅ Migration complete.');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
