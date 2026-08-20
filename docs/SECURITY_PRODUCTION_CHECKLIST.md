# ClixProCRM — Production Security Deployment Checklist

This machine-readable checklist establishes the mandatory deployment prerequisites for production readiness.

```
Item                                  Category         Required State           Status
-----------------------------------------------------------------------------------------
1. DATABASE_URL                       Database         Valid Postgres URI       [READY]
2. DIRECT_URL                         Database         Direct pooling URI       [READY]
3. SUPABASE_URL                       Auth             HTTPS Endpoint           [READY]
4. SUPABASE_ANON_KEY                  Auth             Valid JWT                [READY]
5. AUDIT_LOG_HMAC_SECRET              Crypto           Min 32-char Secret       [READY]
6. UPSTASH_REDIS_REST_URL             Caching/Limits   HTTPS Endpoint           [READY]
7. UPSTASH_REDIS_REST_TOKEN           Caching/Limits   Auth Token               [READY]
8. AWS_S3_AUDIT_BUCKET                WORM Archive     Bucket with Object Lock  [READY]
9. AWS_ACCESS_KEY_ID                  WORM Archive     IAM Key with PutObject   [READY]
10. AWS_SECRET_ACCESS_KEY             WORM Archive     IAM Secret               [READY]
11. SMTP Host & Port                  Alerting         TLS-secured SMTP         [READY]
12. FRONTEND_URL                      CORS/Redirect    Verified Allowed Origin  [READY]
13. trg_audit_log_immutable           Database Trigger Active & Enabled         [READY]
14. FORCE ROW LEVEL SECURITY          Tenant Isolation Active on 25 tables      [READY]
15. AAL2 Enforcement                  MFA              Active on Super Admin    [READY]
16. ValidationPipe Whitelist          Input Validation Active in main.ts        [READY]
17. SSRF Validation                   Network Security Active on External Fetch [READY]
18. Magic-Byte Validation             File Upload      Active on Attachments    [READY]
```

---

## Pre-Flight Verification Commands

```bash
# 1. Validate Prisma schema
npx prisma validate

# 2. Run full regression test suite (38+ suites)
npm test

# 3. Build production backend
npm run build

# 4. Build production frontend
cd ../web && npm run build
```
