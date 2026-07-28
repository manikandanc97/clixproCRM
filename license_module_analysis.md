# License Module: Comprehensive Analysis

This document contains the complete analysis and blueprint for the CLIXPRO CRM License module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview & Current Status
**🚨 CRITICAL FINDING:** The License (Subscription/Billing) module is currently **completely missing** as an active enforcement system. While the UI has a "Billing Settings" tab displaying a mock "Pro Plan" and "License Key: CLIX-PRO-1234-5678", there is no actual database tracking, Stripe integration, or middleware enforcement of seat limits or feature access.

### Proposed Architecture
To build a SaaS-ready licensing module, the following architecture is required:
- **Middleware Enforcement**: The Next.js `middleware.ts` must validate the active `TenantLicense` before allowing access to premium routes (like Advanced Analytics).
- **Payment Gateway Integration**: Integration with Stripe Billing (or similar) to handle recurring subscriptions, plan upgrades, and seat-based pricing.
- **Backend Service**: `LicenseService` to track seat allocation (e.g., ensuring a tenant with a 5-seat license cannot create a 6th employee).

---

## 2. Database Design

### Proposed State (Prisma Schema)
A robust licensing system requires a dedicated schema to prevent unauthorized access:

1. **`TenantLicense` Model**:
   - `id` (UUID), `tenantId` (FK, Unique)
   - `planType` (Enum: FREE, BASIC, PRO, ENTERPRISE)
   - `licenseKey` (VARCHAR, Indexed - for on-prem or decoupled validation)
   - `status` (Enum: ACTIVE, EXPIRED, CANCELED, PAST_DUE)
   - `maxSeats` (Integer)
   - `usedSeats` (Integer)
   - `validUntil` (DateTime)
   - `stripeSubscriptionId` (VARCHAR, Optional)
   - `stripeCustomerId` (VARCHAR, Optional)
2. **`LicenseEvent` Model** (Audit Log):
   - `id` (UUID), `tenantId` (FK)
   - `eventType` (Enum: UPGRADE, DOWNGRADE, RENEWAL, PAYMENT_FAILED)
   - `timestamp` (DateTime)
3. **`TenantUser` (Existing Model Modification)**:
   - Add a trigger or strict application logic to increment/decrement `usedSeats` when a `TenantUser` is added or removed.

---

## 3. API Design

### Proposed REST API Endpoints
To support the frontend and payment integrations:

- **Client Endpoints**:
  - `GET /api/crm/license` (Returns current license status, usage limits, and active modules).
  - `POST /api/crm/license/upgrade` (Generates a Stripe Checkout Session URL).
  - `POST /api/crm/license/customer-portal` (Generates a Stripe Billing Portal URL for users to manage cards/invoices).
- **Webhooks**:
  - `POST /api/crm/webhooks/stripe/billing` (Listens for `invoice.payment_succeeded`, `invoice.payment_failed`, and `customer.subscription.deleted` to automatically sync the `TenantLicense.status` in the database).

---

## 4. UX Design

### Layout & Interactions (Proposed)
- **Settings Integration**: Rather than a standalone dashboard page, licensing should remain within `app/(dashboard)/settings?section=billing`.
- **Seat Visualization**: A progress bar showing "Seats Used: 5 / 10". If the bar reaches 100%, it turns red, and the "Add Employee" button across the CRM becomes disabled with a tooltip ("License Limit Reached").
- **Feature Paywalls**: If a user on a Basic plan clicks on the Reports module, they should be greeted with a polished "Upgrade to Pro" empty-state screen outlining the benefits of Advanced Analytics, rather than a generic `403 Forbidden`.
- **Checkout Wizard**: A smooth slide-out modal for selecting plan tiers and toggling annual vs. monthly billing before redirecting to Stripe.

---

## 5. Security Audit

### Pre-Emptive Threat Modeling
License modules are frequent targets for circumvention.

### 5.1 Seat Allocation Race Condition
- **Threat**: A tenant has a 5-seat license and currently uses 4. An Admin fires two simultaneous `POST /api/crm/employees` requests. If the API checks `usedSeats < maxSeats` asynchronously, both requests might pass, resulting in 6 active employees on a 5-seat license.
- **Remediation**: Use database-level locking (`SELECT ... FOR UPDATE` in Postgres) or a raw SQL transaction when checking and incrementing seat counts to ensure atomic operations.

### 5.2 Client-Side Validation Bypass
- **Threat**: The frontend checks `if (license.plan === 'PRO') { showAnalytics() }`. An attacker modifies the client-side JavaScript to force this check to `true`.
- **Remediation**: Client-side checks are purely for UX. The backend API (`/api/crm/reports`) MUST independently verify `session.tenant.license.plan` before returning data.

### 5.3 Webhook Replay Attacks
- **Threat**: An attacker replays an old `invoice.payment_succeeded` webhook payload to extend their license validity without actually paying.
- **Remediation**: Always verify the Stripe cryptographic signature (`Stripe-Signature` header). Furthermore, verify that the `invoice_id` in the webhook payload has not already been processed (Idempotency check).

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Add `TenantLicense` and `LicenseEvent` models to Prisma schema.
- [ ] Build the Stripe Webhook listener endpoint (`/api/crm/webhooks/stripe/billing`).
- [ ] Implement signature verification and idempotency for the webhook.
- [ ] Update the `POST /api/crm/employees` endpoint to check and atomically increment `usedSeats`.
- [ ] Update all Premium API endpoints (e.g., Reports, AI Insights) to enforce license tier requirements.

### Frontend
- [ ] Refactor the static "Billing Settings" component to fetch live data from `/api/crm/license`.
- [ ] Implement the "Upgrade to Pro" paywall screens on gated modules.
- [ ] Wire the "Upgrade" button to generate a Stripe Checkout session.
- [ ] Implement global state (Zustand) to disable "Creation" buttons (e.g., Add User) when the license limit is reached.

---

## 7. QA Test Cases

### Functional Cases
- **TC-LIC-01**: Reach the maximum seat limit on a tenant. Attempt to add a new employee via the UI. Verify the UI blocks the action. Attempt to bypass via cURL; verify the API returns a `402 Payment Required` or `403 Forbidden`.
- **TC-LIC-02**: Click "Manage Billing". Verify the system correctly redirects the user to the secure Stripe Customer Portal.
- **TC-LIC-03**: Simulate a successful subscription renewal via the Stripe CLI (`stripe trigger invoice.payment_succeeded`). Verify the `validUntil` date in the database extends by one billing cycle automatically.

### Security Cases
- **TC-LIC-SEC-01**: Using cURL, attempt to access the `GET /api/crm/reports` endpoint on a tenant with a `BASIC` (Free) license. Verify the backend correctly blocks the request and does not leak analytics data.
- **TC-LIC-SEC-02**: Send a fake webhook payload to `/api/crm/webhooks/stripe/billing` without a valid `Stripe-Signature` header. Verify the API rejects it with a `401 Unauthorized`.
