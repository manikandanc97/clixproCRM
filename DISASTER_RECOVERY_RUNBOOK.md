# ClixProCRM — Disaster Recovery (DR) & Business Continuity Runbook

This runbook defines the operational procedures for recovering the ClixProCRM platform in the event of database corruption, ransomware incidents, regional cloud outages, accidental deletion, or software deployment failures.

---

## 1. DR Metrics & Service Level Objectives

- **Recovery Point Objective (RPO)**:
  - **With Supabase PITR (Point-in-Time Recovery)**: < 5 minutes of data loss.
  - **With Daily Physical Backups**: < 24 hours.
  - **Audit Trail (WORM Archive)**: 0 minutes (Synchronous HMAC chaining + Outbox queue).
- **Recovery Time Objective (RTO)**:
  - **Database Instance Restore**: < 30 minutes.
  - **Application Service Rollback**: < 5 minutes (Vercel Instant Rollback / Docker Tag Rollback).
  - **Full Platform Integrity Re-verification**: < 15 minutes.

---

## 2. Emergency Escalation & Platform Lockdown

If a security compromise, data tampering, or critical failure is detected:

### Step 1: Engage Break-Glass Emergency Mode
Execute break-glass lock down via Super Admin API to freeze non-essential tenant writes:
```bash
POST /api/super-admin/security/operations/emergency/lockdown
Authorization: Bearer <SUPER_ADMIN_AAL2_TOKEN>
Content-Type: application/json

{
  "reason": "DR Activation: Suspected database integrity corruption",
  "confirmationCode": "<GENERATED_BREAK_GLASS_CODE>"
}
```

---

## 3. Database Restore Procedures

### 3.1 Point-in-Time Recovery (Supabase Managed PostgreSQL)
1. Log into the **Supabase Cloud Console** -> Select Project -> **Database** -> **Backups**.
2. Select **Point in Time Recovery (PITR)**.
3. Choose the target timestamp immediately preceding the incident timestamp (e.g. `2026-08-21T08:00:00Z`).
4. Click **Restore to point in time**.
5. Once the restored instance reaches `ACTIVE` state:
   - Verify connection via `npx prisma migrate status`.
   - Update `DATABASE_URL` and `DIRECT_URL` secrets in backend environment if restored to a new instance URL.

### 3.2 Manual SQL Dump Restoration
If restoring from an encrypted pg_dump archive:
```bash
# Set pg_restore variables
export PGPASSWORD="<PROD_DB_PASSWORD>"
pg_restore -h <DB_HOST> -p 5432 -U postgres -d clixprocrm \
  --clean --if-exists --no-owner --no-privileges \
  /backups/clixprocrm_encrypted_backup.dump
```

---

## 4. Post-Restore Integrity Verification

Following any database restoration, run the automated cryptographic integrity verification suite before releasing traffic:

### 4.1 Verify AuditLog Immutability Trigger
Confirm the PostgreSQL trigger prevents any modification or deletion of restored audit logs:
```sql
-- Safe test that MUST fail with 'AuditLog entries are immutable'
UPDATE "AuditLog" SET "action" = 'TAMPER_TEST' WHERE id = (SELECT id FROM "AuditLog" LIMIT 1);
```

### 4.2 Verify Cryptographic Hash Chain Integrity
Run the internal audit DR verification service (`AuditDrService`):
```bash
GET /api/super-admin/security/integrity/verify-all
Authorization: Bearer <SUPER_ADMIN_AAL2_TOKEN>
```
Ensure:
- Total records evaluated match total audit log count.
- `tamperedCount: 0`
- `brokenChains: 0`
- `status: HEALTHY`

### 4.3 Verify S3 WORM Archive Alignment (If Enabled)
```bash
GET /api/super-admin/security/operations/audit-archive/verify-sync
Authorization: Bearer <SUPER_ADMIN_AAL2_TOKEN>
```
Verifies that hashes stored in Amazon S3 Object Lock match the records restored in PostgreSQL.

### 4.4 Verify Tenant Isolation & RLS
Verify that Row Level Security policies remain active and forced:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('Lead', 'Contact', 'Company', 'Deal', 'Task', 'Invoice');
```
All CRM tables must return `rowsecurity = true`.

---

## 5. Application Rollback Procedures

### 5.1 Frontend (Vercel)
1. Open Vercel Dashboard -> **Deployments**.
2. Locate the last known good deployment tag (pre-incident).
3. Click **Instant Rollback** (promotes deployment within seconds).

### 5.2 Backend API (Docker / Cloud Run / ECS)
```bash
# Roll back container image to previous release tag
docker pull ghcr.io/org/clixprocrm-api:v1.0.stable
# Update service definition / restart task
```

---

## 6. Post-Recovery Checklist

- [ ] Liveness endpoint responds: `GET /api/health/live` -> 200 OK
- [ ] Readiness endpoint responds: `GET /api/health/ready` -> 200 OK (`database: UP`, `configuration: UP`)
- [ ] Admin login with MFA (AAL2) verified
- [ ] Sample tenant data isolation verified across two test tenants
- [ ] Emergency lockdown disabled:
  ```bash
  POST /api/super-admin/security/operations/emergency/lift
  Authorization: Bearer <SUPER_ADMIN_AAL2_TOKEN>
  ```
- [ ] Post-incident log and DR report recorded in incident tracker
