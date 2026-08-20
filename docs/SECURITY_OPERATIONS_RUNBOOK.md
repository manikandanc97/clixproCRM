# ClixProCRM — Enterprise Security Operations Runbook

## Overview
This runbook establishes standard operating procedures (SOP) for the ClixProCRM Security Operations Center (SecOps) and Platform Administrators. It provides actionable detection, triage, containment, recovery, and post-incident verification procedures for enterprise security scenarios.

---

## 1. Cryptographic Audit Hash Mismatch

### Detection
- **Trigger:** `AUDIT_HASH_MISMATCH` alert in SecOps Dashboard / Server logs.
- **Metric:** `brokenLinks > 0` or `hashMismatches > 0` in `GET /api/super-admin/security/operations/health`.

### Severity: `CRITICAL`

### Immediate Action & Containment
1. Identify the compromised record UUID: `firstFailureId` in `AuditIntegrityMonitorReport`.
2. Inspect whether the database record was mutated via direct database access or SQL injection bypass.
3. Lock down affected organization or tenant if localized:
   ```bash
   POST /api/super-admin/security/emergency/lock-tenant/:tenantId
   ```
4. If systemic, generate break-glass code and enable Global Emergency Lockdown:
   ```bash
   POST /api/super-admin/security/emergency/platform-lockdown
   ```

### Recovery & Verification
1. Fetch the immutable record from external WORM storage (AWS S3 Object Lock in COMPLIANCE mode) using the zero-write verification dry-run endpoint:
   ```bash
   POST /api/super-admin/security/audit-integrity/dr-verify/:recordId
   ```
2. Re-verify the complete tenant audit chain:
   ```bash
   POST /api/super-admin/security/audit-integrity/verify/:tenantId
   ```
3. Mark security incident as RESOLVED with forensic findings.

---

## 2. Broken Audit Chain (Link Continuity Failure)

### Detection
- **Trigger:** `AUDIT_CHAIN_BROKEN` alert emitted by `AuditIntegrityMonitorService`.
- **Condition:** `record.previousHash !== previousRecord.recordHash`.

### Severity: `CRITICAL`

### Immediate Action
1. Determine the link gap: identify if records were deleted or inserted out of order.
2. Review PostgreSQL trigger `trg_audit_log_immutable` logs to check for unauthorized trigger disablement or database restore from backup.
3. Correlate with concurrent Super Admin activities in the Security Center.

---

## 3. External WORM S3 Archive Outage & Stale Outbox

### Detection
- **Trigger:** `staleOutboxItems > 0` or `wormArchiveFailures > 5` in SecOps metrics.
- **Metric:** `AuditArchiveOutbox` records with `status = 'PENDING'` or `'FAILED'` older than 30 minutes.

### Severity: `HIGH`

### Immediate Action & Recovery
1. Verify AWS IAM credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) and bucket accessibility (`AWS_S3_AUDIT_BUCKET`).
2. Confirm S3 Object Lock COMPLIANCE retention settings.
3. Execute background outbox drainer to retry pending outbox items with exponential backoff:
   ```bash
   # Background processing runs automatically every minute
   ```
4. Confirm WORM coverage returns to 100% via `GET /api/super-admin/security/operations/health`.

---

## 4. Distributed MFA Attack / Credential Stuffing

### Detection
- **Trigger:** `MFA_FAILURE_SPIKE` or `LOGIN_FAILED_SPIKE` anomaly in `SecurityMetricsReport`.
- **Threshold:** $> 50$ login failures or $> 20$ MFA challenge failures in 24 hours.

### Severity: `HIGH`

### Immediate Action
1. Inspect source IPs in Security Activity timeline.
2. Upstash Redis distributed rate limiters will automatically throttle repeat attempts (`15 requests / 15 min`).
3. For targeted user accounts, execute emergency user session termination:
   ```bash
   POST /api/super-admin/security/emergency/revoke-user/:userId
   ```
4. If brute-force persists against a specific user, lock user account:
   ```bash
   POST /api/super-admin/security/emergency/lock-user/:userId
   ```

---

## 5. User Account Compromise

### Detection
- **Trigger:** New device sign-in from unusual geographic location followed by rapid credential changes or privilege escalation attempts.

### Severity: `HIGH`

### Immediate Action
1. Super Admin navigates to `/super-admin/security` in the web application.
2. Open Emergency Controls -> **Lock User**.
3. Provide justification (min 10 characters) and type exact confirmation `LOCK USER`.
4. The system immediately:
   - Sets `User.securityStatus = 'LOCKED'`.
   - Revokes all active `UserSession` records in PostgreSQL.
   - Clears in-memory token cache and Redis session entries.
   - Emits immutable `USER_SECURITY_LOCKED` audit record.

### Unlock Workflow
- Once user identity is verified via secondary out-of-band channel, execute **Unlock User** with Super Admin AAL2 authentication.

---

## 6. Tenant Organization Compromise

### Detection
- **Trigger:** Cross-tenant IDOR attempt or internal organizational data exfiltration alert.

### Severity: `CRITICAL`

### Immediate Action
1. Super Admin navigates to `/super-admin/security`.
2. Open Emergency Controls -> **Lock Tenant**.
3. Type `LOCK TENANT` to confirm.
4. The system immediately:
   - Sets `Tenant.securityStatus = 'LOCKED'`.
   - Terminates all active sessions for all members of the organization.
   - Blocks authenticated CRM API requests for tenant users with `403 Forbidden` (`TENANT_SECURITY_LOCKED`).

---

## 7. Global Platform Break-Glass Emergency Mode

### Detection
- **Trigger:** Critical zero-day vulnerability, systemic database compromise, or active infrastructure breach.

### Severity: `CRITICAL (P0)`

### Immediate Action
1. Navigate to `/super-admin/security`.
2. Select **Platform Lockdown**.
3. Click **Generate** to request single-use server confirmation code (`EMERGENCY-XXXXXXXX`).
4. Type `ENABLE EMERGENCY MODE` and submit.
5. Effect:
   - All standard CRM requests and normal user sessions are blocked across the entire platform.
   - Access is restricted exclusively to Super Admins authenticated with **AAL2 (MFA Verified)**.

### Recovery Workflow
1. Apply and verify security patches.
2. Run automated test suite regression (`npm test`).
3. Super Admin clicks **Disable Emergency Mode** to restore normal platform traffic.

---

## 8. Redis Outage / Failover

### Detection
- **Trigger:** `redis.status = 'DEGRADED'` in Security Health Report.

### Behavior
- The system automatically falls back to in-memory caching and local sliding-window rate limiters.
- Normal CRM functionality and authentication continue uninterrupted without blocking users.

---

## 9. PostgreSQL Database Latency / Failover

### Detection
- **Trigger:** `database.status = 'CRITICAL'` in Security Health Report.

### Behavior
- Health check returns `CRITICAL` immediately.
- Review database connection pool (`DATABASE_URL`, `DIRECT_URL`) and AWS/Supabase compute resources.

---

## 10. Post-Incident Review Checklist
- [ ] Sealed audit records verified intact via `AuditIntegrityMonitorService`.
- [ ] Incident status transitioned to `RESOLVED` with mandatory resolution notes.
- [ ] Affected users/tenants notified.
- [ ] Redis alert deduplication cache cleared where appropriate.
