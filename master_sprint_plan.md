# CLIXPRO CRM: Master Sprint Plan

This document breaks down the rebuild of CLIXPRO CRM v1.0 into 6 sequential, logical sprints. The strategy strictly prioritizes foundational architecture (Database, Auth, Multi-Tenancy) before moving to operational modules (Leads, Deals) and advanced features (AI, Notifications).

---

## Sprint 1: Identity & Access Management (Foundation)

**Goal**: Establish secure authentication, multi-tenant isolation, and granular RBAC.
**Dependencies**: None.

- **Features**:
  - Secure Registration & Login flows (replacing plaintext passwords).
  - Multi-tenant architecture isolation.
  - Role-Based Access Control (RBAC) permission matrices.
  - Password recovery flow.
- **Database Changes**:
  - Update `User` (hash, lockout flags).
  - Create `Tenant`, `TenantUser`, `Session`, `Role`, `Permission`, `RolePermission`.
- **APIs**:
  - `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`.
  - `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.
- **Frontend**:
  - Wire up `/login`, `/register`, `/forgot-password`.
  - Refactor `role-management` page to actually manage Roles, not Employees.
- **Testing**:
  - Integration tests for authentication lockouts.
  - Unit tests for password validation and JWT generation.
- **Deliverables**: Secure login system with working HttpOnly cookies and multi-tenant routing.

---

## Sprint 2: Workspace & License Configuration

**Goal**: Build the infrastructure to support SaaS billing, user settings, and audit trails.
**Dependencies**: Sprint 1 (Tenant & User schemas).

- **Features**:
  - License tier enforcement (seat limits, feature gating).
  - Stripe recurring billing integration.
  - Tenant preferences (currency, timezone).
  - Security audit logging (login history).
- **Database Changes**:
  - Create `TenantLicense`, `TenantSetting`, `Integration`, `AuthAuditLog`.
- **APIs**:
  - `GET /api/crm/license`, `POST /api/crm/license/upgrade` (Stripe Checkout).
  - Webhook: `POST /api/crm/webhooks/stripe`.
  - `PATCH /api/crm/settings/tenant`, `PATCH /api/crm/settings/user`.
- **Frontend**:
  - Refactor `SettingsPage` to use real API mutations.
  - Build Stripe upgrade paywall modals.
- **Testing**:
  - End-to-End (E2E) testing for Stripe webhook signature verification.
- **Deliverables**: Functional Settings module and active license/seat limit enforcement across the platform.

---

## Sprint 3: Core CRM (Sales Pipeline)

**Goal**: Implement the core operational engine—tracking prospects through a structured sales funnel.
**Dependencies**: Sprint 1 (TenantUsers for assignment logic).

- **Features**:
  - True lead-to-customer conversion workflow.
  - Server-side filtering, sorting, and pagination for large datasets.
  - Entity ownership/assignment tracking.
- **Database Changes**:
  - Create `Lead`, `Account`, `Contact`, `Deal`.
  - Enforce `assignedToId` and `deletedAt` (Soft Deletes).
- **APIs**:
  - Standard CRUD for `Leads`, `Accounts`, `Contacts`, `Deals`.
  - `POST /api/crm/leads/:id/convert` (Workflow endpoint).
- **Frontend**:
  - Refactor list views to use server-side query parameters.
  - Build the Lead Conversion Wizard UI.
- **Testing**:
  - E2E tests for the full Lead -> Account/Deal conversion flow.
- **Deliverables**: A functional sales pipeline where users can accurately track and search for deals assigned to them.

---

## Sprint 4: CPQ & Financials (Quotes & Invoices)

**Goal**: Introduce a product catalog and structured financial document generation.
**Dependencies**: Sprint 3 (Deals & Accounts to link quotes against).

- **Features**:
  - Manage a master product/SKU catalog.
  - Build itemized Quotes and Invoices with calculated tax/discounts.
  - PDF generation for financial documents.
- **Database Changes**:
  - Create `Product`.
  - Create `Quotation`, `QuotationLineItem`.
  - Create `Invoice`, `InvoiceLineItem`.
- **APIs**:
  - Standard CRUD for `Products`, `Quotations`, `Invoices`.
  - `GET /api/crm/quotations/:id/export` (PDF generation).
- **Frontend**:
  - Build a dynamic Line Item editor (Form array) for Quotations.
  - Integrate PDF preview viewer.
- **Testing**:
  - Unit tests for total, subtotal, and discount math algorithms.
- **Deliverables**: Ability to send itemized, accurate PDF quotes to converted Customers.

---

## Sprint 5: Productivity & Collaboration

**Goal**: Replace the repurposed "Task" model with a true omnichannel activity tracking system.
**Dependencies**: Sprint 3 (Entities to attach activities to).

- **Features**:
  - Unified Activity timeline (Calls, Emails, Meetings, Tasks).
  - True Calendar views with `.ics` meeting invites.
  - Internal team notes on Accounts/Deals.
- **Database Changes**:
  - Deprecate old `Task` table.
  - Create polymorphic `Activity` and `Note` tables.
- **APIs**:
  - Standard CRUD for `Activities` and `Notes`.
- **Frontend**:
  - Wire the Calendar module to fetch actual `MEETING` activities.
  - Build a unified "Activity Feed" component for the Deal/Account detail pages.
- **Testing**:
  - Timezone parsing and calendar rendering tests.
- **Deliverables**: Complete history and calendar functionality allowing sales reps to manage their daily schedules.

---

## Sprint 6: Intelligence & Automation (AI, Reports, Alerts)

**Goal**: Activate the advanced analytics, real-time push notifications, and AI integrations.
**Dependencies**: Sprint 3, Sprint 4, Sprint 5 (Requires large datasets to analyze).

- **Features**:
  - Real-time event dispatching (Pusher/Socket.io).
  - Database-level SQL aggregations for dashboard charts.
  - Vercel AI SDK integration for the Chat Assistant.
- **Database Changes**:
  - Create `Notification`, `AiChatSession`, `AiChatMessage`.
- **APIs**:
  - `PATCH /api/crm/notifications/:id/read`.
  - Refactored `GET /api/crm/reports` using `Prisma.groupBy`.
  - `POST /api/crm/ai/chat` (LLM streaming endpoint).
- **Frontend**:
  - Implement dynamic Bell icon unread badges.
  - Replace mock charts with live data.
  - Build the streaming AI Chat drawer.
- **Testing**:
  - Load testing on the SQL aggregation endpoints.
  - Prompt injection security tests on the AI endpoints.
- **Deliverables**: A fully intelligent CRM with real-time alerting and actual data-driven forecasting.
