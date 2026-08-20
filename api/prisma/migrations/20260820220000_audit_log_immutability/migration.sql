-- ============================================================================
-- Migration: 20260820220000_audit_log_immutability
-- P0 Remediation: PostgreSQL Database-Level AuditLog Immutability & Protection
-- ============================================================================

-- 1. Drop foreign key constraints on AuditLog to preserve historical logs when Users are deleted
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_userId_fkey";
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_targetUserId_fkey";

-- 2. Create PostgreSQL Immutability Function for AuditLog
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog entries are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

-- 3. Create Immutability Trigger on AuditLog
DROP TRIGGER IF EXISTS trg_audit_log_immutable ON "AuditLog";
CREATE TRIGGER trg_audit_log_immutable
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();
