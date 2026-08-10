# Security Architecture & Guidelines

This document outlines the core security boundaries and architectures governing ClixProCRM.

## 1. Authentication
ClixProCRM utilizes **Supabase SSR Authentication**.
- The Next.js middleware verifies session validity via HttpOnly, secure cookies.
- Obsolete or fallback JWTs, custom login endpoints, and direct `jwt.sign()` operations have been entirely purged.
- **Source of Truth**: The Supabase Auth JWT is the *only* trusted mechanism for establishing identity.

## 2. Multi-Tenant Isolation
- The application uses composite keys inside Prisma schema (e.g., `where: { id: recordId, tenantId: session.tenantId }`) for **all** mutations.
- `tenantId` is never trusted directly from a client request payload. It is exclusively derived from the verified Supabase session payload.
- Cross-tenant data leakage is strictly blocked at the `Service` layer wrapper before hitting Prisma.

## 3. Role-Based Access Control (RBAC)
- Frontend UI guards (like disabling buttons) exist purely for User Experience. 
- Real security is enforced at the server via the `Roles` & `Permissions` schema tables. 
- Sensitive routes (like User Management, Export) validate that the caller's role explicitly permits the action before proceeding.

## 4. Rate Limiting
The application uses Upstash Redis for distributed Rate Limiting, utilizing a Sliding Window mechanism.
Specific endpoints are protected:
- **AI Chat Routes**: Strict caps to prevent token exhaustion.
- **File Uploads**: Throttled to prevent storage bandwidth abuse.
- **Bulk Imports/Exports**: Heavily restricted to avoid memory/CPU monopolization.
- **Auth Endpoints**: High limits for standard use, tight caps for repeated failures.

## 5. Secret Management
- Developer environments must use `.env.example` as a placeholder reference ONLY.
- Genuine secrets (like `SUPABASE_SERVICE_ROLE_KEY` or `GOOGLE_API_KEY`) must never be prefixed with `NEXT_PUBLIC_` unless explicitly required by the browser bundle.

## 6. Indirect Object Reference (IDOR) Protection
- Validating the `recordId` against the user's `tenantId` is mandatory.
- Further checks (like `assignedToId` or `ownerId`) are executed based on module-specific policies. An employee in Tenant A cannot modify another employee's private Tasks, even within the same Tenant, unless they hold Admin privileges.
