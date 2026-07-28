# CLIXPRO CRM: Official Engineering Handbook

This document outlines the strict engineering standards, conventions, and workflows for developing CLIXPRO CRM. All developers must adhere to these guidelines to ensure a secure, scalable, and maintainable codebase.

---

## 1. Project Folder Structure
We utilize a Feature-Sliced Design (FSD) within the Next.js App Router paradigm.
- `app/`: Next.js routing layer (Pages, Layouts, API Routes). Do NOT place business logic here.
- `features/`: Module-specific components, hooks, and localized state (e.g., `features/leads/`).
- `services/`: Backend business logic and database queries (e.g., `lead.service.ts`).
- `shared/`: Global utilities, generic UI components, standard hooks, and Zod validators.
- `prisma/`: Database schema and migration files.

## 2. Naming Conventions
- **Files/Folders**: Use `kebab-case` for all files except React components (e.g., `lead.service.ts`, `app/api/auth/`).
- **React Components**: Use `PascalCase` (e.g., `LeadForm.tsx`, `AnalyticsDashboard.tsx`).
- **Variables/Functions**: Use `camelCase` (e.g., `fetchLeads`, `isSubmitting`).
- **Constants/Enums**: Use `UPPER_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`).
- **Database Tables/Models**: Use `PascalCase` singular in Prisma (e.g., `model TenantUser`).

## 3. TypeScript Standards
- **Strict Mode**: `strict: true` must be enabled in `tsconfig.json`.
- **No Any**: The use of `any` is strictly prohibited. Use `unknown` if the type is truly dynamic, then type-narrow.
- **Interfaces vs Types**: Prefer `interface` for object shapes (better error messages). Use `type` for unions and primitives.

## 4. React & Next.js Standards
- **Server Components Default**: All components in `app/` should be React Server Components (RSC) by default.
- **Client Boundaries**: Use `"use client"` only at the lowest possible leaf nodes that require interactivity (e.g., `onClick`, `useState`).
- **Data Fetching**: Use React Server Components for initial data fetching where possible. Use `SWR` or `React Query` for client-side polling/mutations.

## 5. Prisma Standards
- **Soft Deletes**: Never use `prisma.model.delete()`. Always use `prisma.model.update({ data: { deletedAt: new Date() } })`.
- **Transactions**: Use `$transaction` for operations modifying multiple tables to prevent orphaned records.
- **No Raw SQL**: Avoid `$queryRaw` unless executing complex geographical queries or proprietary Postgres functions.

## 6. API Coding Standards
- **RESTful Architecture**: Follow standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`).
- **Thin Controllers**: `route.ts` files should only handle HTTP request parsing and response formatting. All logic belongs in `services/`.
- **Validation**: All incoming data MUST be validated against Zod schemas.

## 7. Error Handling Standards
- **Centralized Handling**: Use a standard `handleApiError` utility for all API routes.
- **Standard Format**: Always return `{ success: false, error: { code, message, details } }`.
- **Do Not Leak Stack Traces**: Never send raw database errors or stack traces to the client in production.

## 8. Logging Standards
- **Backend Logging**: Use a structured logger like Pino or Winston.
- **Masking**: Never log passwords, API keys, JWTs, or PII (Personally Identifiable Information).
- **Client Logging**: `console.log` is strictly banned in production builds.

## 9. Authentication Standards
- **Mechanism**: JWT stored securely in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
- **Passwords**: Hashed via `bcrypt` with a minimum salt rounds of 12.
- **Rate Limiting**: Strict IP-based sliding-window rate limiting on all `/api/auth/*` routes.

## 10. RBAC Standards
- **Granular Permissions**: Authorization must check specific permissions (e.g., `requirePermission('INVOICES:CREATE')`), not hardcoded role strings (`role === 'ADMIN'`).
- **Tenancy Isolation**: Every database query must explicitly filter by `tenantId`.

## 11. Database Migration Standards
- **Immutability**: Never edit a generated migration file (`.sql`). If a mistake is made, rollback and generate a new one.
- **Local Dev**: Use `npx prisma migrate dev`.
- **Production**: Use `npx prisma migrate deploy` in the CI/CD pipeline.

## 12. Git Branch Strategy
We follow a GitFlow-inspired model:
- `main`: Production-ready code only.
- `develop`: Integration branch for the next release.
- `feature/*`: For new features (e.g., `feature/add-lead-scoring`).
- `hotfix/*`: For emergency production fixes.

## 13. Commit Message Convention
Follow Conventional Commits:
- `feat: [Module] Add new component`
- `fix: [Auth] Resolve token expiration bug`
- `chore: Update dependencies`
- `docs: Update API README`

## 14. Pull Request Checklist
- [ ] Zod validation applied to all new inputs.
- [ ] No hardcoded strings (use constants).
- [ ] No `console.log` or dead code.
- [ ] `npm run lint` and `npm run type-check` pass.

## 15. Code Review Checklist
- **Security**: Are we validating tenant isolation? Are inputs sanitized?
- **Performance**: Is there an N+1 query problem? Are we loading too much data into memory?
- **Maintainability**: Is the component too large? Should it be split?

## 16. Testing Standards
- **Unit Testing**: Vitest for utility functions, Zod validators, and complex service logic.
- **Component Testing**: React Testing Library for shared UI components.
- **E2E Testing**: Playwright for critical paths (Login, Checkout, Lead Creation).

## 17. Performance Standards
- **Images**: Always use `next/image` for automatic WebP optimization.
- **Bundle Size**: Lazy load heavy libraries (like `recharts` or `pdfmake`) using `next/dynamic`.
- **Database**: Ensure indexes are added for any column frequently used in `where` or `orderBy` clauses.

## 18. Security Standards
- **Headers**: Implement Helmet or Next.js equivalent for CSP, HSTS, and X-Frame-Options.
- **XSS**: React automatically escapes rendering, but never use `dangerouslySetInnerHTML` unless explicitly sanitized via DOMPurify.
- **CSRF**: Ensure state-changing actions require Anti-CSRF tokens or `SameSite=Strict` cookies.

## 19. Environment Variable Standards
- **Validation**: Validate `process.env` via Zod at server startup (`env.ts`).
- **Documentation**: Keep `.env.example` strictly up to date. Never commit `.env.local` to Git.

## 20. Deployment Standards
- **Pipeline**: CI/CD (GitHub Actions) must run Lint, Typecheck, and Tests before deploying.
- **Zero Downtime**: Database migrations run before the new application instances swap traffic.

## 21. Monitoring & Error Tracking
- **APM**: Datadog or New Relic for backend performance tracking.
- **Error Tracking**: Sentry installed on both Client and Server to track unhandled exceptions.

## 22. Backup & Recovery Strategy
- **Backups**: PostgreSQL Automated Daily Snapshots retained for 30 days.
- **PITR**: Point-In-Time-Recovery (WAL archiving) enabled with a 7-day window.
- **Disaster Recovery**: Automated monthly drill restoring the DB to a staging environment to verify backup integrity.
