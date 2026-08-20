# ClixProCRM — Enterprise Security Architecture (P0–P7)

## Executive Summary
ClixProCRM employs a defense-in-depth security model engineered across the entire application lifecycle. The architecture enforces strict tenant boundary isolation, cryptographic audit trails, external immutable backup, authoritative multi-factor authentication, and centralized security governance.

---

## 1. Security Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                 Layer 7: Governance & SecOps                │
│   • Security Readiness Score (0-100) & Control Matrix       │
│   • Cryptographic SHA-256 Evidence Export                   │
│   • Continuous Observability & Anomaly Spike Detection      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│              Layer 6: Application Hardening (P5)            │
│   • SSRF Protection (RFC1918, Loopback, Cloud Metadata)     │
│   • Magic-Byte File Upload Validation & Extension Blocking  │
│   • Recursive XSS Sanitization & Open Redirect Armor        │
│   • Mass Assignment Protection & Strict DTO Validation      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│            Layer 5: Emergency Incident Controls (P4)        │
│   • Single-Use Break-Glass Server Confirmation Codes        │
│   • Instant User & Tenant Security Isolation Locks          │
│   • Global Emergency Lockdown Mode                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│          Layer 4: Continuous Integrity & DR (P3)            │
│   • 3-Tier Incremental & Full Audit Verification            │
│   • Zero-Write Disaster Recovery Verification               │
│   • Upstash Redis Alert Deduplication (24h Cooldown)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             Layer 3: External WORM S3 Archive (P2)          │
│   • AWS S3 Object Lock in COMPLIANCE Mode (365d retention)  │
│   • Atomic AuditArchiveOutbox Transactional Pattern         │
│   • Asynchronous Exponential Backoff Retry Worker           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│           Layer 2: Cryptographic Audit Sealing (P1)         │
│   • HMAC-SHA256 Canonical Field Hashing                     │
│   • Isolated previousHash Chains (Tenant & Platform)        │
│   • PostgreSQL Advisory Locking for Concurrency Safety      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│          Layer 1: Database Immutability & RLS (P0)          │
│   • trg_audit_log_immutable Blocking UPDATE & DELETE        │
│   • FORCE Row Level Security on all 25 Tenant Tables        │
│   • Authoritative Supabase Auth + MFA / AAL2 Enforcement    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Trust Boundaries & Identity Isolation

1. **Client Trust Model:** Zero client trust. Client headers (`X-Tenant-Id`) and body properties (`tenantId`, `role`, `isSuperAdmin`, `securityStatus`, `recordHash`) are ignored in favor of server-verified JWT identities.
2. **Multi-Tenant Isolation:** All 25 CRM entity tables enforce PostgreSQL `FORCE ROW LEVEL SECURITY`. Every database operation explicitly filters on verified `tenantId`.
3. **Super Admin Isolation:** Super Admin operations require `isSuperAdmin: true` and **AAL2 (MFA Verified)** authentication tokens.
4. **Audit Sealing:** Audit records are sealed upon insert. The PostgreSQL trigger completely prevents tampering even from database superusers unless the trigger itself is intentionally disabled.

---

## 3. Cryptographic Specification

- **Audit Record Sealing:**
  $$\text{recordHash} = \text{HMAC-SHA256}(K, \text{canonicalJSON}(\text{fields}))$$
- **Hash Chain Continuity:**
  $$\text{record}_n.\text{previousHash} = \text{record}_{n-1}.\text{recordHash}$$
- **Report Sealing:**
  $$\text{reportChecksum} = \text{SHA-256}(\text{canonicalJSON}(\text{evidencePayload}))$$
