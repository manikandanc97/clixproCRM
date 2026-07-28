# Settings Module: Comprehensive Analysis

This document contains the complete analysis of the CLIXPRO CRM Settings module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview
The Settings module acts as the central hub for configuring the CRM. The UI presents an extensive array of options—from Profile and Security to Integrations, AI, and Billing. However, beneath the polished frontend, the backend is entirely mocked and read-only.

### Architecture
- **Frontend Container**: `app/(dashboard)/settings/page.tsx`
- **State Management**: Navigates between sub-components (e.g., `SecuritySettings`, `BillingSettings`) using the URL query parameter `?section=`.
- **Backend Service**: `CrmService.ts` contains multiple dedicated methods (`getSecuritySettings`, `getAiSettings`, etc.) that return hardcoded fake data.
- **API Layer**: `app/api/crm/settings/*` endpoints handle GET requests but lack any mutation routes.

### 🛑 Identified Missing Features
- **No Database Persistence**: There are no schema definitions for `TenantSettings`, `UserSettings`, or `Integrations`.
- **No Mutation Endpoints**: There are no `PATCH` or `PUT` endpoints to actually save a user's changes.
- **Fake Security Telemetry**: The "Active Sessions" and "Login History" data returned by `getSecuritySettings` is hardcoded. There is no `Session` or `AuditLog` tracking in the database.
- **Fake 2FA**: The UI shows a 2FA toggle, but no OTP logic (e.g., `speakeasy` or Google Authenticator) is implemented in the Auth module.
- **Fake Integrations**: The "Google Workspace", "Slack", and "Mailchimp" options exist purely in the UI. There is no OAuth bridging or webhook infrastructure implemented to support them.
- **Fake Billing**: The Billing settings hardcode a "Pro Plan" and a fake license key.

---

## 2. Database Design

### Current State
Currently, the Prisma schema only contains the core `Tenant` and `User` models, with no configuration tables attached.

### Production-Ready DB Recommendations
To persist the various settings configurations, the schema must be expanded:
1. **`TenantSettings` Model**:
   - `id` (UUID), `tenantId` (FK - Unique)
   - `currency` (VARCHAR, e.g., 'USD')
   - `timezone` (VARCHAR)
   - `dateFormat` (VARCHAR)
   - `aiCreativityLevel` (Integer)
2. **`UserSettings` Model**:
   - `id` (UUID), `userId` (FK - Unique)
   - `theme` (Enum: LIGHT, DARK, SYSTEM)
   - `emailNotifications` (Boolean)
   - `pushNotifications` (Boolean)
   - `twoFactorEnabled` (Boolean)
   - `twoFactorSecret` (VARCHAR - Encrypted)
3. **`AuditLog` Model (For Security Settings)**:
   - `id` (UUID), `userId` (FK), `tenantId` (FK)
   - `action` (VARCHAR, e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILED')
   - `ipAddress` (VARCHAR)
   - `userAgent` (VARCHAR)
   - `createdAt` (DateTime)
4. **`TenantIntegration` Model**:
   - `id` (UUID), `tenantId` (FK)
   - `provider` (Enum: SLACK, GOOGLE, MAILCHIMP)
   - `accessToken` (VARCHAR - Encrypted)
   - `refreshToken` (VARCHAR - Encrypted)

---

## 3. API Design

### Current Endpoints
- `GET /api/crm/settings/security` (Returns mock data)
- `GET /api/crm/settings/billing` (Returns mock data)
- `GET /api/crm/settings/integrations` (Returns mock data)
- `GET /api/crm/settings/ai` (Returns mock data)
- `GET /api/crm/settings/notifications` (Returns mock data)

### Production-Ready REST API Enhancements
- **Settings Mutations**:
  - `PATCH /api/crm/settings/tenant`
  - `PATCH /api/crm/settings/user`
- **Security & 2FA Flow**:
  - `POST /api/crm/settings/security/2fa/generate` (Returns QR Code URL).
  - `POST /api/crm/settings/security/2fa/verify` (Validates initial OTP and sets `twoFactorEnabled = true`).
  - `POST /api/crm/settings/security/sessions/revoke` (Revokes a specific active session).
- **Integrations (OAuth Flow)**:
  - `GET /api/crm/settings/integrations/:provider/connect` (Redirects to Slack/Google Auth URL).
  - `GET /api/crm/settings/integrations/:provider/callback` (Handles token exchange and saves to DB).

---

## 4. UX Design

### Layout & Interactions
- **Architecture**: The `SettingsPage` uses a classic layout: A left-hand navigation sidebar (`SettingsSidebar`) and a main content area that dynamically loads sub-components (`AnimatePresence` swaps them out smoothly).
- **Navigation**: Uses URL query parameters (`?section=security`) instead of Next.js sub-routes. This is a valid approach for SPAs, but sub-routes (`/settings/security`) are generally preferred in Next.js App Router for better direct-linking and prefetching.
- **Visuals**: The sub-components (like `SecuritySettings` and `BillingSettings`) are well-designed with clear toggle switches, robust tables (for login history), and distinct warning colors for destructive actions.

### States
- **Persistence Feedback**: Currently, clicking "Save Changes" on any tab likely just fires a success toast. Real implementation must include loading spinners on the save buttons (`isSubmitting`) to prevent double-clicks.

---

## 5. Security Audit

### 5.1 Sensitive Token Storage
- **Vulnerability**: When the Integrations module is built, storing OAuth `accessToken` and `refreshToken` in plain text in the database is a massive risk. If the DB is compromised, attackers gain access to customers' Slack workspaces and Google Drives.
- **Remediation**: All integration tokens (and 2FA secrets) must be encrypted at rest using an AES-256-GCM encryption key stored securely in environment variables (e.g., `ENCRYPTION_KEY`).

### 5.2 Lack of Session Revocation
- **Threat**: If a user's laptop is stolen, they currently have no way to log out of all active sessions because the "Active Sessions" panel is fake.
- **Remediation**: Implement a real session-store (e.g., in Redis or Postgres). The Security Settings tab must have a functional "Revoke Session" button that deletes the corresponding session token from the DB.

### 5.3 2FA Bypass in Edge Cases
- **Threat**: When 2FA is implemented, attackers often try to bypass the OTP validation screen by altering the API request or directly hitting the dashboard API endpoints.
- **Remediation**: Ensure the JWT token issued upon initial login contains a claim like `is2faVerified: false`. The dashboard API endpoints (like `GET /api/crm/leads`) must reject requests with this claim, forcing the user to complete the 2FA step to receive a fully validated JWT.

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Create `TenantSettings`, `UserSettings`, and `AuditLog` models in Prisma.
- [ ] Remove mock data from `CrmService.ts`.
- [ ] Build `PATCH` endpoints to save User and Tenant settings to the database.
- [ ] Implement `speakeasy` and `qrcode` libraries to generate and verify 2FA secrets.
- [ ] Implement middleware logic to write to the `AuditLog` table on every successful/failed login attempt.

### Frontend
- [ ] Refactor `SettingsPage` to use Next.js dynamic routing (`app/(dashboard)/settings/[section]/page.tsx`) instead of query parameters.
- [ ] Wire all UI toggle switches (e.g., "Email Notifications") to immediately fire a `PATCH` request rather than requiring a "Save" button.
- [ ] Build the 2FA setup modal, showing the QR code and requesting the first OTP verification.

---

## 7. QA Test Cases

### Functional Cases
- **TC-SET-01**: Navigate to Settings -> Notifications. Toggle "Email Notifications" off. Refresh the page. Verify the toggle remains off (persisted to DB).
- **TC-SET-02**: In Security Settings, click "Enable 2FA". Scan the QR code with an authenticator app, enter the 6-digit code, and submit. Verify the UI updates to show 2FA is active.
- **TC-SET-03**: Log out and log back in from a new browser. Verify the "Login History" table in Security Settings displays the new login event with the correct IP address and timestamp.

### Security & Regression Cases
- **TC-SET-SEC-01**: With 2FA enabled, log in with correct credentials but abort on the OTP screen. Attempt to navigate directly to `/dashboard`. Verify the app redirects you back to the OTP screen or login page.
- **TC-SET-REG-01**: Change the Tenant's "Currency" setting from USD to EUR. Navigate to the Quotations page. Verify the total amount formatting correctly uses the Euro symbol (€).
