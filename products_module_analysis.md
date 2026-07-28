# Products Module: Comprehensive Analysis

This document contains the complete analysis and blueprint for the CLIXPRO CRM Products module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview & Current Status
**🚨 CRITICAL FINDING:** The Products (or Inventory/Catalog) module is currently **completely missing** from the CLIXPRO CRM project. There are no UI routes (`app/(dashboard)/products`), no API endpoints (`app/api/crm/products`), and no Prisma database models to support product or inventory management. 

### Proposed Architecture
To build this module and integrate it into a true CPQ (Configure, Price, Quote) flow, the following architecture is required:
- **Frontend Container**: Create `app/(dashboard)/products/page.tsx`.
- **State Management**: Create `useProducts()` hook wrapping React Query, synced to `useCRMStore`.
- **Backend Service**: Create a `ProductService` class in `crm.service.ts` to handle catalog CRUD, inventory deduction, and variant management.
- **Integration Layer**: The Products module must act as the primary data source for the `Quotations` and `Invoices` modules, feeding `QuoteLineItem` and `InvoiceLineItem` rows.

---

## 2. Database Design

### Proposed State (Prisma Schema)
A robust catalog system requires the following normalized tables:

1. **`ProductCategory` Model**:
   - `id` (UUID), `tenantId` (FK)
   - `name` (VARCHAR)
   - `description` (TEXT)
2. **`Product` Model**:
   - `id` (UUID), `tenantId` (FK)
   - `categoryId` (FK to ProductCategory)
   - `name` (VARCHAR)
   - `sku` (VARCHAR, Unique per tenant)
   - `description` (TEXT)
   - `type` (Enum: PHYSICAL, DIGITAL, SERVICE)
   - `basePrice` (Decimal)
   - `currency` (VARCHAR)
   - `status` (Enum: ACTIVE, DRAFT, ARCHIVED)
   - `taxable` (Boolean)
3. **`Inventory` Model** (Optional for Phase 1, required for physical goods):
   - `id` (UUID), `productId` (FK)
   - `stockQuantity` (Integer)
   - `lowStockThreshold` (Integer)

---

## 3. API Design

### Proposed REST API Endpoints
To support the frontend and external integrations:

- **CRUD Operations**:
  - `GET /api/crm/products?search=X&category=Y&page=1`
  - `POST /api/crm/products` (Accepts multipart/form-data for image uploads).
  - `PATCH /api/crm/products/:id`
  - `DELETE /api/crm/products/:id` (Soft delete/archive to preserve historical invoice data).
- **Category Endpoints**:
  - `GET /api/crm/products/categories`
  - `POST /api/crm/products/categories`
- **Lookup Endpoints**:
  - `GET /api/crm/products/lookup?sku=X` (Optimized for auto-complete inside the Quotation and Invoice line-item builder).

---

## 4. UX Design

### Layout & Interactions (Proposed)
- **Catalog Views**: 
  - **Grid View**: Visual layout showing product images, name, and price (Best for visual catalogs).
  - **List View**: Dense table showing SKU, Stock Quantity, Price, and Status (Best for inventory management).
- **Top Metrics**: KPI Cards showing "Total Products", "Low Stock Alerts", and "Top Selling Product".
- **Product Form Drawer**: A right-side slide-out drawer (`ProductDetailsDrawer`) for quickly adding or editing products without losing the catalog context. Includes drag-and-drop zones for product images.
- **CPQ Integration UI**: Inside the `QuoteForm` and `InvoiceForm`, users should see an autocomplete dropdown that fetches directly from the Products catalog, auto-filling descriptions and unit prices upon selection.

---

## 5. Security Audit

### Pre-Emptive Threat Modeling
Because this module acts as the foundation for the CRM's financial calculations, data integrity is vital:

### 5.1 SKU Clashing and Data Integrity
- **Threat**: Two users simultaneously create a product and assign it the same SKU (`SKU-100`), causing lookup confusion during invoice generation.
- **Remediation**: Enforce a strict `@@unique([tenantId, sku])` constraint in the Prisma schema. Catch `P2002` errors in the API and return a friendly "SKU already exists" `409 Conflict`.

### 5.2 Hard Deletion Corrupting Financials
- **Threat**: A user deletes a product that was used in an old, paid Invoice. If the database uses `Cascade` deletion or if the API actually drops the row, the historical Invoice Line Items might break or lose relational context.
- **Remediation**: Never physically delete a product. The `DELETE` endpoint must act as a Soft Delete, updating the `status` to `ARCHIVED`.

### 5.3 Unauthorized Price Manipulation
- **Threat**: A junior sales rep edits the `basePrice` of a flagship product to give their client a massive unauthorized discount on future quotes.
- **Remediation**: Implement strict RBAC. `SALES` roles should only have `READ` access to the Product catalog. Only `MANAGER` and `ADMIN` roles should have `POST/PATCH/DELETE` permissions.

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Add `ProductCategory`, `Product`, and `Inventory` models to Prisma schema.
- [ ] Implement `@@unique` constraint on SKUs per tenant.
- [ ] Run Prisma migration.
- [ ] Create `ProductService` for backend catalog management.
- [ ] Build CRUD REST endpoints (`GET`, `POST`, `PATCH`, `DELETE`).
- [ ] Enforce RBAC logic: Restrict write access to Managers/Admins.

### Frontend
- [ ] Create `app/(dashboard)/products/page.tsx`.
- [ ] Build `ProductsTable` and `ProductsGrid` components with a view toggle.
- [ ] Build `ProductForm` slide-out drawer for catalog management.
- [ ] Refactor `Quotations` and `Invoices` modules to fetch and auto-fill data from the new Products API.

---

## 7. QA Test Cases

### Functional Cases
- **TC-PRD-01**: Submit a new Product with a unique SKU and an uploaded image. Verify it appears in the catalog Grid View immediately.
- **TC-PRD-02**: Attempt to submit a new Product with an SKU that already exists in the tenant. Verify the UI displays a clear validation error.
- **TC-PRD-03**: Open the `QuoteForm` (after integration). Type "SKU-100" into the line item box. Verify the Product name and `basePrice` autofill instantly.

### Security Cases
- **TC-PRD-SEC-01**: Log in as a `SALES` agent. Attempt to execute a `PATCH /api/crm/products/:id` request via cURL to lower a product's price. Verify the API returns a `403 Forbidden`.
- **TC-PRD-SEC-02**: Delete an active product via the UI. Verify the product disappears from the active catalog but its database row remains intact with `status="ARCHIVED"`.
