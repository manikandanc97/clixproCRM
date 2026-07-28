# Employees (HR) Module: Comprehensive Analysis

This document contains the complete analysis of the CLIXPRO CRM Employees module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview
The Employees module handles basic user management and role assignment for the CRM. It allows Administrators and Managers to onboard new staff, edit their details, deactivate their accounts, or permanently delete them from the tenant workspace.

### Architecture
- **Frontend Container**: `app/(dashboard)/employees/page.tsx`
- **Data Fetching**: Custom hooks `useEmployees()`, `useToggleEmployeeStatus()`, `useDeleteEmployee()` (React Query).
- **UI Components**: 
  - `DataTable` for staff listing with a dropdown menu for quick actions.
  - `EmployeeForm` (Modal) for creation and editing.
  - Sidebars for "Recent Activity" and "Performance Overview".
- **Backend Service**: `CrmService.getEmployees` fetches `User` records through the `TenantUser` relational pivot table.

### 🛑 Identified Missing Features
- **No Invitation Flow**: If an Admin tries to add an email that already exists in the global `User` table (belonging to another workspace), the API throws a `400` error stating "Invitation flow is required". However, the actual email-based invitation flow (and the `Invitation` database model) is completely missing.
- **Lacking HR Data**: The database relies purely on the authentication `User` model (`name`, `email`, `password`). True employee directories require HR fields such as `jobTitle`, `department`, `phoneNumber`, `dateOfBirth`, and `managerId`.
- **Hardcoded Metrics**: The "On Leave" KPI metric is hardcoded to "0". There is no Leave Management or Attendance tracking implemented.
- **Client-Side Filtering Flaw**: The search bar filters the paginated `employees` array in the browser memory, hiding valid staff members that reside on page 2+.

---

## 2. Database Design

### Current State (Prisma Schema)
The system leverages the core auth tables:
- `User`: `id`, `name`, `email`, `password`, `status`
- `TenantUser`: `tenantId`, `userId`, `role` (ADMIN, MANAGER, SALES, EMPLOYEE)

### Production-Ready DB Recommendations
1. **Create `EmployeeProfile` Model** (1-to-1 with `User`):
   - `id` (UUID)
   - `userId` (FK to User)
   - `tenantId` (FK to Tenant)
   - `jobTitle` (VARCHAR)
   - `department` (VARCHAR)
   - `phone` (VARCHAR)
   - `reportsToId` (FK to User - for organizational hierarchy)
2. **Create `TenantInvitation` Model**:
   - `id` (UUID)
   - `email` (VARCHAR)
   - `tenantId` (FK)
   - `role` (Enum)
   - `token` (VARCHAR)
   - `expiresAt` (DateTime)
3. **Soft Deletes for Users**: 
   - Add `deletedAt` to `User`. Never hard-delete a user who has generated financial data (Quotations/Invoices).

---

## 3. API Design

### Current Endpoints
- `GET /api/crm/employees?page=1&limit=10`
- `POST /api/crm/employees` (Creates user instantly, assigns auto-generated password).
- `PUT /api/crm/employees/:id` (Updates user data).
- `PATCH /api/crm/employees/:id` (Toggles ACTIVE/INACTIVE status).
- `DELETE /api/crm/employees/:id` (Removes tenant mapping; deletes User globally if it's their only tenant).

### Production-Ready REST API Enhancements
- **Invitation Endpoints**:
  - `POST /api/crm/employees/invite` (Generates a token and sends an email via SendGrid/Nodemailer).
  - `POST /api/crm/employees/accept-invite` (Allows the user to set their password and join the tenant).
- **Server-Side Filtering**: Refactor `GET` to support `?search=X&department=Y` for global database queries.

---

## 4. UX Design

### Layout & Interactions
- **Action-Oriented Table**: Uses a standard table layout but features a powerful `DropdownMenu` on the right side for every row, containing inline actions: "View Details", "Edit", "Deactivate", and "Delete".
- **Visual Feedback**: The `status` field uses color-coded badges (Green for ACTIVE, Yellow/Orange for INACTIVE) making it easy to scan the workforce.
- **Safety Measures**: The "Delete Employee" action triggers a red `AlertDialog` overlay, forcing the user to confirm the permanent, destructive action.

### States
- **Loading**: Utilizes `PageLoadingState` ("Loading employee records...").
- **View Modal**: Clicking "View Details" opens a read-only layout of the employee's core data without the risk of accidental edits.

---

## 5. Security Audit

### 5.1 Hard Deletion Data Corruption Risk
- **Vulnerability**: The `DELETE` endpoint physically deletes the `User` row if they have no other memberships. In a fully built CRM (with Leads, Tasks, and Deals assigned to users), a hard deletion will trigger cascading deletes (or throw `Foreign Key Constraint` crashes), potentially wiping out millions in historical revenue data tied to that salesperson.
- **Remediation**: Remove `tx.user.delete`. Implement a strict Soft Delete policy (`status = "ARCHIVED"`) to preserve historical referential integrity.

### 5.2 Privilege Escalation (Partially Mitigated)
- **Status**: The API correctly checks `if (role === "ADMIN" && session.role !== "ADMIN")` to prevent Managers from elevating themselves to Admins.
- **Vulnerability**: A Manager *can* edit the email or password of an Admin using the `PUT /api/crm/employees/:id` endpoint, because the endpoint does not check if the *target* user has a higher privilege than the *acting* user.
- **Remediation**: Add a check in `PUT` and `DELETE` endpoints: If the target user is an `ADMIN`, only an `ADMIN` can modify them.

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Create `EmployeeProfile` and `TenantInvitation` Prisma models.
- [ ] Implement Nodemailer email dispatch for the new `/invite` endpoint.
- [ ] Refactor `DELETE` endpoint to perform Soft Deletes (archiving) instead of hard DB deletions.
- [ ] Implement privilege boundary checks in `PUT`/`DELETE` (Managers cannot edit Admins).
- [ ] Refactor `GET` endpoint to filter searches at the database level.

### Frontend
- [ ] Remove `useMemo` client-side filtering; map UI search state to URL params.
- [ ] Update `EmployeeForm` to support the new `EmployeeProfile` fields (Title, Phone, Department).
- [ ] Build the public-facing "Accept Invitation" screen (`/invite/[token]`).
- [ ] Wire the "On Leave" metric to an actual backend attendance calculation (or remove it if out of scope).

---

## 7. QA Test Cases

### Functional Cases
- **TC-EMP-01**: Submit the `EmployeeForm` to invite a new user. Verify the API returns a success message and an invitation email is dispatched.
- **TC-EMP-02**: Select an Active employee and click "Deactivate". Verify the status badge turns yellow and their API token (if applicable) is immediately invalidated.
- **TC-EMP-03**: Enter a search string for a user known to be on Page 2. Verify the backend successfully returns that user.

### Security Cases
- **TC-EMP-SEC-01**: Log in as a `MANAGER`. Attempt to send a `PUT` request to change the password of an `ADMIN`. Verify the API returns a `403 Forbidden`.
- **TC-EMP-SEC-02**: Attempt to create a user and assign them the `ADMIN` role while authenticated as a `MANAGER`. Verify the API rejects the request.

### Edge & Regression Cases
- **TC-EMP-EDGE-01**: Delete an employee who has 50 leads assigned to them. Verify the employee is archived, and the 50 leads are not deleted, but instead show "Unassigned" or "Archived User".
- **TC-EMP-REG-01**: Rapidly toggle the "Activate/Deactivate" button 5 times. Verify the UI handles the race condition smoothly without crashing.
