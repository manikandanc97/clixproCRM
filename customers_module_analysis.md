# Customers Module: Comprehensive Analysis

This document contains the complete analysis of the CLIXPRO CRM Customers module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview
The Customers module acts as the core Relationship Intelligence engine, allowing teams to track client health, segment VIPs (Premium), and monitor aggregate monthly revenue. 

### Architecture
- **Frontend Container**: `app/(dashboard)/customers/page.tsx`
- **Data Fetching**: Custom hook `useCustomers()` wraps React Query. State is mirrored to Zustand `useCRMStore` for global access.
- **UI Components**: 
  - `CustomersTable` (Dense data table view).
  - `CustomerForm` (Reusable Create/Edit modal).
  - `PageHeader`, `CRMMetricCard`, and `CRMToolbar` (Shared UI architecture).
- **Backend Service**: `CrmService.getCustomers` handles paginated queries mapped to the active `tenantId`.

### 🛑 Identified Missing Features
- **Client-Side Filtering Flaw**: The search string, status, and segment filters are applied using `useMemo` on the frontend. Because the API returns paginated chunks (e.g., limit 10), searching "Acme Corp" will only search the 10 customers currently loaded in memory, hiding valid results on page 2+.
- **Missing Address & Billing Info**: The Customer model relies purely on name, company, and email. Standard CRM features like physical address, VAT number, or billing contacts are missing.
- **Unused Segmentation UI**: The frontend defines a `segmentFilter` state but lacks the UI components (dropdowns/tags) to utilize it.
- **Account Ownership**: Customers are owned by the entire Tenant. There is no `accountManagerId` to assign specific sales representatives to specific accounts.
- **Mocked Export**: The Export functionality only triggers a UI Toast.

---

## 2. Database Design

### Current State (Prisma Schema)
The `Customer` model tracks `id`, `tenantId`, `name`, `company`, `email`, `status` (PREMIUM, ACTIVE, INACTIVE), `revenue`, and `lastContactAt`.

### Production-Ready DB Recommendations
1. **Extend `Customer` Model**:
   - `accountManagerId` (FK to `User.id`) to track ownership.
   - `phone` (VARCHAR).
   - `billingAddress`, `shippingAddress`, `taxId` (JSON or separate related table).
   - `segment` (VARCHAR) to support the frontend's intended segment filtering.
2. **Create `CustomerInteraction` Table**:
   - To track meeting notes, emails, and support tickets directly linked to the customer.
3. **Indexes**:
   - Add `INDEX idx_customer_tenant_manager ON "Customer" (tenantId, accountManagerId)` for fast agent-specific dashboard lookups.

---

## 3. API Design

### Current Endpoints
- `GET /api/crm/customers?page=1&limit=10`
- `POST /api/crm/customers`
- `PATCH /api/crm/customers/:id`
- `DELETE /api/crm/customers/:id`

### Production-Ready REST API Enhancements
- **Server-Side Filtering**: Refactor `GET` endpoint to accept `?search=X&status=PREMIUM&segment=Enterprise`.
- **Bulk Exports**: Add `GET /api/crm/customers/export` which streams a CSV file to the client instead of mocking the frontend button.
- **Account Transfer**: Add `PATCH /api/crm/customers/transfer` to bulk reassign a departed agent's accounts to a new agent.

---

## 4. UX Design

### Layout & Interactions
- **Table-First Design**: Unlike Leads which has a Grid toggle, Customers relies exclusively on a data-dense table, which is appropriate for account management where sorting by revenue or last contact date is critical.
- **KPI Metrics**: Top cards display Total Customers, VIP Clients (Status: PREMIUM), and Monthly Revenue (calculated dynamically on the client side).
- **Edit Context**: Clicking "Edit" reuses the `CustomerForm` in a modal rather than navigating away, preserving context.

### States
- **Loading**: Utilizes `PageLoadingState` ("Initializing relationship intelligence engine...").
- **Empty**: `EmptyState` component prompts users to clear filters if a search yields zero results.
- **Error**: `PageErrorState` allows manual query refetching.

### Accessibility
- **Form Focus**: The `CustomerForm` modal should trap focus within the modal while open to prevent screen readers from navigating the background page.

---

## 5. Security Audit

### 5.1 Broken Access Control (Cross-User Editing)
- **Vulnerability**: Similar to the Leads module, API endpoints check `requireRole(["ADMIN", "MANAGER", "SALES"])`. Because there is no Account Manager assignment, any junior Sales agent can edit or delete the company's biggest VIP clients.
- **Remediation**: Implement `accountManagerId`. Restrict `SALES` role to only edit their assigned accounts, while `MANAGER` and `ADMIN` retain global tenant access.

### 5.2 Decimal Precision Overflows
- **Vulnerability**: The `revenue` field uses `Decimal(12, 2)`. If the frontend doesn't strictly validate the monetary input, passing astronomically high numbers could cause DB insertion errors resulting in unhandled 500 crashes.
- **Remediation**: Add `.max(9999999999.99)` to the Zod schema validation in `customerSchema`.

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Add `accountManagerId`, `phone`, `segment`, and address fields to Prisma schema.
- [ ] Run Prisma migration.
- [ ] Refactor `GET /api/crm/customers` to support database-level search and filtering query params.
- [ ] Implement `requireAssignedOwnership` validation in `PATCH` and `DELETE` endpoints.
- [ ] Implement robust CSV Export endpoint utilizing `json2csv` or similar libraries.

### Frontend
- [ ] Remove `useMemo` client-side filtering; map UI states to URL Search Params for backend querying.
- [ ] Implement Segment Filter dropdown in `CRMToolbar`.
- [ ] Update `CustomerForm` to include new fields (Phone, Address, Account Manager).
- [ ] Connect the "Export" button to the real CSV generation endpoint.
- [ ] Ensure "Monthly Revenue" metric calculates server-side to account for all pages, not just the currently loaded page.

---

## 7. QA Test Cases

### Functional Cases
- **TC-CU-01**: Create a new Premium customer. Verify the "VIP Clients" metric increments correctly.
- **TC-CU-02**: Select a customer and click "Edit". Ensure the `CustomerForm` pre-fills with existing data accurately.
- **TC-CU-03**: Enter a search query. Verify a network request is made and the backend filters the entire dataset, not just the first 10 rows.

### Security Cases
- **TC-CU-SEC-01**: Log in as `EMPLOYEE` (restricted role). Attempt to access `/api/crm/customers` directly via API. Verify `403 Forbidden`.
- **TC-CU-SEC-02**: Pass a revenue value of `9999999999999.99` in the POST request. Verify graceful `400 Bad Request` validation failure rather than `500 Server Error`.

### Edge & Regression Cases
- **TC-CU-EDGE-01**: Change a customer status from PREMIUM to ACTIVE. Verify the "VIP Clients" metric decrements immediately without requiring a hard refresh.
- **TC-CU-REG-01**: Trigger the `?new=true` URL parameter. Verify the `CustomerForm` modal auto-opens on page load.
