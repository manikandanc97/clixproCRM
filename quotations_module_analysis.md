# Quotations Module: Comprehensive Analysis

This document contains the complete analysis of the CLIXPRO CRM Quotations module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview
The Quotations module manages sales proposals sent to clients. It allows users to track the status of quotes (Draft, Pending, Approved, Rejected) and aggregates financial metrics based on the quote amounts.

### Architecture
- **Frontend Container**: `app/(dashboard)/quotations/page.tsx`
- **Data Fetching**: Custom hook `useQuotations()` (React Query) hydrates the Zustand store `useCRMStore`.
- **UI Components**: 
  - `QuotationsTable` for tabular data display.
  - `QuoteForm` (Modal) for generating new quotes.
- **Backend Service**: `CrmService.getQuotations` handles database querying and attaches mocked analytical data (like `viewCount`) before sending it to the frontend.

### 🛑 Identified Missing Features
- **Missing Line Items**: The system treats a Quote as a single `amount` integer. In reality, a Quotation must consist of multiple Line Items (Product/Service, Quantity, Unit Price, Discount, Tax).
- **String-Based Client**: The `client` field on a quote is merely a text string. It is not relationally linked to a `Customer` or `Lead` entity in the database.
- **No Document Generation**: Quotes cannot be converted to PDFs or emailed directly from the CRM to the client.
- **Fake Telemetry**: The backend hardcodes `probability: 50`, `viewCount: 0`, and `downloadCount: 0` for all quotes. There is no actual mechanism to track if a client has viewed a sent quote.
- **Client-Side Filtering Flaw**: The Search and Status filters only search the currently paginated chunk of data in the browser's memory, completely hiding valid results on subsequent pages.

---

## 2. Database Design

### Current State (Prisma Schema)
The `Quotation` model contains `id`, `tenantId`, `quoteNumber`, `client` (String), `amount`, `status`, and `validTill`.

### Production-Ready DB Recommendations
To build a functional CPQ (Configure, Price, Quote) system, the schema must be normalized:
1. **Refactor `Quotation` Model**:
   - Change `client` to `customerId` (FK) or `leadId` (FK).
   - Add `createdById` (FK) to track the salesperson.
   - Add `notes` and `termsAndConditions` (TEXT).
2. **Create `QuoteLineItem` Model**:
   - `id` (UUID), `quotationId` (FK)
   - `description` (VARCHAR)
   - `quantity` (Integer)
   - `unitPrice` (Decimal)
   - `taxRate` (Decimal)
   - `discount` (Decimal)
3. **Indexes**:
   - Add `UNIQUE INDEX idx_quote_tenant_number ON "Quotation" (tenantId, quoteNumber)` to prevent duplicate quote numbers within the same company.

---

## 3. API Design

### Current Endpoints
- `GET /api/crm/quotations?page=1&limit=10`
- `POST /api/crm/quotations`
- `PATCH /api/crm/quotations/:id`
- `DELETE /api/crm/quotations/:id`

### Production-Ready REST API Enhancements
- **Line Item Operations**: The `POST` and `PATCH` endpoints must be updated to accept a nested array of `lineItems` and handle Prisma relational inserts/updates contextually.
- **Document Generation**: Add `GET /api/crm/quotations/:id/pdf` which generates a PDF blob using a library like `pdfmake` or `puppeteer`.
- **Status Workflows**: Add `PATCH /api/crm/quotations/:id/approve` to explicitly handle business logic (like automatically creating a related `Deal` or `Customer` when a quote is approved).

---

## 4. UX Design

### Layout & Interactions
- **Data Table**: The module relies entirely on the `QuotationsTable` for visualization, which is appropriate for financial documents.
- **KPI Metrics**: Dynamic cards display Total Quotes, Average Deal Size (calculated client-side), and Pending Approvals.
- **Modal Creation**: Generating a quote happens inside a `FormModal`. Given the complexity of real-world quotes (adding multiple line items, calculating taxes), this modal will likely need to be converted into a full-page wizard or a dedicated `/quotations/new` route to provide enough screen real estate.

### States
- **Loading**: Utilizes `PageLoadingState` ("Loading quotations and approval status...").
- **Empty**: Renders a visually distinct empty state prompting the user to "Clear All Filters" if searches yield no results.
- **Error**: Exposes a manual retry button via `PageErrorState`.

---

## 5. Security Audit

### 5.1 Lack of Idempotency on Financial Documents
- **Vulnerability**: Currently, `POST /api/crm/quotations` does not guarantee unique `quoteNumber` generation. Rapid concurrent requests from a user could generate two quotes with the exact same `quoteNumber`, leading to severe accounting confusion.
- **Remediation**: Implement a unique constraint in the DB (`@@unique([tenantId, quoteNumber])`) and handle the `P2002` Prisma error gracefully in the API.

### 5.2 Editing Approved Quotes
- **Vulnerability**: The `PATCH /api/crm/quotations/:id` route does not check the current status of the quote. A Sales agent could alter the `amount` of a quote *after* the client has already Approved it, which violates basic financial compliance.
- **Remediation**: In the PATCH route, check if `quotation.status === 'APPROVED'`. If true, block the modification with a `403 Forbidden` error (or require an Admin override).

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Create `QuoteLineItem` Prisma model.
- [ ] Update `Quotation` model to link to `Customer`/`Lead` instead of using a raw string.
- [ ] Add `@@unique([tenantId, quoteNumber])` constraint to Prisma.
- [ ] Refactor `GET /api/crm/quotations` to use server-side `WHERE` filtering for searches and statuses.
- [ ] Implement strict mutation locking in `PATCH` if the quote is already `APPROVED`.
- [ ] Implement a PDF generation endpoint for downloading quotes.

### Frontend
- [ ] Move client-side `useMemo` filtering state to URL Search Params.
- [ ] Refactor `QuoteForm` from a basic modal into a full-page form to support adding/removing dynamic line items.
- [ ] Update `QuotationsTable` to display the actual linked Customer Name instead of a string.
- [ ] Wire the "Export" button to the new PDF generation endpoint.

---

## 7. QA Test Cases

### Functional Cases
- **TC-QT-01**: Submit a new Quotation with 3 different line items. Verify the total `amount` is calculated accurately (including taxes/discounts) and saved to the database.
- **TC-QT-02**: Click the "Download" icon on a specific quote row. Verify a properly formatted PDF document is generated and downloaded to the local machine.
- **TC-QT-03**: Search for a quote number (e.g., "QT-1005"). Verify the backend filters the list and returns the exact match regardless of pagination limits.

### Security & Compliance Cases
- **TC-QT-SEC-01**: Attempt to send a `PATCH` request modifying the `amount` of a quote that is currently marked as `APPROVED`. Verify the API rejects the request.
- **TC-QT-SEC-02**: Attempt to submit two quotes simultaneously with the exact same `quoteNumber` for the same Tenant. Verify the database unique constraint blocks the duplicate.

### Edge & Regression Cases
- **TC-QT-EDGE-01**: Submit a quote with an extremely long Line Item description (e.g., 500 characters). Verify the generated PDF wraps the text correctly without breaking the layout.
- **TC-QT-REG-01**: Transition a quote from `DRAFT` to `PENDING`. Verify the "Pending Approval" KPI metric card at the top of the page increments by 1 immediately.
