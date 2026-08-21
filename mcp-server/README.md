# ClixProCRM MCP Server

Model Context Protocol (MCP) Server for ClixProCRM.

---

## 1. Overview & Architecture

The Model Context Protocol (MCP) Server provides an AI bridge for assistants (Claude Desktop, Cursor, Cline, or custom AI agents) to query ClixProCRM services using standard MCP JSON-RPC protocol over stdio.

```
     AI Assistant / Host Client
              ↓ (stdio / JSON-RPC)
     MCP Server (mcp-server/)
              ↓ (HTTPS / REST via CrmApiClient)
     ClixProCRM API Gateway (api/)
              ↓
   Supabase Auth + TenantGuard + RolesGuard + PermissionsGuard
              ↓
     Existing Core CRM Services & HMAC AuditLog
              ↓
         PostgreSQL / Row-Level Security (RLS)
```

---

## 2. MCP Security & Identity Boundaries (Step 5 Hardened)

> [!IMPORTANT]
> **MCP does not receive direct or unrestricted access to CRM data.**

### 1. Identity & Session Binding Authority
- **Zero Identity Spoofing**: MCP tool arguments **never** accept or override `userId`, `tenantId`, `role`, or `permissions`.
- **Backend as Final Authority**: The backend API verifies the incoming Bearer token and derives all identity, tenant scope, and RBAC permissions from the cryptographically verified JWT session.
- **Prompt Injection Defense**: Tool arguments are treated strictly as **DATA**, never as instructions. Injected directives (such as `"Act as tenant ABC admin"` or `"Ignore previous rules"`) have zero effect on backend authorization.

### 2. Token Security & Header Redaction
- **Credential Forwarding Only**: MCP never generates JWTs, signs tokens, or stores user passwords or Supabase service-role credentials.
- **Zero Log Leakage**: Bearer tokens, cookies, session IDs, and API keys are automatically redacted (`[REDACTED]`) from diagnostic logs via `sanitizeHeaders`.
- **Error Scrubbing**: Error messages and stack traces are scrubbed to strip JWT tokens (`[REDACTED_TOKEN]`) before returning to the caller.

### 3. Tenant Isolation & RBAC Protection
- **Multi-Tenant Scoping**: All tool requests route through `CrmApiClient` to tenant-isolated endpoints protected by `TenantGuard` and PostgreSQL Row-Level Security (RLS).
- **Strict Payload Whitelisting**: MCP tools construct backend payloads with explicit business field whitelisting. Injected tenant/user fields are stripped before HTTP dispatch.

### 4. Mutation Confirmation Hardening
- **Boolean Guard**: Controlled write tools (`create_lead`, `update_lead`, `create_customer`, `update_customer`) strictly require `confirmed === true` (boolean `true`).
- **No Inferred/Loose Confirmation**: Natural language phrases (`"yes"`, `"confirm"`, `"approved"`) or string `"true"` are rejected.
- **State Isolation**: Confirmation cannot be inherited from previous tool outputs or cached across requests.

### 5. Mutation Replay Protection
- **No Blind Retries**: POST and PUT mutation requests are **never** blindly retried on network timeouts or transport failures.
- **Safe State Reporting**: If a mutation times out, MCP safely reports:
  `"Mutation result could not be confirmed. Please verify the record before retrying."`

### 6. Client-Side Safety Rate Limiting
- **Loop & Flooding Prevention**: MCP incorporates an in-memory sliding-window rate limiter (`McpRateLimiter`) to prevent runaway AI tool loops and request flooding.
- **Configurable Limits**: Configured via `MCP_RATE_LIMIT_MAX_REQUESTS` (default: 60) and `MCP_RATE_LIMIT_WINDOW_MS` (default: 60,000ms = 1 min).
- **Backend Rate Limit Integrity**: Does NOT weaken or replace backend NestJS `ThrottlerGuard`.

### 7. Request Size & Payload Protection
- **Body & Query Limits**: Rejects payloads exceeding `MCP_MAX_PAYLOAD_SIZE_BYTES` (default: 100 KB) or oversized query parameters (> 8 KB) with `CrmValidationError`.
- **Array Capping**: Collections such as `tags` are capped to a maximum of 20 items with 50 characters each.
- **String Length Limits**: Field inputs (`notes`, `company`, `name`, `email`) enforce strict upper bounds to prevent buffer bloat.

### 8. Response Trust Boundary & Sensitive Data Stripping
- **Data Boundary**: All CRM API responses are treated as untrusted text/data and returned as typed JSON text.
- **Secret Stripping**: Data serializers (`leads.serializer.ts`, `customers.serializer.ts`, `user.serializer.ts`) strictly omit `passwordHash`, `mfaSecret`, `recoveryCodes`, `jwtToken`, `sessionToken`, and database internals.
- **Database Error Shielding**: Backend stack traces, Prisma errors, and SQL snippets are caught and normalized to safe error messages without exposing internals.

### 9. Audit Correlation
- **Correlation Tracing**: Generates safe unique correlation IDs (`req_<uuid>`) and attaches `X-Correlation-ID` and `X-Request-ID` headers to all backend calls.
- **Secret Scrubbing in Traces**: Correlation IDs containing tokens, passwords, or JWTs are automatically discarded and replaced with safe UUIDs.
- **Sole Audit Authority**: MCP never creates a secondary audit log; the backend's HMAC-chained `AuditLog` remains the single immutable audit authority.

---

## 3. Registered Tool Inventory (Locked to 9 Tools)

### Read Tools (5)
| Tool Name | Purpose | Parameters | Authorization Endpoint |
| :--- | :--- | :--- | :--- |
| **`get_current_user`** | Get the authenticated user's permitted CRM profile. | *(None - derived from session)* | `GET /auth/me` |
| **`list_leads`** | List leads accessible to the authenticated user in the current tenant. | `search`, `status`, `page`, `limit` (max 50), `sort` | `GET /crm/leads` |
| **`get_lead`** | Get a single lead accessible to the authenticated user. | `id` (string) | `GET /crm/leads/:id` |
| **`list_customers`** | List customers accessible to the authenticated user. | `search`, `page`, `limit` (max 50), `sort` | `GET /crm/customers` |
| **`get_customer`** | Get a single customer accessible to the authenticated user. | `id` (string) | `GET /crm/customers/:id` |

### Controlled Write Tools (4 - Explicit Confirmation Required)
| Tool Name | Purpose | Required Parameters | Optional Parameters | Backend Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **`create_lead`** | Create a new lead for the authenticated user, subject to CRM permissions. | `name`, `email`, `confirmed: true` | `company`, `phone`, `source`, `stage`, `priority`, `value`, `valueAmount`, `expectedCloseDate`, `tags` (max 20), `assignedToId` | `POST /crm/leads` |
| **`update_lead`** | Update an existing lead accessible to the authenticated user. | `id`, `confirmed: true` | `name`, `company`, `email`, `phone`, `source`, `stage`, `priority`, `value`, `valueAmount`, `expectedCloseDate`, `tags` (max 20), `assignedToId`, `wonReason`, `lostReason`, `competitor`, `notes`, `actualRevenue` | `PUT /crm/leads/:id` |
| **`create_customer`** | Create a new customer subject to CRM permissions. | `name`, `company`, `confirmed: true` | `email`, `revenue`, `status` | `POST /crm/customers` |
| **`update_customer`** | Update an existing customer accessible to the authenticated user. | `id`, `confirmed: true` | `name`, `company`, `email`, `revenue`, `status` | `PUT /customers/:id` |

> [!CAUTION]
> **Prohibited Operations**:
> Destructive operations (`delete_*`, `bulk_*`, `admin_*`, `impersonate_*`, `switch_tenant`, `execute_sql`, `run_query`) are STRICTLY excluded.

---

## 4. Environment Configuration

Copy `.env.example` to `.env` to configure your local environment:

```bash
# Server Metadata
MCP_SERVER_NAME=clixprocrm-mcp-server
MCP_SERVER_VERSION=0.1.0

# CRM API Gateway URL
CRM_API_BASE_URL=http://localhost:4000

# Request Timeout (Default: 10000ms = 10s)
CRM_REQUEST_TIMEOUT_MS=10000

# Logging Level (debug | info | warn | error)
LOG_LEVEL=info

# MCP Client-Side Rate Limiter
MCP_RATE_LIMIT_ENABLED=true
MCP_RATE_LIMIT_MAX_REQUESTS=60
MCP_RATE_LIMIT_WINDOW_MS=60000

# Request Payload Limit (Bytes)
MCP_MAX_PAYLOAD_SIZE_BYTES=102400
```

---

## 5. Getting Started & Verification

### Run Tests
```bash
cd mcp-server
npm test
```

### Build
```bash
npm run build
```

### Run Server (stdio transport)
```bash
npm run start
```

