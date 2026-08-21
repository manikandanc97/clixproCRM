# ClixProCRM — Production Deployment Runbook & Smoke Test Protocol

This runbook provides the step-by-step procedure for deploying ClixProCRM to production, applying database migrations safely, validating security configurations, and executing post-deployment smoke tests.

---

## Part I: 18-Step Production Deployment Checklist

### Step 1: Provision Infrastructure
- Provision PostgreSQL Database with Point-in-Time Recovery (PITR) enabled.
- Provision Supabase Identity project.
- Provision Vercel Project (Frontend) and AWS/Render Container Service (Backend API).
- *(Optional)* Provision Upstash Redis instance.
- *(Optional)* Provision AWS S3 Bucket with Object Lock enabled in `COMPLIANCE` mode.

### Step 2: Configure Production Secrets
Ensure the following secrets are configured in backend environment variables (never in git):
- `DATABASE_URL` and `DIRECT_URL` (with SSL required)
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIELD_ENCRYPTION_KEY` (64-character hex string / 32 bytes)
- `AUDIT_LOG_HMAC_SECRET` (32+ character high entropy secret)
- `ALLOWED_ORIGINS` (comma-separated frontend production domains)

### Step 3: Configure Supabase
- Under Supabase Project -> **Authentication** -> **Providers**: Confirm Email provider is enabled.
- Under **MFA**: Enable TOTP (Authenticator App) support.
- Set **Site URL** to `https://app.clixprocrm.com` and add redirect URLs for `/api/auth/callback`.

### Step 4: Configure PostgreSQL
- Confirm `pgcrypto` and required extensions are installed.
- Ensure PgBouncer pool mode is set to `transaction`.

### Step 5: Apply Prisma Migrations
Run production migration command from deployment CI/CD:
```bash
cd api
npx prisma migrate deploy
```
Verify status:
```bash
npx prisma migrate status
```
*Expected*: All migrations applied, schema in sync.

### Step 6: Configure Redis (Optional)
- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` if multi-instance cluster rate limiting is active.
- If skipped, verify single-instance in-memory rate limiter initializes.

### Step 7: Configure SMTP (Optional)
- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- Send safe test notification or verify fallback logger.

### Step 8: Configure AWS S3 WORM (Optional / Enterprise)
- Set `AWS_S3_AUDIT_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
- Ensure bucket retention matches compliance rules (e.g. 2555 days).

### Step 9: Deploy Backend API
- Build container / bundle: `npm run build` in `api/`.
- Start Fastify API process: `npm run start:prod` (or container entrypoint).
- Verify startup logs show successful fail-fast security validation.

### Step 10: Deploy Frontend
- Build Next.js app: `npm run build` in `web/`.
- Deploy to Vercel / edge hosting.
- Confirm environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`) are populated.

### Step 11: Verify Health & Readiness
- `GET https://api.clixprocrm.com/api/health/live` -> Returns HTTP 200 `{ status: "UP" }`.
- `GET https://api.clixprocrm.com/api/health/ready` -> Returns HTTP 200 `{ status: "UP", checks: { database: "UP", configuration: "UP" } }`.

### Step 12: Verify Authentication
- Navigate to `https://app.clixprocrm.com/login`.
- Authenticate with a test user; confirm JWT issue and secure cookie creation.
- Test session refresh and logout.

### Step 13: Verify MFA (AAL2 Enforcement)
- Enroll TOTP authenticator for admin user.
- Attempt access to Super Admin Security Operations; confirm `AalGuard` requires `aal2` verification.

### Step 14: Verify Tenant Isolation (RLS)
- In test tenant A, query CRM Leads; verify 0 records from tenant B are returned.
- Attempt cross-tenant IDOR access using a crafted direct ID; verify 404 or 403 response.

### Step 15: Verify Audit Logging & Hash Chains
- Perform a CRM entity update (e.g. edit contact).
- Check `AuditLog` table: verify record created with `recordHash` and valid `previousHash`.
- Attempt direct SQL `UPDATE` on `AuditLog`; verify `trg_audit_log_immutable` trigger aborts transaction.

### Step 16: Verify Rate Limiting
- Dispatch 25 rapid requests to `/api/auth/login`; verify HTTP 429 `Too Many Requests` with `Retry-After` header.

### Step 17: Verify Real-Time Security Alerts
- Log in from a new user-agent/IP combination.
- Verify security activity record created under `/api/auth/sessions/activity`.

### Step 18: Verify Rollback Readiness
- Confirm previous release artifact / container tag is stored in registry and ready for instant activation if required.

---

## Part II: Production Smoke Test Protocol

Execute these non-destructive checks following every production release:

| Test ID | Area | Action / Path | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ST-01** | Public | `GET /` | Returns 200, landing / login redirect | PASS |
| **ST-02** | Health | `GET /api/health/live` | Returns 200 `{ status: "UP" }` | PASS |
| **ST-03** | Readiness | `GET /api/health/ready` | Returns 200 `{ status: "UP", database: "UP" }` | PASS |
| **ST-04** | Auth | `POST /api/auth/login` | Returns JWT and tenant context | PASS |
| **ST-05** | MFA | `POST /api/auth/mfa/verify` | Upgrades session to `aal2` | PASS |
| **ST-06** | Navigation | `GET /dashboard` | Renders dashboard metrics for active tenant | PASS |
| **ST-07** | CRUD | `GET /api/crm/contacts` | Returns contacts strictly for active tenant | PASS |
| **ST-08** | Isolation | `GET /api/crm/deals/:id` | Returns 404/403 for other tenant ID | PASS |
| **ST-09** | Audit Chain | `GET /api/crm/audit-logs` | Logs returned with valid `recordHash` | PASS |
| **ST-10** | Immutability | Direct `UPDATE` AuditLog | Aborted by PostgreSQL trigger | PASS |
| **ST-11** | Security Ops | `GET /super-admin/security` | Accessible only by Super Admin with AAL2 | PASS |
| **ST-12** | Session Revocation | `POST /api/auth/sessions/revoke` | Invalidates target session token | PASS |
