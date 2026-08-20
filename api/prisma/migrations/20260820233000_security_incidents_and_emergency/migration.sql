-- ============================================================================
-- Migration: 20260820233000_security_incidents_and_emergency
-- P4 Remediation: Security Incidents & Emergency Lockdown Architecture
-- ============================================================================

-- 1. Add securityStatus to Tenant and User
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "securityStatus" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "securityStatus" TEXT NOT NULL DEFAULT 'ACTIVE';

-- 2. Create SecurityIncident Table
CREATE TABLE IF NOT EXISTS "SecurityIncident" (
  "id" TEXT NOT NULL,
  "incidentNumber" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "incidentType" TEXT NOT NULL DEFAULT 'SECURITY_ALERT',
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "detectedBy" TEXT NOT NULL,
  "tenantId" TEXT,
  "affectedUserId" TEXT,
  "createdBy" TEXT NOT NULL,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "resolutionNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityIncident_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SecurityIncident_incidentNumber_key" ON "SecurityIncident"("incidentNumber");
CREATE INDEX IF NOT EXISTS "SecurityIncident_status_severity_idx" ON "SecurityIncident"("status", "severity");
CREATE INDEX IF NOT EXISTS "SecurityIncident_tenantId_idx" ON "SecurityIncident"("tenantId");
CREATE INDEX IF NOT EXISTS "SecurityIncident_affectedUserId_idx" ON "SecurityIncident"("affectedUserId");
CREATE INDEX IF NOT EXISTS "SecurityIncident_createdAt_idx" ON "SecurityIncident"("createdAt" DESC);

-- 3. Create PlatformSecurityState Table
CREATE TABLE IF NOT EXISTS "PlatformSecurityState" (
  "id" TEXT NOT NULL DEFAULT 'global',
  "emergencyMode" BOOLEAN NOT NULL DEFAULT false,
  "reason" TEXT,
  "confirmationCode" TEXT,
  "enabledAt" TIMESTAMP(3),
  "enabledBy" TEXT,
  "disabledAt" TIMESTAMP(3),
  "disabledBy" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlatformSecurityState_pkey" PRIMARY KEY ("id")
);
