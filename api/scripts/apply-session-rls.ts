import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Enabling RLS on UserSession...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "UserSession" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "user_isolation_usersession" ON "UserSession";`);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "user_isolation_usersession" ON "UserSession"
        FOR ALL
        USING ("userId" = NULLIF(current_setting('app.current_user_id', true), '') OR COALESCE(current_setting('app.is_super_admin', true) = 'true', false))
        WITH CHECK ("userId" = NULLIF(current_setting('app.current_user_id', true), '') OR COALESCE(current_setting('app.is_super_admin', true) = 'true', false));
    `);
    console.log('UserSession RLS policy applied successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Error applying UserSession RLS:', err);
  process.exit(1);
});
