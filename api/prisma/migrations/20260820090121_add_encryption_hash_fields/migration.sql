-- Migration: add_encryption_hash_fields
-- Adds HMAC-SHA256 lookup hash columns for encrypted PII fields.
-- Removes unused Meeting columns (oldStartAt, oldEndAt, cancelledBy).
-- All existing columns remain; new columns are nullable for safe migration.

-- Lead: add emailHash for dedup lookups on encrypted email
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "emailHash" TEXT;
CREATE INDEX IF NOT EXISTS "Lead_tenantId_emailHash_idx" ON "Lead"("tenantId", "emailHash");

-- Customer: add emailHash for dedup lookups on encrypted email
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "emailHash" TEXT;
CREATE INDEX IF NOT EXISTS "Customer_tenantId_emailHash_idx" ON "Customer"("tenantId", "emailHash");

-- Company: add nameHash for exact-match lookups on encrypted name
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "nameHash" TEXT;
CREATE INDEX IF NOT EXISTS "Company_tenantId_nameHash_idx" ON "Company"("tenantId", "nameHash");

-- Meeting: remove genuinely unused columns
-- oldStartAt and oldEndAt were never read in any service/query
ALTER TABLE "Meeting" DROP COLUMN IF EXISTS "oldStartAt";
ALTER TABLE "Meeting" DROP COLUMN IF EXISTS "oldEndAt";
-- cancelledBy was written but never queried; storing userId in cancelledAt audit log instead
ALTER TABLE "Meeting" DROP COLUMN IF EXISTS "cancelledBy";
