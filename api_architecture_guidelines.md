# CLIXPRO CRM v1.0: API Architecture & Design Guidelines

This document establishes the strict standards and conventions for building the RESTful API layer in CLIXPRO CRM. Adhering to these guidelines ensures consistency, performance (preventing O(N) memory crashes), and enterprise-grade security across the platform.

---

## 1. REST Standards & API Naming Convention

APIs must adhere to strict RESTful resource-oriented naming.
- **Nouns, not verbs**: Use `/api/crm/leads`, not `/api/crm/getLeads`.
- **Pluralization**: Resource collections must be plural (`/leads`, `/customers`).
- **Hierarchy**: Nested resources should indicate ownership (e.g., `/api/crm/customers/:id/contacts`).
- **Casing**: Use kebab-case for URLs (`/api/crm/support-tickets`).

### Standard Endpoints
- `GET /resource` (List all, paginated)
- `POST /resource` (Create new)
- `GET /resource/:id` (Get specific entity)
- `PATCH /resource/:id` (Update specific entity - prefer PATCH over PUT for partial updates)
- `DELETE /resource/:id` (Soft delete entity)

---

## 2. Response & Error Formats

### 2.1 Standard Success Response
All endpoints must return a predictable JSON envelope.
```json
{
  "success": true,
  "data": { ... }, // Object or Array
  "message": "Optional human-readable success message"
}
```

### 2.2 Paginated Success Response
When returning collections, pagination metadata is mandatory.
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 145,
      "totalPages": 15
    }
  }
}
```

### 2.3 Standard Error Format
Errors must be caught by a centralized `handleApiError` utility.
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED", // Machine-readable string
    "message": "Invalid email address format.", // Human-readable
    "details": [
      { "field": "email", "message": "Expected valid email" }
    ]
  }
}
```

---

## 3. Data Querying (Pagination, Filtering, Sorting, Search)

> [!WARNING]  
> **Client-Side Filtering is Banned.** You may no longer fetch all records into memory (`prisma.findMany()`) and use `Array.filter()` on the frontend. All data manipulation must happen at the PostgreSQL level via Prisma.

### 3.1 Pagination
- Handled via query parameters: `?page=1&limit=20`
- Default `page = 1`, Default `limit = 10`. Max `limit = 100`.

### 3.2 Filtering
- Pass specific fields as query parameters: `?status=WON&industry=TECH`
- Backend maps these to Prisma `where` clauses.

### 3.3 Sorting
- Use `sortBy` and `sortOrder`: `?sortBy=createdAt&sortOrder=desc`
- Whitelist allowable sort fields to prevent Prisma query injection.

### 3.4 Search
- Use the `q` parameter for full-text search: `?q=Acme%20Corp`
- Backend maps this to Prisma `contains: query, mode: 'insensitive'`.

**Example Full URL**:
`GET /api/crm/leads?page=2&limit=20&status=NEW&sortBy=createdAt&sortOrder=desc&q=john`

---

## 4. Security & Access Control

### 4.1 Authentication
- All API requests (except `/api/auth/login`, `/register`, etc.) must be authenticated via a secure, HttpOnly JWT cookie.
- The Next.js `middleware.ts` enforces authentication and injects `x-user-id` and `x-tenant-id` headers into the request.

### 4.2 RBAC (Role-Based Access Control)
- **Deprecate Enum Checks**: Do not use `session.role === 'ADMIN'`.
- **Implement Granular Middleware**: Use a permission utility function wrapped around the API logic.
```typescript
// Example Implementation
const hasPermission = await requirePermission("LEADS:DELETE");
if (!hasPermission) return NextResponse.json(..., { status: 403 });
```

### 4.3 Rate Limiting
- Use Upstash Redis (or similar) to implement sliding-window rate limiting.
- **Global API**: 100 requests per 10 seconds per IP.
- **Auth/Login**: 5 requests per 15 minutes per IP (to prevent brute-force).

---

## 5. Validation

- **Zod is Mandatory**: Every `POST` and `PATCH` request body MUST be validated against a strict Zod schema before hitting the service layer or database.
- Do not trust frontend validation. 
- Example:
```typescript
const result = CreateLeadSchema.safeParse(await req.json());
if (!result.success) return handleValidationError(result.error);
```

---

## 6. Folder Structure (Next.js App Router)

Maintain a strict separation of concerns. Do not put business logic inside `route.ts`.

```text
crm/
├── app/
│   ├── api/
│   │   ├── crm/
│   │   │   ├── leads/
│   │   │   │   ├── route.ts          # Handles HTTP (GET, POST), calls Service
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # Handles HTTP (GET ID, PATCH, DELETE)
├── services/
│   └── lead.service.ts               # Core Business Logic & Prisma queries
├── shared/
│   ├── validators/
│   │   └── lead.validator.ts         # Zod schemas
│   └── types/
│       └── lead.d.ts                 # TypeScript interfaces
```

---

## 7. Versioning

- As CLIXPRO CRM is moving to v1.0, the APIs are currently internal and unversioned (e.g., `/api/crm/leads`).
- If public APIs are exposed in the future for customer integrations, they MUST be versioned at the route level: `/api/v1/leads`. Internal dashboard APIs do not require `v1` prefixing to save complexity, provided they are strictly decoupled from public webhooks.
