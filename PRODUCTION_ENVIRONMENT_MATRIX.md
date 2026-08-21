# ClixProCRM — Production Environment Matrix

This document defines every configuration and environment variable required or supported across the ClixProCRM Production ecosystem (`api` Fastify backend and `web` Next.js frontend).

> [!CAUTION]
> **Zero-Secret Disclosure Policy**: Actual production cryptographic keys, tokens, database passwords, and service role credentials must **never** be committed to version control, printed in logs, or exposed to the client bundle.

---

## 1. Core API Backend Environment Variables (`api/.env`)

| Variable Name | Required? | Prod Only? | Secret? | Target Tier | Validation Rule | Failure Behavior | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | No | **Yes** | Server (`api`) | Valid `postgresql://` or `postgres://` connection string with SSL mode | Server refuses to boot (Fatal exit code 1) | **VERIFIED FROM LOCAL / POOLER READY** |
| `DIRECT_URL` | **Yes** | No | **Yes** | Server (`api`) | Valid direct PostgreSQL connection string for Prisma migrations | Migrations fail if pooling prevents DDL | **CONFIGURED** |
| `SUPABASE_URL` | **Yes** | No | No | Server (`api`) | Valid `https://` Supabase project endpoint | Auth guard fails all JWT verifications (401 Unauthorized) | **VERIFIED FROM LOCAL ENVIRONMENT** |
| `SUPABASE_ANON_KEY` | **Yes** | No | No (Public) | Server (`api`) | Non-empty JWT anon public key | Supabase client initialization failure | **VERIFIED FROM LOCAL ENVIRONMENT** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | No | **CRITICAL SECRET** | Server (`api`) | Non-empty JWT service_role secret key; must NEVER start with `NEXT_PUBLIC_` | Admin user synchronization and elevated auth tasks fail | **CONFIGURED ON SERVER ONLY** |
| `FIELD_ENCRYPTION_KEY` | **Yes** | Yes | **CRITICAL SECRET** | Server (`api`) | Exactly 64 hex characters (32 bytes AES-256-GCM) | Server refuses to boot in production (`SecurityConfigValidator`) | **VALIDATED BY TEST & SCHEMA** |
| `AUDIT_LOG_HMAC_SECRET` | **Yes** | Yes | **CRITICAL SECRET** | Server (`api`) | Minimum 32 characters high-entropy string | Server refuses to boot in production (`SecurityConfigValidator`) | **VALIDATED BY TEST & SCHEMA** |
| `ALLOWED_ORIGINS` | **Yes** | Yes | No | Server (`api`) | Comma-separated list of fully qualified HTTPS origins (no trailing slash) | CORS errors block browser API calls; defaults to localhost + Vercel | **CONFIGURED WITH SECURE DEFAULTS** |
| `PORT` | No | No | No | Server (`api`) | Integer port (default: `4000`) | Defaults to 4000 | **DEFAULTS TO 4000** |
| `NODE_ENV` | **Yes** | No | No | Server (`api`) | `production` \| `development` \| `test` | Enables strict production validations when set to `production` | **CONFIGURED (`production`)** |

---

## 2. Distributed Caching & Rate Limiting (`Upstash Redis`)

| Variable Name | Required? | Prod Only? | Secret? | Target Tier | Validation Rule | Failure Behavior | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `UPSTASH_REDIS_REST_URL` | No (Recommended) | No | No | Server (`api` & `web`) | Valid `https://` Upstash REST endpoint | Falls back safely to in-memory rate limiting & deduplication | **NOT CONFIGURED (In-Memory Fallback Active)** |
| `UPSTASH_REDIS_REST_TOKEN` | No (Recommended) | No | **Yes** | Server (`api` & `web`) | Non-empty REST token | Distributed rate limiting disabled; local fallback active | **NOT CONFIGURED (In-Memory Fallback Active)** |

---

## 3. Real-Time Security Alerting (`SMTP`)

| Variable Name | Required? | Prod Only? | Secret? | Target Tier | Validation Rule | Failure Behavior | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SMTP_HOST` | No (Recommended) | No | No | Server (`api`) | Valid hostname / IP (e.g. `smtp.sendgrid.net`) | Security alerts logged to console/DB; email dispatch suppressed | **NOT CONFIGURED (Safe Console Fallback)** |
| `SMTP_PORT` | No (Recommended) | No | No | Server (`api`) | Valid port (`587`, `465`, `25`) | Defaults to 587 | **DEFAULTS TO 587** |
| `SMTP_SECURE` | No | No | No | Server (`api`) | Boolean (`true` for 465, `false` for STARTTLS 587) | Defaults to false | **CONFIGURED** |
| `SMTP_USER` | No (Recommended) | No | No | Server (`api`) | Non-empty username / API key ID | Email dispatch skipped | **NOT CONFIGURED** |
| `SMTP_PASS` | No (Recommended) | No | **Yes** | Server (`api`) | Non-empty password / SMTP API token | Email authentication fails gracefully without crashing server | **NOT CONFIGURED** |
| `SMTP_FROM` | No (Recommended) | No | No | Server (`api`) | RFC 5322 email string (`"Name" <addr@domain.com>`) | Defaults to `noreply@clixprocrm.com` | **CONFIGURED DEFAULT** |
| `SUPPORT_EMAIL` | No | No | No | Server (`api`) | Valid email address | Fallback to platform admin contact | **CONFIGURED DEFAULT** |

---

## 4. Immutable Audit Archival (`AWS S3 WORM Object Lock`)

| Variable Name | Required? | Prod Only? | Secret? | Target Tier | Validation Rule | Failure Behavior | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AUDIT_ARCHIVE_ENABLED` | No (Enterprise) | Yes | No | Server (`api`) | `true` \| `false` | When false, outbox queue remains intact in PostgreSQL DB | **CONFIGURED (Defaults to False/Outbox)** |
| `AWS_S3_AUDIT_BUCKET` / `AUDIT_ARCHIVE_BUCKET` | No (Enterprise) | Yes | No | Server (`api`) | Valid S3 bucket name with Object Lock COMPLIANCE mode | Archiver logs error; records remain safely stored in DB outbox | **NOT CONFIGURED (DB Outbox Active)** |
| `AWS_REGION` | No (Enterprise) | Yes | No | Server (`api`) | Valid AWS region code (e.g. `us-east-1`) | Defaults to `us-east-1` | **CONFIGURED DEFAULT** |
| `AWS_ACCESS_KEY_ID` | No (Enterprise) | Yes | **Yes** | Server (`api`) | Valid IAM Access Key with `s3:PutObject` permissions | AWS S3 archiving disabled; outbox retries safely | **NOT CONFIGURED** |
| `AWS_SECRET_ACCESS_KEY` | No (Enterprise) | Yes | **CRITICAL SECRET** | Server (`api`) | Valid IAM Secret Key | AWS S3 archiving disabled; outbox retries safely | **NOT CONFIGURED** |
| `AUDIT_ARCHIVE_RETENTION_DAYS` | No (Enterprise) | Yes | No | Server (`api`) | Positive integer (e.g. `2555` for 7 years) | Defaults to 2555 days (7-year compliance standard) | **CONFIGURED DEFAULT (2555 Days)** |

---

## 5. Web Frontend Environment Variables (`web/.env` / `web/.env.local`)

| Variable Name | Required? | Prod Only? | Secret? | Target Tier | Validation Rule | Failure Behavior | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | No | No (Public) | Client & SSR (`web`) | Valid `https://` API base URL (e.g. `https://api.clixprocrm.com/api`) | Frontend API requests fail (network error) | **CONFIGURED (`/api`)** |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | No | No (Public) | Client & SSR (`web`) | Valid `https://` Supabase project URL | Browser auth & session cookie sync fail | **VERIFIED FROM LOCAL ENVIRONMENT** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | No | No (Public) | Client & SSR (`web`) | Valid Supabase anon public key | Browser auth client initialization fails | **VERIFIED FROM LOCAL ENVIRONMENT** |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Yes | No (Public) | Client & SSR (`web`) | Canonical frontend URL (e.g. `https://app.clixprocrm.com`) | OAuth callbacks and email redirect links misdirect | **CONFIGURED** |

---

## 6. Verification Legend

- **VERIFIED FROM LOCAL ENVIRONMENT**: Connected, parsed, and confirmed working in test/local execution.
- **CONFIGURED ON SERVER ONLY**: Validated by architecture; secret is isolated to backend and forbidden from client exposure.
- **VALIDATED BY TEST & SCHEMA**: Cryptographic length, structure, and algorithm verified via automated unit and regression suites.
- **NOT CONFIGURED (In-Memory Fallback Active)**: Optional service not yet provisioned; robust in-process fallback confirmed safe for single-instance deployment.
