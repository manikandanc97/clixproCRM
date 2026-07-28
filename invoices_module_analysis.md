# Invoices Module: Comprehensive Analysis

This document contains the complete analysis and blueprint for the CLIXPRO CRM Invoices module, divided into 7 distinct sections as requested. No code implementations are included.

---

## 1. Implementation Document

### Overview & Current Status
**🚨 CRITICAL FINDING:** The Invoices module is currently **completely missing** from the CLIXPRO CRM project. There are no UI routes (`app/(dashboard)/invoices`), no API endpoints (`app/api/crm/invoices`), and no Prisma database models to support invoicing. 

### Proposed Architecture
To build this module, the following architecture is required:
- **Frontend Container**: Create `app/(dashboard)/invoices/page.tsx`.
- **Data Fetching**: Create `useInvoices()` hook wrapping React Query, syncing to `useCRMStore`.
- **Backend Service**: Create an `InvoiceService` class to handle calculations, PDF generation, and payment gateway webhooks (e.g., Stripe).
- **Core Integrations**: 
  - **PDF Generation**: `puppeteer` or `pdfmake` for generating downloadable invoices.
  - **Payment Processing**: Stripe or PayPal SDK for accepting online payments directly from the invoice link.

---

## 2. Database Design

### Proposed State (Prisma Schema)
A robust billing system requires relational normalization. The following schema must be added:

1. **`Invoice` Model**:
   - `id` (UUID), `tenantId` (FK)
   - `invoiceNumber` (VARCHAR, Unique per tenant)
   - `customerId` (FK to Customer)
   - `createdById` (FK to User)
   - `status` (Enum: DRAFT, SENT, PARTIAL, PAID, OVERDUE, VOID)
   - `issueDate` (DateTime), `dueDate` (DateTime)
   - `subtotal` (Decimal), `taxTotal` (Decimal), `grandTotal` (Decimal)
   - `currency` (VARCHAR, e.g., 'USD')
   - `notes` (TEXT)
2. **`InvoiceLineItem` Model**:
   - `id` (UUID), `invoiceId` (FK, Cascade Delete)
   - `description` (VARCHAR)
   - `quantity` (Integer)
   - `unitPrice` (Decimal)
   - `taxRate` (Decimal)
3. **`Payment` Model**:
   - `id` (UUID), `invoiceId` (FK)
   - `amount` (Decimal)
   - `paymentMethod` (Enum: CREDIT_CARD, BANK_TRANSFER, CASH)
   - `transactionId` (VARCHAR - from Stripe/PayPal)
   - `paymentDate` (DateTime)

---

## 3. API Design

### Proposed REST API Endpoints
To support the frontend and external integrations:

- **CRUD Operations**:
  - `GET /api/crm/invoices?status=OVERDUE&page=1`
  - `POST /api/crm/invoices` (Body includes `lineItems` array).
  - `PATCH /api/crm/invoices/:id`
  - `DELETE /api/crm/invoices/:id` (Only allowed if status is DRAFT).
- **Business Logic Endpoints**:
  - `POST /api/crm/invoices/:id/send` (Dispatches an email to the customer with a PDF attachment).
  - `GET /api/crm/invoices/:id/pdf` (Streams the generated PDF blob to the client).
  - `POST /api/crm/invoices/:id/void` (Voids an unpaid invoice).
- **Webhooks**:
  - `POST /api/crm/webhooks/stripe` (Listens for `payment_intent.succeeded` to automatically mark an invoice as PAID).

---

## 4. UX Design

### Layout & Interactions (Proposed)
- **Top Metrics**: KPI Cards showing "Total Outstanding ($)", "Overdue ($)", and "Collected This Month ($)".
- **Data Table**: A dense `InvoicesTable` highlighting status with color-coded badges (Green = PAID, Red = OVERDUE, Gray = DRAFT).
- **Creation Wizard**: Given the complexity of invoices, creation should use a full-page layout (`/invoices/new`) rather than a modal. It must support dynamic row additions for line items, real-time subtotal/tax calculations, and customer lookup dropdowns.
- **Client Portal (External UX)**: A public-facing, unauthenticated route (`/pay/:invoiceId`) where clients can view their invoice and enter credit card details to pay via Stripe.

---

## 5. Security Audit

### Pre-Emptive Threat Modeling
Because this module handles actual financial data and payments, security is paramount:

### 5.1 Price Tampering (Client-Side Trust)
- **Threat**: A malicious user intercepts the `POST` request and alters the `grandTotal` to be `$1.00` while keeping line items worth `$5000`.
- **Remediation**: The backend API must **never** trust the `subtotal`, `tax`, or `grandTotal` sent by the client. The backend must independently recalculate these totals by iterating through the submitted `lineItems`.

### 5.2 IDOR on Public Payment Links
- **Threat**: The public payment page (`/pay/:id`) might expose sensitive customer data (addresses, phone numbers, purchase history) to anyone who guesses the UUID.
- **Remediation**: Rate-limit the public route to prevent UUID enumeration. Ensure the public view strips all non-essential PII and only exposes the bare minimum data required to fulfill the payment.

### 5.3 Webhook Forgery
- **Threat**: An attacker manually sends a POST request to the Stripe webhook endpoint to fraudulently mark their invoice as PAID.
- **Remediation**: Validate the `Stripe-Signature` header against the server's webhook secret on every request.

---

## 6. Development Checklist (Atomic Tasks)

### Database & Backend
- [ ] Add `Invoice`, `InvoiceLineItem`, and `Payment` models to Prisma.
- [ ] Run Prisma migration.
- [ ] Implement `InvoiceService` with strict backend calculation logic.
- [ ] Build CRUD REST endpoints (`GET`, `POST`, `PATCH`, `DELETE`).
- [ ] Build the PDF generation endpoint using `puppeteer`.
- [ ] Implement Nodemailer integration for the `/send` endpoint.
- [ ] Integrate Stripe SDK and configure webhook listener.

### Frontend
- [ ] Create `app/(dashboard)/invoices/page.tsx` and related UI metrics.
- [ ] Build `InvoicesTable` with dynamic filtering.
- [ ] Build the `/invoices/new` full-page wizard with dynamic line-item rows.
- [ ] Build the external `/pay/[id]/page.tsx` for client-facing checkouts.

---

## 7. QA Test Cases

### Functional Cases
- **TC-INV-01**: Create an invoice with 3 line items of varying tax rates. Verify the UI subtotal matches the backend-calculated total precisely.
- **TC-INV-02**: Click "Send to Client". Verify the recipient receives an email with a correctly formatted PDF attachment.
- **TC-INV-03**: Complete a test payment via the Stripe public link. Verify the invoice status automatically updates from SENT to PAID in the CRM dashboard.

### Security Cases
- **TC-INV-SEC-01**: Submit a `POST` request where the `grandTotal` in the JSON body is intentionally manipulated to be lower than the sum of the line items. Verify the API rejects it or overrides it with the correct calculation.
- **TC-INV-SEC-02**: Attempt to `DELETE` an invoice that has a status of PAID. Verify the API returns a `403 Forbidden` error (Paid invoices must only be voided or refunded, never hard-deleted for accounting compliance).
