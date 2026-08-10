import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function listMigrations() {
  const prisma = new PrismaClient();
  
  const result = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: Date | null }>>`
    SELECT "migration_name", "started_at", "finished_at", "applied_steps_count"
    FROM "_prisma_migrations"
    ORDER BY "started_at" ASC
  `;
  
  console.log('Migrations in DB:');
  result.forEach((r) => console.log(`  - ${r.migration_name} (${r.finished_at ? 'applied' : 'pending'})`));

  await prisma.$disconnect();
}

listMigrations().catch(console.error);
