import { describe, it, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { CrmApiClient } from "./crm-api.client.js";
import {
  CrmAuthRequiredError,
  CrmForbiddenError,
  CrmNotFoundError,
  CrmRateLimitError,
  CrmServiceUnavailableError,
  CrmNetworkError,
} from "./types/api.js";
import { createMcpServer } from "./server.js";

describe("CrmApiClient - Step 2 Foundation Tests", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // 1. API Client URL Construction
  it("should construct URL correctly with trailing slashes, paths, and query parameters", () => {
    const client = new CrmApiClient({ baseUrl: "https://api.clixprocrm.com///" });
    const url = client.buildUrl("/v1/leads", { page: 1, limit: 20, filter: "active", empty: undefined, nil: null });

    assert.equal(url.origin, "https://api.clixprocrm.com");
    assert.equal(url.pathname, "/v1/leads");
    assert.equal(url.searchParams.get("page"), "1");
    assert.equal(url.searchParams.get("limit"), "20");
    assert.equal(url.searchParams.get("filter"), "active");
    assert.equal(url.searchParams.has("empty"), false);
    assert.equal(url.searchParams.has("nil"), false);
  });

  it("should handle base URLs without trailing slash and paths without leading slash", () => {
    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    const url = client.buildUrl("health");
    assert.equal(url.toString(), "http://localhost:4000/health");
  });

  // 2. Timeout Handling
  it("should map AbortError / timeout into CrmNetworkError", async () => {
    globalThis.fetch = () =>
      new Promise((_, reject) => {
        const error = new Error("The operation was aborted");
        error.name = "AbortError";
        setTimeout(() => reject(error), 20);
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000", defaultTimeoutMs: 10 });
    await assert.rejects(
      async () => {
        await client.request({ path: "/test", timeoutMs: 10 });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmNetworkError);
        assert.match((err as CrmNetworkError).safeMessage, /timed out/i);
        return true;
      }
    );
  });

  // 3. 401 Normalization
  it("should normalize 401 response into CrmAuthRequiredError", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Invalid session or token expired" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/protected" });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmAuthRequiredError);
        assert.equal((err as CrmAuthRequiredError).statusCode, 401);
        assert.equal((err as CrmAuthRequiredError).errorCode, "AUTH_REQUIRED");
        return true;
      }
    );
  });

  // 4. 403 Normalization
  it("should normalize 403 response into CrmForbiddenError", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Forbidden: Missing required permission" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/admin-only" });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmForbiddenError);
        assert.equal((err as CrmForbiddenError).statusCode, 403);
        assert.equal((err as CrmForbiddenError).errorCode, "PERMISSION_DENIED");
        return true;
      }
    );
  });

  // 5. 404 Normalization
  it("should normalize 404 response into CrmNotFoundError", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Lead not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/leads/999" });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmNotFoundError);
        assert.equal((err as CrmNotFoundError).statusCode, 404);
        assert.equal((err as CrmNotFoundError).errorCode, "NOT_FOUND");
        return true;
      }
    );
  });

  // 6. 429 Normalization
  it("should normalize 429 response into CrmRateLimitError", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Too many requests" }), {
        status: 429,
        headers: { "content-type": "application/json" },
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/data" });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmRateLimitError);
        assert.equal((err as CrmRateLimitError).statusCode, 429);
        assert.equal((err as CrmRateLimitError).errorCode, "RATE_LIMIT_EXCEEDED");
        return true;
      }
    );
  });

  // 7. 500 / 502 / 503 Normalization
  it("should normalize 500/503 responses into safe CrmServiceUnavailableError without leaking database traces", async () => {
    // Simulated internal database error with SQL trace that MUST NOT leak
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          error: "Internal Server Error",
          prismaStackTrace: "PrismaClientKnownRequestError: SELECT * FROM users WHERE id = '...'",
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/query" });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmServiceUnavailableError);
        assert.equal((err as CrmServiceUnavailableError).statusCode, 503);
        assert.equal((err as CrmServiceUnavailableError).errorCode, "SERVICE_UNAVAILABLE");
        assert.equal((err as CrmServiceUnavailableError).safeMessage, "CRM service is temporarily unavailable.");
        assert.doesNotMatch((err as CrmServiceUnavailableError).safeMessage, /prisma|select|postgres/i);
        return true;
      }
    );
  });

  // 8 & 9. Authorization headers and secrets are never logged
  it("should redact authorization and secret headers in sanitizeHeaders", () => {
    const client = new CrmApiClient();
    const inputHeaders = {
      Authorization: "Bearer super-secret-user-token-12345",
      "X-Api-Key": "raw-api-secret-key",
      Cookie: "session_id=abcdef123456",
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const sanitized = client.sanitizeHeaders(inputHeaders);

    assert.equal(sanitized["Authorization"], "[REDACTED]");
    assert.equal(sanitized["X-Api-Key"], "[REDACTED]");
    assert.equal(sanitized["Cookie"], "[REDACTED]");
    assert.equal(sanitized["Content-Type"], "application/json");
    assert.equal(sanitized["Accept"], "application/json");
    assert.equal(JSON.stringify(sanitized).includes("super-secret-user-token-12345"), false);
  });

  // 400 Validation Error Normalization
  it("should normalize 400 response into CrmValidationError", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Invalid email format" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/crm/leads", method: "POST", body: {} });
      },
      (err: unknown) => {
        assert.equal((err as any).statusCode, 400);
        assert.equal((err as any).errorCode, "VALIDATION_FAILED");
        assert.equal((err as any).safeMessage, "Invalid email format");
        return true;
      }
    );
  });

  // 409 Conflict Normalization
  it("should normalize 409 response into CrmConflictError", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Email already exists" }), {
        status: 409,
        headers: { "content-type": "application/json" },
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/crm/leads", method: "POST", body: {} });
      },
      (err: unknown) => {
        assert.equal((err as any).statusCode, 409);
        assert.equal((err as any).errorCode, "CONFLICT");
        assert.equal((err as any).safeMessage, "Email already exists");
        return true;
      }
    );
  });

  // Mutation Timeout Safe Error
  it("should return safe unconfirmed message for mutation timeouts (POST/PUT)", async () => {
    globalThis.fetch = () =>
      new Promise((_, reject) => {
        const error = new Error("The operation was aborted");
        error.name = "AbortError";
        setTimeout(() => reject(error), 20);
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000", defaultTimeoutMs: 10 });
    await assert.rejects(
      async () => {
        await client.request({ path: "/crm/leads", method: "POST", body: { name: "Test" }, timeoutMs: 10 });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmNetworkError);
        assert.equal(
          (err as CrmNetworkError).safeMessage,
          "Mutation result could not be confirmed. Please verify the record before retrying."
        );
        return true;
      }
    );
  });

  // 10. MCP Server starts without CRM API availability
  it("should initialize MCP server capability without requiring live CRM API connectivity", () => {
    const server = createMcpServer();
    assert.ok(server);
    // Server is an McpServer instance ready to bind to stdio
  });
});

