# Authentication Module Development Checklist

## Database & Prisma Schema
- [ ] Update `users` table to add `email_verified_at`
- [ ] Update `users` table to add `failed_login_attempts`
- [ ] Update `users` table to add `locked_until`
- [ ] Update `users` table to add `two_factor_enabled`
- [ ] Update `users` table to add `two_factor_secret`
- [ ] Create `sessions` table (device, ip, token_hash, expires_at)
- [ ] Create `oauth_accounts` table (provider, provider_account_id, access_token)
- [ ] Create `auth_audit_logs` table (event_type, ip_address, user_agent)
- [ ] Add `UNIQUE` index to `users.email`
- [ ] Add `UNIQUE` index to `tenants.slug`
- [ ] Add index to `sessions.user_id` and `sessions.expires_at`
- [ ] Add index to `auth_audit_logs.user_id` and `auth_audit_logs.ip_address`
- [ ] Generate Prisma Client
- [ ] Create and run initial database migration

## Shared Utilities & Validators
- [ ] Create Zod schema for `RegisterRequest` (with strong password policy)
- [ ] Create Zod schema for `LoginRequest`
- [ ] Create Zod schema for `ForgotPasswordRequest`
- [ ] Create Zod schema for `ResetPasswordRequest`
- [ ] Implement password strength validation utility (Regex)
- [ ] Implement IP and User-Agent extraction utility

## API Endpoints (Backend)
- [ ] Create `POST /api/auth/register` API
- [ ] Implement email uniqueness check in Register API
- [ ] Implement Tenant and TenantUser creation in Register API
- [ ] Create `POST /api/auth/login` API
- [ ] Implement bcrypt password comparison in Login API
- [ ] Implement failed attempt counting and account lock logic in Login API
- [ ] Implement session record creation in DB upon successful login
- [ ] Issue secure HttpOnly JWT cookie in Login API
- [ ] Create `GET /api/auth/me` API
- [ ] Compute and return user role and permissions in Me API
- [ ] Create `POST /api/auth/logout` API
- [ ] Implement DB session revocation in Logout API
- [ ] Create `POST /api/auth/forgot-password` API
- [ ] Implement reset token generation and saving to DB
- [ ] Create `POST /api/auth/reset-password` API
- [ ] Implement token validation and password hashing in Reset Password API
- [ ] Create `POST /api/auth/verify-email` API
- [ ] Create `GET /api/auth/sessions` API
- [ ] Create `DELETE /api/auth/sessions/:id` API
- [ ] Implement "Revoke All Other Sessions" logic

## Security, Middleware & Rate Limiting
- [ ] Implement global IP rate limiting middleware
- [ ] Implement strict route-specific rate limits (e.g., 5 attempts/15 mins for login)
- [ ] Update `middleware.ts` to validate JWT signature
- [ ] Update `middleware.ts` to check token against DB `sessions` table (blacklist/whitelist)
- [ ] Append `x-user-id`, `x-tenant-id`, `x-role` headers in middleware
- [ ] Configure `Strict-Transport-Security` in `next.config.ts`
- [ ] Configure `X-Frame-Options` and `X-Content-Type-Options` in `next.config.ts`
- [ ] Implement Anti-CSRF token generation for state-changing endpoints
- [ ] Add audit logging function `logAuthEvent()`
- [ ] Insert `logAuthEvent("LOGIN_SUCCESS")` in Login API
- [ ] Insert `logAuthEvent("LOGIN_FAILED")` in Login API
- [ ] Insert `logAuthEvent("PASSWORD_RESET")` in Reset Password API

## Frontend UI Components
- [ ] Create `AuthLayout` wrapper component (Split-screen desktop view)
- [ ] Create accessible Text Input component
- [ ] Create accessible Password Input component with Eye toggle
- [ ] Create accessible Primary Submit Button with loading state

## Frontend Pages & Integration
- [ ] Build `/login` page UI
- [ ] Integrate `/login` form with API and error toast notifications
- [ ] Build `/register` page UI
- [ ] Integrate password strength indicator on `/register`
- [ ] Integrate `/register` form with API
- [ ] Build `/forgot-password` page UI (Centered card)
- [ ] Integrate `/forgot-password` with API
- [ ] Build `/reset-password` page UI
- [ ] Implement URL token extraction on `/reset-password`
- [ ] Integrate `/reset-password` with API
- [ ] Build `/unauthorized` fallback page
- [ ] Build UI for "Active Sessions" in user settings dashboard
- [ ] Build "Revoke Session" button in user settings

## Email & Notifications
- [ ] Integrate Email Provider SDK (e.g., Resend, SendGrid)
- [ ] Create "Welcome & Verify Email" HTML template
- [ ] Create "Password Reset" HTML template
- [ ] Create "New Login Detected" HTML template
- [ ] Trigger Verify Email sending on Registration
- [ ] Trigger Reset Email sending on Forgot Password

## Testing
- [ ] Write unit tests for password strength validator
- [ ] Write integration tests for `/api/auth/login` (Success & Failure paths)
- [ ] Write integration tests for account lockout logic
- [ ] Write integration tests for JWT issuance and middleware validation
- [ ] Conduct manual QA across Mobile, Tablet, and Desktop breakpoints
- [ ] Run accessibility (a11y) audit via Lighthouse/Axe on all auth pages
