# ClixProCRM — Enterprise Security Control Matrix

| Control ID | Category | Control Name | Implemented Mechanism | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | `AUTH` | Supabase JWT Verification | `SupabaseAuthGuard` validates asymmetric signature & expiry | Automated Unit/Integration Tests | **VERIFIED** |
| **MFA-01** | `MFA` | AAL2 Multi-Factor Auth | `AalGuard` enforces AAL2 on Super Admin & sensitive APIs | Automated Guard Unit Tests | **VERIFIED** |
| **SESS-01** | `SESSION` | Dual Session Timeouts | `UserSession` enforces 30m idle & 24h absolute timeouts | Automated Session Expiry Suite | **VERIFIED** |
| **SESS-02** | `SESSION` | Instant Session Revocation | In-memory token set & DB revocation timestamp lookup | Automated Revocation Tests | **VERIFIED** |
| **RBAC-01** | `RBAC` | SuperAdmin & Role Isolation | `SuperAdminGuard` & `PermissionsGuard` policy check | Automated Permission Tests | **VERIFIED** |
| **RLS-01** | `RLS` | PostgreSQL FORCE RLS | `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY` | PostgreSQL Migration & DB Tests | **VERIFIED** |
| **AUD-01** | `AUDIT` | AuditLog Immutability | `trg_audit_log_immutable` blocks UPDATE/DELETE | Automated SQL Trigger Tests | **VERIFIED** |
| **CRYP-01** | `CRYPTO` | HMAC-SHA256 Audit Sealing | Deterministic HMAC-SHA256 sealing with advisory locks | Cryptographic Verification Suite | **VERIFIED** |
| **CRYP-02** | `CRYPTO` | Isolated Hash Chains | Separate chains for Tenant entities and Platform events | Multi-Tenant Chain Tests | **VERIFIED** |
| **WORM-01** | `WORM` | S3 Object Lock Archive | S3 Object Lock in COMPLIANCE mode via `AuditArchiveOutbox` | S3 Outbox Worker & Mock Tests | **VERIFIED** |
| **MON-01** | `MONITOR` | Continuous Integrity Monitor | 3-tier integrity verification service with Redis cooldown | Scheduled Verification Tests | **VERIFIED** |
| **INC-01** | `INCIDENT` | Security Incident Workflow | Incident lifecycle tracking with Redis deduplication | Incident Management Tests | **VERIFIED** |
| **INC-02** | `INCIDENT` | Break-Glass Emergency Mode | Single-use server confirmation codes (`EMERGENCY-XXX`) | Emergency Security Suite | **VERIFIED** |
| **NET-01** | `NETWORK` | Enterprise SSRF Filter | Blocks loopback, RFC1918, link-local, & cloud metadata | SSRF Security Test Suite | **VERIFIED** |
| **UPL-01** | `UPLOAD` | Magic-Byte Signature Check | Checks binary signatures (PNG, JPEG, GIF, WebP, PDF, ZIP) | File Upload Security Suite | **VERIFIED** |
| **INP-01** | `INPUT` | Mass Assignment Protection | NestJS `ValidationPipe` whitelist transforms & filters | Input Validation Test Suite | **VERIFIED** |
| **INP-02** | `INPUT` | Recursive XSS Sanitizer | Strips `<script>`, `<iframe>`, event handlers, & JS URLs | XSS Sanitization Test Suite | **VERIFIED** |
| **CFG-01** | `CONFIG` | Secret & Env Validation | `SecurityConfigValidator` fail-fast validation on startup | Environment Config Tests | **VERIFIED** |
| **BCK-01** | `BACKUP` | Zero-Write DR Verification | `AuditDisasterRecoveryService` zero-write restore check | DR Verification Test Suite | **VERIFIED** |
| **GOV-01** | `GOVERN` | Readiness Scoring & Export | `SecurityGovernanceService` 0-100 score & SHA-256 seal | Governance Test Suite | **VERIFIED** |
