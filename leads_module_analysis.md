# Leads Module: Comprehensive Analysis

This document contains the complete analysis of the CLIXPRO CRM Leads module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview
The Leads module handles the creation, viewing, updating, and filtering of potential customers (Leads). It supports multiple visualization modes (List/Grid) and calculates top-level metrics dynamically.

### Architecture
- **Frontend Container**: `app/(dashboard)/leads/page.tsx`
- **Data Fetching**: Custom hook `useLeads()` which wraps React Query. The fetched data is also synced into a global Zustand store (`useCRMStore`) for cross-module access.
- **UI Components**: `LeadsTable` (List view), `CRMCard` (Grid view), `LeadForm` (Create/Edit modal).
- **Backend Service**: `CrmService` provides modular CRUD operations (`getLeads`, `createLead`, `updateLead`, `deleteLead`), mapping database enums to formatted UI labels.

### 🛑 Identified Missing Features
- **Lead Assignment**: Leads are currently owned by the `Tenant` globally. There is no `assignedTo` field to attribute a lead to a specific sales agent.
- **Activity/Notes Log**: Missing an interaction timeline (e.g., tracking calls, emails, or internal notes for a specific lead).
- **Mocked Actions**: The "Export" button triggers a toast notification but does not generate or download a real CSV/PDF file.
- **Bulk Actions**: No ability to select multiple leads to delete or update statuses simultaneously.
- **Data Completeness**: The Lead model lacks a `phone` number and a `source` (e.g., Organic, Paid, Referral) field.

---

## 2. Database Design

### Current State (Prisma Schema)
The `Lead` model relies on `id`, `tenantId`, `name`, `company`, `email`, `status` (Enum), `value`, and `followUpAt`. 

### Production-Ready DB Recommendations
To support an enterprise sales team, the schema must be normalized and expanded:
1. **Extend `Lead` Model**:
   - Add `assignedToId` (FK to `User.id`).
   - Add `phone` (VARCHAR).
   - Add `source` (VARCHAR / Enum: "WEBSITE", "REFERRAL", "COLD_CALL").
2. **Create `LeadActivity` Table**:
   - Fields: `id`, `leadId` (FK), `userId` (FK - who did the action), `type` (CALL, EMAIL, NOTE, STATUS_CHANGE), `content` (TEXT), `createdAt`.
   - Used to generate an interaction timeline.
3. **Indexes**:
   - Current index: `@@index([tenantId, status])` is good.
   - Missing: `@@index([tenantId, assignedToId])` for fast filtering by agent.

---

## 3. API Design

### Current Endpoints Used
- `GET /api/crm/leads?page=1&limit=10`
- `POST /api/crm/leads`
- `PATCH /api/crm/leads/:id`
- `DELETE /api/crm/leads/:id`

### Production-Ready REST API Enhancements
- **Filtering Options**: `GET /api/crm/leads` should natively support `?search=X&status=NEW&assignedTo=uuid` rather than fetching all and filtering purely on the client side (which fails at scale).
- **Bulk Operations**: 
  - `PATCH /api/crm/leads/bulk` (Body: `{ "ids": [...], "status": "CONTACTED" }`)
  - `DELETE /api/crm/leads/bulk`
- **Activities**:
  - `GET /api/crm/leads/:id/activities`
  - `POST /api/crm/leads/:id/activities`

---

## 4. UX Design

### Layout & Interactions
- **View Toggles**: Supports seamless switching between a dense `LeadsTable` (List) and visual `CRMCard` (Grid) using Framer Motion (`AnimatePresence`) for smooth opacity/scale transitions.
- **Metric Cards**: The top of the page features dynamic KPI cards (Total Leads, New This Month, Conversion Rate) giving instant context.
- **Form Modals**: Creating a lead does not redirect to a new page; it uses a `FormModal` overlay, keeping the user in context.

### States
- **Loading**: Utilizes `PageLoadingState` during initial fetch.
- **Empty**: A beautifully crafted empty state (`SearchX` icon) appears when filters yield no results, offering a 1-click "Reset All Filters" button.
- **Error**: `PageErrorState` component handles API failures with a manual retry option.

### Accessibility
- Use of semantic HTML and standard Lucide icons with sufficient contrast. Grid cards require proper `aria-label`s for the "Quick Edit" and "Profile" buttons to ensure screen readers understand which lead is being acted upon.

---

## 5. Security Audit

### 5.1 Broken Access Control (IDOR) - Agent Level
- **Vulnerability**: The API endpoints correctly check `requireRole(["ADMIN", "MANAGER", "SALES"])` and scope DB queries by `session.tenantId`. However, because Lead assignment doesn't exist, *any* Sales agent can edit or delete *any* lead within the company. 
- **Remediation**: Once `assignedToId` is added, enforce that users with the `SALES` role can only `PATCH/DELETE` leads where `assignedToId == session.userId`, whereas `ADMIN/MANAGER` can modify any.

### 5.2 Server-Side Pagination vs Client-Side Filtering
- **Vulnerability**: The UI fetches paginated data, but implements the search (`searchQuery`) and status filtering (`statusFilter`) on the frontend using `useMemo`. If a user is on page 1 of 100, the client-side search will *only* search the 10 leads currently loaded in memory.
- **Remediation**: Move `search` and `status` filter parameters to the API request so the database performs the filtering globally across the entire dataset.

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Add `phone`, `source`, and `assignedToId` to `Lead` Prisma model.
- [ ] Create `LeadActivity` Prisma model.
- [ ] Run Prisma migration.
- [ ] Update `CrmService.getLeads` to accept `search`, `status`, and `assignedTo` query arguments.
- [ ] Update `POST/PATCH /api/crm/leads` to validate and save new schema fields.
- [ ] Implement `requireAssignedOwnership` logic in `PATCH/DELETE` for the `SALES` role.

### Frontend
- [ ] Move frontend search/filter state to URL Search Params.
- [ ] Update `useLeads` hook to pass search/filter params to the backend.
- [ ] Add `Assigned To`, `Phone`, and `Source` fields to `LeadForm`.
- [ ] Add `Avatar` for assigned agent in the `LeadsTable` and Grid cards.
- [ ] Implement actual CSV export logic (e.g., using `papaparse`).
- [ ] Add bulk selection checkboxes to `LeadsTable`.

---

## 7. QA Test Cases

### Functional Cases
- **TC-LD-01**: Submit `LeadForm` with valid data. Verify the lead immediately appears in the list without a hard page reload.
- **TC-LD-02**: Toggle between List and Grid views. Verify the selected view persists or renders correctly.
- **TC-LD-03**: Enter text in the Search bar. Verify the list filters accurately (Backend-side search preferred).

### Security & RBAC Cases
- **TC-LD-SEC-01**: Log in as `EMPLOYEE` role. Attempt to call `POST /api/crm/leads` directly via cURL. Verify `403 Forbidden` response.
- **TC-LD-SEC-02**: Ensure a `SALES` agent cannot edit a lead explicitly assigned to a different `SALES` agent (Post-implementation of assignment feature).

### Edge & Regression Cases
- **TC-LD-EDGE-01**: Input extreme monetary values (e.g., 9999999999) into the Lead Value field. Verify DB Decimal bounds handle it without crashing.
- **TC-LD-REG-01**: Click a Lead Profile. Go back. Ensure the previously selected filters (e.g., Status: "Won") remain active.
