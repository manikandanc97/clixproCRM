const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.rolePermission.groupBy({
  by: ['roleId', 'module'],
  _count: { module: true },
  having: { module: { _count: { gt: 1 } } }
}).then(dupes => {
  if (dupes.length === 0) {
    console.log('✅ No duplicate RolePermission records found.');
  } else {
    console.log('⚠️ Duplicates found:', dupes);
  }
  p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
