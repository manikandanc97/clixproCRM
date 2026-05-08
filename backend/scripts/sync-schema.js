const { Client } = require("pg");
const dotenv = require("dotenv");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

dotenv.config();

const crmMigrationName = "20260429090000_add_crm_models";
const crmMigrationPath = path.join(
  __dirname,
  "..",
  "prisma",
  "migrations",
  crmMigrationName,
  "migration.sql",
);

const sql = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'staff',
  "resetToken" TEXT,
  "resetTokenExpiry" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

DO $$ BEGIN
  CREATE TYPE "CustomerStatus" AS ENUM ('PREMIUM', 'ACTIVE', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TaskPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "QuotationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "email" TEXT,
  "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
  "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "lastContactAt" TIMESTAMP(3),
  "manager" TEXT NOT NULL DEFAULT 'Unassigned',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Lead" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "value" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "followUpAt" TIMESTAMP(3),
  "assignedTo" TEXT NOT NULL DEFAULT 'Unassigned',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Task" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dueDate" TIMESTAMP(3),
  "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "assignedTo" TEXT NOT NULL DEFAULT 'Unassigned',
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Quotation" (
  "id" TEXT NOT NULL,
  "quoteNumber" TEXT NOT NULL,
  "client" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "status" "QuotationStatus" NOT NULL DEFAULT 'PENDING',
  "validTill" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL DEFAULT 'System',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Customer_status_idx" ON "Customer"("status");
CREATE INDEX IF NOT EXISTS "Customer_createdAt_idx" ON "Customer"("createdAt");
CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status");
CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX IF NOT EXISTS "Task_status_idx" ON "Task"("status");
CREATE INDEX IF NOT EXISTS "Task_dueDate_idx" ON "Task"("dueDate");
CREATE INDEX IF NOT EXISTS "Task_createdAt_idx" ON "Task"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Quotation_quoteNumber_key" ON "Quotation"("quoteNumber");
CREATE INDEX IF NOT EXISTS "Quotation_status_idx" ON "Quotation"("status");
CREATE INDEX IF NOT EXISTS "Quotation_createdAt_idx" ON "Quotation"("createdAt");
`;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  try {
    await client.query("begin");
    await client.query(sql);
    await recordMigration(client);
    await client.query("commit");
    console.log("Database schema is ready.");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

async function recordMigration(client) {
  const migrationSql = fs.readFileSync(crmMigrationPath, "utf8");
  const checksum = crypto.createHash("sha256").update(migrationSql).digest("hex");

  await client.query(
    `insert into "_prisma_migrations" (
      id,
      checksum,
      finished_at,
      migration_name,
      logs,
      rolled_back_at,
      started_at,
      applied_steps_count
    )
    select
      gen_random_uuid()::text,
      $1,
      now(),
      $2::text,
      null,
      null,
      now(),
      1
    where not exists (
      select 1 from "_prisma_migrations" where migration_name = $2::text
    )`,
    [checksum, crmMigrationName],
  );
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
