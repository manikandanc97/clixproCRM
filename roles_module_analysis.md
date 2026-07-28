# Roles (RBAC) Module: Comprehensive Analysis

This document contains the complete analysis of the CLIXPRO CRM Roles & Permissions module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview
The "Roles" module is intended to manage Access Control (RBAC) across the CRM. However, its current implementation is a façade. The module does not actually manage roles; it manages *Users* using a hardcoded Prisma Enum, and the API returns completely faked data for roles.

### Architecture
- **Frontend Container**: `app/(dashboard)/role-management/page.tsx` (Misnamed, as it actually functions as a secondary User management page).
- **Backend API**: `GET /api/crm/roles` (Returns faked JSON).
- **Backend Service**: `CrmService.getRoles` returns a hardcoded array of two mock roles (`Administrator` and `Manager`) with fake `permissionsCount`.

### 🛑 Identified Missing Features
- **No True RBAC**: Role-Based Access Control is limited to a hardcoded enum (`Role { ADMIN, MANAGER, SALES, EMPLOYEE }`). 
- **No Custom Roles**: Users cannot define custom roles (e.g., "Marketing Intern" or "Support Tier 1").
- **No Granular Permissions**: There is no permission matrix (e.g., `CAN_DELETE_LEAD`, `CAN_EXPORT_QUOTES`). Security relies entirely on coarse-grained checks in the API (`requireRole(["ADMIN"])`).
- **Misleading UI**: The `role-management/page.tsx` does not display a list of Roles. Instead, it makes a fetch call to `/api/users` and renders a list of *Employees*, making it nearly identical to the Employees module.

---

## 2. Database Design

### Current State (Prisma Schema)
Roles are merely an Enum on the `TenantUser` model.
```prisma
enum Role { ADMIN, MANAGER, SALES, EMPLOYEE }
```
There is no `Role` table and no `Permission` table.

### Production-Ready DB Recommendations
To build a scalable, enterprise-grade RBAC system, the following schema must be implemented:
1. **Remove the `Role` Enum**: Change the `role` field on `TenantUser` to a foreign key `roleId`.
2. **Create `Role` Model**:
   - `id` (UUID), `tenantId` (FK)
   - `name` (VARCHAR, e.g., "Senior Sales Executive")
   - `description` (TEXT)
   - `isSystem` (Boolean - prevents deletion of core ADMIN roles)
3. **Create `Permission` Model** (Seed data, shared across all tenants):
   - `id` (UUID)
   - `resource` (VARCHAR, e.g., 'LEADS')
   - `action` (VARCHAR, e.g., 'DELETE')
4. **Create `RolePermission` Pivot Table**:
   - `roleId` (FK to Role)
   - `permissionId` (FK to Permission)

---

## 3. API Design

### Current Endpoints
- `GET /api/crm/roles` (Returns hardcoded mock data).

### Production-Ready REST API Enhancements
- **Role CRUD**:
  - `GET /api/crm/roles` (Fetch dynamic roles for the tenant).
  - `POST /api/crm/roles` (Create a custom role with an array of `permissionIds`).
  - `PATCH /api/crm/roles/:id` (Update a custom role's permissions).
  - `DELETE /api/crm/roles/:id` (Delete a custom role).
- **Permission Matrix Endpoint**:
  - `GET /api/crm/permissions` (Returns the static list of all available system permissions for the UI matrix builder).

---

## 4. UX Design

### Layout & Interactions (Proposed)
The current UI must be completely overhauled:
- **Primary View**: A list of *Roles*, not Users. Each row should show the Role Name, Description, Number of Users Assigned, and a Badge indicating if it's a System Role.
- **Permissions Builder**: When clicking "Edit Role", the UI should present a large Matrix/Grid.
  - **Rows**: Resources (Leads, Customers, Invoices, Settings).
  - **Columns**: Actions (Create, Read, Update, Delete).
  - Users toggle checkboxes to grant granular permissions to the custom role.
- **Assignment Tab**: Within the Role Edit modal, a secondary tab should allow the Admin to bulk-assign or remove Employees to/from the role.

---

## 5. Security Audit

### 5.1 Hardcoded Roles (Inflexibility Risk)
- **Vulnerability**: Because roles are hardcoded enums, any specific edge-case exception (e.g., a Sales rep who needs to view Invoices but not edit them) is impossible to implement securely. Developers often end up writing messy, nested `if` statements in the API to accommodate these exceptions, leading to Authorization bypass vulnerabilities.
- **Remediation**: Migrate to granular `Permission` checks instead of `Role` checks. APIs should verify `requirePermission('INVOICES:READ')` rather than `requireRole('SALES')`.

### 5.2 System Role Deletion
- **Threat**: When implementing custom roles, a malicious or negligent Admin might accidentally delete the core `Administrator` role, permanently locking everyone out of the tenant.
- **Remediation**: Enforce a strict `isSystem` flag on core roles. The `DELETE /api/crm/roles/:id` endpoint must reject the deletion if `isSystem === true`.

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Create `Role`, `Permission`, and `RolePermission` models in Prisma.
- [ ] Migrate existing `TenantUser.role` enum values into the new `Role` table for each Tenant.
- [ ] Create a database seed script for the static `Permission` list.
- [ ] Build CRUD REST endpoints for custom roles.
- [ ] Refactor the `requireRole` middleware into a `requirePermission` middleware that cross-references the user's `roleId` with the `RolePermission` table.

### Frontend
- [ ] Remove the mock data from `CrmService.getRoles`.
- [ ] Refactor `role-management/page.tsx` to display the new `Role` objects instead of `Users`.
- [ ] Build the Permission Matrix Checkbox Grid component for the `RoleForm` modal.
- [ ] Update the `Employees` module to use a dynamic dropdown of fetched `Roles` instead of a static enum list.

---

## 7. QA Test Cases

### Functional Cases (Post-Implementation)
- **TC-ROL-01**: Create a new custom role called "Marketing Intern". Grant only `LEADS:READ` permission. Save and verify it appears in the Roles table.
- **TC-ROL-02**: Assign an employee to the "Marketing Intern" role. Log in as the intern. Verify the UI hides the "Delete Lead" button, and the API throws a `403` if deletion is attempted via cURL.
- **TC-ROL-03**: Open the Permission Matrix for an existing role. Check a new box (e.g., `CUSTOMERS:DELETE`), save, and verify the `RolePermission` table is updated correctly.

### Security Cases
- **TC-ROL-SEC-01**: Attempt to send a `DELETE` request for the core `Administrator` role. Verify the API rejects it with a `403 Forbidden` due to the `isSystem` flag.
- **TC-ROL-SEC-02**: Attempt to delete a custom role that currently has 5 active employees assigned to it. Verify the API rejects the deletion (or forces reassignment) to prevent orphaned users.
