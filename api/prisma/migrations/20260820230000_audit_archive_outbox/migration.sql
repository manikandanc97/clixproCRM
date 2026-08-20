-- ============================================================================
-- Migration: 20260820230000_audit_archive_outbox
-- P2 Remediation: Transactional Outbox for External WORM Audit Archival
-- ============================================================================

-- 1. Create AuditArchiveOutbox Table
CREATE TABLE IF NOT EXISTS "AuditArchiveOutbox" (
  "id" TEXT NOT NULL,
  "auditLogId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastAttemptAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditArchiveOutbox_pkey" PRIMARY KEY ("id")
);

-- 2. Unique index on auditLogId to ensure idempotent 1-to-1 relationship
CREATE UNIQUE INDEX IF NOT EXISTS "AuditArchiveOutbox_auditLogId_key" ON "AuditArchiveOutbox"("auditLogId");

-- 3. Index for background worker polling
CREATE INDEX IF NOT EXISTS "AuditArchiveOutbox_status_nextAttemptAt_idx" ON "AuditArchiveOutbox"("status", "nextAttemptAt");

-- 4. Foreign Key to AuditLog
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AuditArchiveOutbox_auditLogId_fkey'
  ) THEN
    ALTER TABLE "AuditArchiveOutbox" ADD CONSTRAINT "AuditArchiveOutbox_auditLogId_fkey"
      FOREIGN KEY ("auditLogId") REFERENCES "AuditLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
