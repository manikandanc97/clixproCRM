import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createMcpServer } from "./server.js";
import { CrmApiClient } from "./crm-api.client.js";
import {
  runWithSessionContext,
  getActiveSessionContext,
} from "./security/session-context.js";
import { mcpRateLimiter } from "./security/rate-limiter.js";
import {
  CrmAuthRequiredError,
  CrmForbiddenError,
  CrmRateLimitError,
  CrmServiceUnavailableError,
  CrmNetworkError,
} from "./types/api.js";

function getRegisteredTools(server: ReturnType<typeof createMcpServer>): Record<string, any> {
  return (server as any)._registeredTools || {};
}

describe("MCP Chat Integration & Transport Security Tests", () => {
  let originalFetch: typeof globalThis.fetch;
  let originalConsoleError: typeof console.error;
  let capturedLogs: string[] = [];

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    originalConsoleError = console.error;
    capturedLogs = [];
    console.error = (...args: any[]) => {
      capturedLogs.push(args.map(String).join(" "));
    };
    mcpRateLimiter.reset();
    mcpRateLimiter.configure({ maxRequests: 60, windowMs: 60000, enabled: true });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });

  it("1. McpSessionContext correctly sets and isolates active session tokens in async flow", async () => {
    assert.equal(getActiveSessionContext(), undefined);

    await runWithSessionContext(
      { authToken: "session-jwt-token-123", tenantId: "tenant-abc" },
      async () => {
        const ctx = getActiveSessionContext();
        assert.equal(ctx?.authToken, "session-jwt-token-123");
        assert.equal(ctx?.tenantId, "tenant-abc");
      }
    );

    assert.equal(getActiveSessionContext(), undefined);
  });

  it("2. CrmApiClient automatically propagates authToken from McpSessionContext", async () => {
    let capturedHeaders: any;

    globalThis.fetch = async (url, init) => {
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ success: true, data: { user: { id: "u-1" } } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });

    await runWithSessionContext(
      { authToken: "propagated-user-token-xyz" },
      async () => {
        await client.request({ path: "/auth/me" });
      }
    );

    const headersRecord = capturedHeaders as Record<string, string>;
    assert.equal(headersRecord["Authorization"], "Bearer propagated-user-token-xyz");
  });

  it("3. Mutation tools strictly require boolean confirmed=true", async () => {
    const server = createMcpServer();
    const tools = getRegisteredTools(server);
    let fetchCalled = false;

    globalThis.fetch = async () => {
      fetchCalled = true;
      return new Response(JSON.stringify({ success: true, data: { id: "lead-1" } }), {
        status: 201,
      });
    };

    // Case A: confirmed=false
    const resA = await tools["create_lead"].handler(
      { name: "Acme Lead", email: "acme@example.com", confirmed: false },
      {}
    );
    assert.equal(fetchCalled, false);
    assert.match(resA.content[0].text, /confirmation is required/i);

    // Case B: confirmed=true
    const resB = await tools["create_lead"].handler(
      { name: "Acme Lead", email: "acme@example.com", confirmed: true },
      {}
    );
    assert.equal(fetchCalled, true);
    assert.equal(resB.isError, undefined);
  });

  it("4. Normalizes 401 Unauthorized errors safely", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "JWT expired or revoked" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/crm/leads" });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmAuthRequiredError);
        assert.equal((err as CrmAuthRequiredError).statusCode, 401);
        assert.match((err as CrmAuthRequiredError).safeMessage, /JWT expired or revoked/i);
        return true;
      }
    );
  });

  it("5. Normalizes 403 Forbidden errors safely", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Forbidden resource" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/crm/leads" });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmForbiddenError);
        assert.equal((err as CrmForbiddenError).statusCode, 403);
        assert.match((err as CrmForbiddenError).safeMessage, /Forbidden resource/i);
        return true;
      }
    );
  });

  it("6. Normalizes 500/503 Service Unavailable errors safely without leaking DB internals", async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          message: "PrismaClientInitializationError: Can't reach database server at postgres:5432",
        }),
        {
          status: 503,
          headers: { "content-type": "application/json" },
        }
      );

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000" });
    await assert.rejects(
      async () => {
        await client.request({ path: "/crm/leads" });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmServiceUnavailableError);
        assert.equal(
          (err as CrmServiceUnavailableError).safeMessage,
          "CRM service is temporarily unavailable."
        );
        assert.equal((err as CrmServiceUnavailableError).safeMessage.includes("Prisma"), false);
        assert.equal((err as CrmServiceUnavailableError).safeMessage.includes("postgres"), false);
        return true;
      }
    );
  });

  it("7. Handles request timeouts safely with CrmNetworkError", async () => {
    globalThis.fetch = () => {
      return new Promise((_, reject) => {
        const err = new Error("AbortError");
        err.name = "AbortError";
        setTimeout(() => reject(err), 20);
      });
    };

    const client = new CrmApiClient({ baseUrl: "http://localhost:4000", defaultTimeoutMs: 10 });
    await assert.rejects(
      async () => {
        await client.request({ path: "/crm/leads", timeoutMs: 10 });
      },
      (err: unknown) => {
        assert.ok(err instanceof CrmNetworkError);
        assert.match((err as CrmNetworkError).safeMessage, /timed out/i);
        return true;
      }
    );
  });

  it("8. Tool list inventory contains exactly the 9 approved CRM tools", () => {
    const server = createMcpServer();
    const tools = getRegisteredTools(server);
    const expected = [
      "get_current_user",
      "list_leads",
      "get_lead",
      "create_lead",
      "update_lead",
      "list_customers",
      "get_customer",
      "create_customer",
      "update_customer",
    ];

    assert.equal(Object.keys(tools).length, 9);
    for (const toolName of expected) {
      assert.ok(tools[toolName], `Tool '${toolName}' must be registered`);
    }
  });
});
