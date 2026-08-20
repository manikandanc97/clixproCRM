-- ============================================================================
-- Migration: 20260820223000_audit_log_hash_chain
-- P1 Remediation: Cryptographic Hash Chain & Indexing for AuditLog
-- ============================================================================

-- 1. Add previousHash and recordHash columns
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "previousHash" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "recordHash" TEXT;

-- 2. Create optimized composite and time-series indexes
CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);
