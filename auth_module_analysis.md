# Authentication Module Implementation Document

## 1. Complete User Flow
1. **Registration**: User signs up with name, email, and password. A new Workspace (Tenant), User, and TenantUser (Role: `ADMIN`) are created.
2. **Login**: User enters email and password. System verifies credentials and status (`ACTIVE`). If successful, a JWT `orbit_token` is set in cookies.
3. **Session Check**: Middleware intercepts requests, validates JWT, and appends `x-user-id`, `x-tenant-id`, and `x-role` headers.
4. **Dashboard Access**: Frontend fetches `/api/auth/me` to get the user context, roles, and static permissions to build the UI navigation and access control.
5. **Password Recovery**: User requests password reset via email -> receives token -> submits new password with the token.
6. **Logout**: User clicks logout -> `/api/auth/logout` clears the `orbit_token` cookie -> User is redirected to `/login`.

## 2. Screen Flow
- `/login` -> Success -> `/` (Dashboard)
- `/login` -> Forgot Password -> `/forgot-password`
- `/login` -> Create Account -> `/register`
- `/register` -> Success -> Auto-login or redirect to `/login`
- `/forgot-password` -> Check Email -> `/reset-password?token=...`
- `/reset-password` -> Success -> `/login`
- Protected Route (No token) -> `/login?redirect={path}`
- Protected Route (Invalid Role) -> `/unauthorized`

## 3. Every Page
- **`/login`**: The main entry point for registered users.
- **`/register`**: Sign up page for new users/tenants.
- **`/forgot-password`**: Initiate password recovery.
- **`/reset-password`**: Finalize password recovery using a token.
- **`/unauthorized`**: Access denied page for insufficient permissions.

## 4. Every Button
- **Login Page**:
  - `Sign In` (Submit credentials)
  - `Forgot Password?` (Link to recovery)
  - `Create Account` (Link to registration)
  - Eye/EyeOff Icon Button (Toggle password visibility)
- **Register Page**:
  - `Create Account` (Submit registration)
  - `Sign In` (Link to login)
- **Forgot Password Page**:
  - `Send Reset Link` (Submit email)
  - `Back to Login` (Link)
- **Reset Password Page**:
  - `Reset Password` (Submit new password)

## 5. Every Dialog
*Currently, no dialogs (modals) are used in the core auth flow. All interactions happen on dedicated pages.*

## 6. Every API
- **`POST /api/auth/login`**:
  - Body: `{ email, password }`
  - Action: Validates credentials, checks rate limits, issues JWT cookie (`orbit_token`).
- **`POST /api/auth/register`**:
  - Body: `{ name, email, password }`
  - Action: Creates Tenant, User, TenantUser. Applies IP-based rate limiting.
- **`POST /api/auth/logout`**:
  - Action: Deletes `orbit_token` cookie.
- **`GET /api/auth/me`**:
  - Action: Retrieves user info, tenant info, and computes permissions based on middleware headers.
- **`POST /api/auth/forgot-password`**:
  - Body: `{ email }`
  - Action: Generates a reset token, updates DB, sends email (assuming integration exists).
- **`POST /api/auth/reset-password`**:
  - Body: `{ token, newPassword }`
  - Action: Validates token, hashes new password, updates DB.

## 7. Database Tables (Prisma Schema)
- **`User`**: 
  - Fields: `id`, `name`, `email` (unique), `password`, `status` (`ACTIVE`, `INACTIVE`, `SUSPENDED`), `resetToken`, `resetTokenExpiry`, `createdAt`, `updatedAt`.
- **`Tenant`**:
  - Fields: `id`, `name`, `slug` (unique), `plan`, `createdAt`, `updatedAt`.
- **`TenantUser`**:
  - Fields: `id`, `tenantId`, `userId`, `role` (`ADMIN`, `MANAGER`, `SALES`, `EMPLOYEE`), `createdAt`, `updatedAt`.

## 8. Permissions (RBAC)
Roles available: `ADMIN`, `MANAGER`, `SALES`, `EMPLOYEE`, `SUPPORT`.
Permissions are mapped statically in `shared/lib/auth/rbac/permissions.ts`.
- **ADMIN**: Access to all `PERMISSIONS`.
- **MANAGER**: Full CRUD on Leads, Customers, Pipeline, Tasks, Quotations, Reports.
- **SALES**: Create/Read/Update assigned Leads/Tasks/Quotations. Full Customers CRUD.
- **EMPLOYEE**: View Dashboard, Read/Update assigned Tasks.

## 9. Validation
- **Zod Schemas**: Used for API body validation (`loginSchema`, `registerSchema`).
- **Frontend**: Required HTML attributes, basic email formatting.
- **Backend**: 
  - Email uniqueness check during registration.
  - Rate limiting validation (15 mins/5 requests for login, 1 hr/5 requests for register).
  - JWT signature and expiration verification in middleware.

## 10. Notifications
- **Toast Notifications**: Used extensively in UI (e.g., `toast.success("Login successful")`, `toast.error("Invalid credentials")`) via `sonner`.
- **Email Notifications**: Necessary for forgot password flow (assumed implemented via external provider like Resend/SendGrid in the forgot-password route).

## 11. Audit Logs
**Current Status**: MISSING.
There is no dedicated `AuditLog` table capturing login attempts, IP addresses, success/failure status, or password resets. Rate limiting tracks IP in memory/Redis but does not persist to an audit trail.

## 12. Edge Cases
- **Simultaneous Logins**: JWT is stateless; a user can log in from multiple devices without invalidating previous tokens.
- **Suspended Users**: API handles `user.status !== "ACTIVE"` returning a 403.
- **Expired JWT**: Middleware catches expired tokens, deletes the cookie, and redirects to `/login`.
- **Deleted Tenant**: If a tenant is deleted, the `TenantUser` relation cascades, but the JWT might still be valid until expiry unless `auth/me` explicitly fails.

## 13. Error Cases
- **401 Unauthorized**: Invalid credentials, missing token, expired token.
- **403 Forbidden**: Account inactive or suspended.
- **400 Bad Request**: Validation failure (Zod), Email already registered.
- **429 Too Many Requests**: Rate limit exceeded (triggers Retry-After header).
- **500 Internal Server Error**: Database down, JWT signing failure.

## 14. Loading States
- **Login/Register Button**: Displays spinner/text change (e.g., "Signing In...") and disables the button (`disabled={loading}`).
- **Page Load**: `auth-loading-screen.tsx` is likely used when fetching `/api/auth/me` to hydrate the auth context in `auth-provider.tsx`.

## 15. Empty States
*Not highly applicable to auth forms, but if a user has no memberships (edge case), `/api/auth/me` defaults role to `EMPLOYEE` and might lack a `tenantId`.*

## 16. Success States
- **Login**: Toast notification, automatic redirect to Dashboard (`/`).
- **Register**: Toast notification, auto-login or redirect.
- **Logout**: Immediate redirection to `/login`.

## 17. Session Flow
- **Type**: Stateless JWT stored in `HttpOnly`, `Lax`, `Secure` cookie (`orbit_token`).
- **Duration**: 7 days (`expiresIn: "7d"`).
- **Middleware**: Intercepts on every page load, parses JWT, injects headers.
- **Client Provider**: `AuthProvider` fetches `/api/auth/me` on mount to store user state in React Context.

## 18. License Validation Flow
**Current Status**: MINIMAL/MISSING.
- `Tenant` model has a `plan` field (defaults to `"free"`, set to `"premium"` on registration).
- There is no active middleware or API-level enforcement checking if a tenant's license is expired, suspended, or over quota. It currently operates on trust or lacks the implementation.

---

## 🛑 Identified Missing Features & Improvements

1. **Email Verification**: No `emailVerified` timestamp on the `User` model. Users can register and access the system without confirming their email.
2. **Session Management (DB-backed)**: Cannot remotely log out users or see active devices because sessions are strictly JWT-based. A `Session` table mapping to the user would solve this.
3. **Audit Logging**: Missing an `AuditLog` table to track auth events (who logged in, when, from what IP).
4. **MFA / 2FA**: No multi-factor authentication implementation.
5. **Social Auth (OAuth)**: No Google, GitHub, or Microsoft login options.
6. **Account Lockout**: Rate limiting exists, but a persistent account lock (`failedLoginAttempts` + `lockedUntil` on `User` model) is missing for security compliance.
7. **License Enforcer**: No overarching guard protecting premium routes/features based on the `Tenant.plan` status.
