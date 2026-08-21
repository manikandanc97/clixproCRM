import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createMcpServer } from "./server.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Step 4 Controlled CRM Write Tools & Security Tests", () => {
  let originalFetch: typeof globalThis.fetch;
  let lastFetchUrl: string | null = null;
  let lastFetchOptions: RequestInit | null = null;
  let fetchCallCount = 0;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    lastFetchUrl = null;
    lastFetchOptions = null;
    fetchCallCount = 0;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // Helper to get registered tools dictionary
  function getRegisteredTools(server: ReturnType<typeof createMcpServer>): Record<string, any> {
    return (server as any)._registeredTools || {};
  }

  // 1. Tool registration: 5 read tools + 4 controlled write tools = 9 permitted tools total
  it("should register exactly the 9 permitted tools (5 read + 4 write) and NO delete tools", async () => {
    const server = createMcpServer();
    const registeredTools = getRegisteredTools(server);
    const toolNames = Object.keys(registeredTools);

    assert.equal(toolNames.length, 9);

    // Verify permitted read tools
    assert.ok(registeredTools["get_current_user"], "get_current_user must exist");
    assert.ok(registeredTools["list_leads"], "list_leads must exist");
    assert.ok(registeredTools["get_lead"], "get_lead must exist");
    assert.ok(registeredTools["list_customers"], "list_customers must exist");
    assert.ok(registeredTools["get_customer"], "get_customer must exist");

    // Verify permitted write tools
    assert.ok(registeredTools["create_lead"], "create_lead must exist");
    assert.ok(registeredTools["update_lead"], "update_lead must exist");
    assert.ok(registeredTools["create_customer"], "create_customer must exist");
    assert.ok(registeredTools["update_customer"], "update_customer must exist");

    // 20. Explicitly verify NO delete tools exist
    assert.equal(registeredTools["delete_lead"], undefined, "delete_lead must NOT exist");
    assert.equal(registeredTools["delete_customer"], undefined, "delete_customer must NOT exist");
    assert.equal(registeredTools["delete_contact"], undefined, "delete_contact must NOT exist");
    assert.equal(registeredTools["delete_deal"], undefined, "delete_deal must NOT exist");
    assert.equal(registeredTools["delete_task"], undefined, "delete_task must NOT exist");
    assert.equal(registeredTools["bulk_delete"], undefined, "bulk_delete must NOT exist");
    assert.equal(registeredTools["bulk_update"], undefined, "bulk_update must NOT exist");
  });

  // Read Tool Tests
  it("get_current_user should call /auth/me without accepting arbitrary userId argument", async () => {
    const server = createMcpServer();
    const tool = getRegisteredTools(server)["get_current_user"];

    globalThis.fetch = async (url, options) => {
      lastFetchUrl = String(url);
      lastFetchOptions = options as RequestInit;
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            user: {
              id: "user-real-uuid",
              email: "agent@clixprocrm.com",
              name: "Sales Agent",
              role: "SALES",
              passwordHash: "DO_NOT_EXPOSE_SECRET_HASH",
            },
            activeTenant: { id: "tenant-99", name: "Acme Corp", slug: "acme" },
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    };

    const result = await tool.handler({}, {});
    assert.ok(lastFetchUrl?.includes("/auth/me"));
    assert.equal(result.isError, undefined);

    const parsed = JSON.parse(result.content[0].text);
    assert.equal(parsed.id, "user-real-uuid");
    assert.equal(parsed.email, "agent@clixprocrm.com");
    assert.equal(parsed.role, "SALES");
    assert.equal(parsed.tenant.name, "Acme Corp");
    // Ensure secrets are stripped
    assert.equal(parsed.passwordHash, undefined);
    assert.equal(result.content[0].text.includes("DO_NOT_EXPOSE_SECRET_HASH"), false);
  });

  it("list_leads and list_customers should support query params and cap limit at 50", async () => {
    const server = createMcpServer();
    const listLeads = getRegisteredTools(server)["list_leads"];
    const listCustomers = getRegisteredTools(server)["list_customers"];

    globalThis.fetch = async (url) => {
      lastFetchUrl = String(url);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            leads: [{ id: "lead-1", name: "Alice", email: "alice@example.com" }],
            customers: [{ id: "cust-1", name: "Acme Customer" }],
            pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    };

    // Test list_leads cap
    await listLeads.handler({ limit: 500, search: "Alice" }, {});
    assert.ok(lastFetchUrl?.includes("/crm/leads"));
    assert.ok(lastFetchUrl?.includes("limit=50"));
    assert.ok(lastFetchUrl?.includes("search=Alice"));

    // Test list_customers cap
    await listCustomers.handler({ limit: 500 }, {});
    assert.ok(lastFetchUrl?.includes("/crm/customers"));
    assert.ok(lastFetchUrl?.includes("limit=50"));
  });

  it("get_lead and get_customer should fetch by ID and sanitize results", async () => {
    const server = createMcpServer();
    const getLead = getRegisteredTools(server)["get_lead"];
    const getCustomer = getRegisteredTools(server)["get_customer"];

    globalThis.fetch = async (url) => {
      lastFetchUrl = String(url);
      if (String(url).includes("/crm/leads/lead-42")) {
        return new Response(
          JSON.stringify({
            success: true,
            data: { id: "lead-42", name: "Lead 42", value: "5000" },
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          data: { id: "cust-99", name: "Customer 99", revenue: "10000" },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    };

    const resLead = await getLead.handler({ id: "lead-42" }, {});
    assert.ok(lastFetchUrl?.endsWith("/crm/leads/lead-42"));
    const parsedLead = JSON.parse(resLead.content[0].text);
    assert.equal(parsedLead.id, "lead-42");
    assert.equal(parsedLead.value, 5000);

    const resCust = await getCustomer.handler({ id: "cust-99" }, {});
    assert.ok(lastFetchUrl?.endsWith("/crm/customers/cust-99"));
    const parsedCust = JSON.parse(resCust.content[0].text);
    assert.equal(parsedCust.id, "cust-99");
    assert.equal(parsedCust.revenue, 10000);
  });

  // 1 & 5 & 6: create_lead requires confirmed=true
  it("create_lead should execute only when confirmed=true and call POST /crm/leads", async () => {
    const server = createMcpServer();
    const tool = getRegisteredTools(server)["create_lead"];

    globalThis.fetch = async (url, options) => {
      fetchCallCount++;
      lastFetchUrl = String(url);
      lastFetchOptions = options as RequestInit;
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: "lead-new-123",
            name: "John Doe",
            email: "john@example.com",
            company: "Acme Inc",
            stage: "NEW",
            priority: "HIGH",
            value: 5000,
            passwordHash: "LEAKED_SECRET_HASH",
          },
        }),
        { status: 201, headers: { "content-type": "application/json" } }
      );
    };

    // Case: confirmed = false -> NO API call
    let result = await tool.handler(
      { name: "John Doe", email: "john@example.com", confirmed: false },
      {}
    );
    assert.equal(fetchCallCount, 0, "Fetch must NOT be called when confirmed=false");
    assert.equal(
      result.content[0].text,
      "Confirmation is required before making this CRM change."
    );

    // Case: confirmed = true -> API called
    result = await tool.handler(
      {
        name: "John Doe",
        email: "john@example.com",
        company: "Acme Inc",
        stage: "NEW",
        priority: "HIGH",
        value: 5000,
        confirmed: true,
      },
      {}
    );

    assert.equal(fetchCallCount, 1);
    assert.ok(lastFetchUrl?.includes("/crm/leads"));
    assert.equal(lastFetchOptions?.method, "POST");

    const sentBody = JSON.parse(String(lastFetchOptions?.body));
    assert.equal(sentBody.name, "John Doe");
    assert.equal(sentBody.email, "john@example.com");
    assert.equal(sentBody.company, "Acme Inc");

    const parsedResponse = JSON.parse(result.content[0].text);
    assert.equal(parsedResponse.id, "lead-new-123");
    assert.equal(parsedResponse.name, "John Doe");
    // 18. Sensitive fields stripped
    assert.equal(parsedResponse.passwordHash, undefined);
    assert.equal(result.content[0].text.includes("LEAKED_SECRET_HASH"), false);
  });

  // 2 & 5: update_lead requires confirmed=true
  it("update_lead should execute only when confirmed=true and call PUT /crm/leads/:id", async () => {
    const server = createMcpServer();
    const tool = getRegisteredTools(server)["update_lead"];

    globalThis.fetch = async (url, options) => {
      fetchCallCount++;
      lastFetchUrl = String(url);
      lastFetchOptions = options as RequestInit;
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: "lead-update-456",
            name: "Jane Smith",
            stage: "QUALIFIED",
            notes: "Follow up next Tuesday",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    };

    // Case: confirmed = false -> NO API call
    let result = await tool.handler(
      { id: "lead-update-456", stage: "QUALIFIED", confirmed: false },
      {}
    );
    assert.equal(fetchCallCount, 0);
    assert.equal(
      result.content[0].text,
      "Confirmation is required before making this CRM change."
    );

    // Case: confirmed = true -> API called
    result = await tool.handler(
      {
        id: "lead-update-456",
        stage: "QUALIFIED",
        notes: "Follow up next Tuesday",
        confirmed: true,
      },
      {}
    );

    assert.equal(fetchCallCount, 1);
    assert.ok(lastFetchUrl?.endsWith("/crm/leads/lead-update-456"));
    assert.equal(lastFetchOptions?.method, "PUT");

    const sentBody = JSON.parse(String(lastFetchOptions?.body));
    assert.equal(sentBody.stage, "QUALIFIED");
    assert.equal(sentBody.notes, "Follow up next Tuesday");

    const parsedResponse = JSON.parse(result.content[0].text);
    assert.equal(parsedResponse.id, "lead-update-456");
    assert.equal(parsedResponse.stage, "QUALIFIED");
  });

  // 3 & 5: create_customer requires confirmed=true
  it("create_customer should execute only when confirmed=true and call POST /crm/customers", async () => {
    const server = createMcpServer();
    const tool = getRegisteredTools(server)["create_customer"];

    globalThis.fetch = async (url, options) => {
      fetchCallCount++;
      lastFetchUrl = String(url);
      lastFetchOptions = options as RequestInit;
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: "cust-new-789",
            name: "Alice Wonderland",
            company: "Wonderland Enterprises",
            status: "ACTIVE",
            revenue: 25000,
          },
        }),
        { status: 201, headers: { "content-type": "application/json" } }
      );
    };

    // Case: confirmed = false -> NO API call
    let result = await tool.handler(
      { name: "Alice Wonderland", company: "Wonderland Enterprises", confirmed: false },
      {}
    );
    assert.equal(fetchCallCount, 0);
    assert.equal(
      result.content[0].text,
      "Confirmation is required before making this CRM change."
    );

    // Case: confirmed = true -> API called
    result = await tool.handler(
      {
        name: "Alice Wonderland",
        company: "Wonderland Enterprises",
        email: "alice@wonderland.com",
        status: "ACTIVE",
        revenue: 25000,
        confirmed: true,
      },
      {}
    );

    assert.equal(fetchCallCount, 1);
    assert.ok(lastFetchUrl?.includes("/crm/customers"));
    assert.equal(lastFetchOptions?.method, "POST");

    const sentBody = JSON.parse(String(lastFetchOptions?.body));
    assert.equal(sentBody.name, "Alice Wonderland");
    assert.equal(sentBody.company, "Wonderland Enterprises");

    const parsedResponse = JSON.parse(result.content[0].text);
    assert.equal(parsedResponse.id, "cust-new-789");
    assert.equal(parsedResponse.company, "Wonderland Enterprises");
  });

  // 4 & 5: update_customer requires confirmed=true
  it("update_customer should execute only when confirmed=true and call PUT /customers/:id", async () => {
    const server = createMcpServer();
    const tool = getRegisteredTools(server)["update_customer"];

    globalThis.fetch = async (url, options) => {
      fetchCallCount++;
      lastFetchUrl = String(url);
      lastFetchOptions = options as RequestInit;
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: "cust-update-101",
            name: "Updated Logistics Corp",
            status: "VIP",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    };

    // Case: confirmed = false -> NO API call
    let result = await tool.handler(
      { id: "cust-update-101", status: "VIP", confirmed: false },
      {}
    );
    assert.equal(fetchCallCount, 0);
    assert.equal(
      result.content[0].text,
      "Confirmation is required before making this CRM change."
    );

    // Case: confirmed = true -> API called
    result = await tool.handler(
      {
        id: "cust-update-101",
        name: "Updated Logistics Corp",
        status: "VIP",
        confirmed: true,
      },
      {}
    );

    assert.equal(fetchCallCount, 1);
    assert.ok(lastFetchUrl?.endsWith("/customers/cust-update-101"));
    assert.equal(lastFetchOptions?.method, "PUT");

    const sentBody = JSON.parse(String(lastFetchOptions?.body));
    assert.equal(sentBody.status, "VIP");

    const parsedResponse = JSON.parse(result.content[0].text);
    assert.equal(parsedResponse.id, "cust-update-101");
    assert.equal(parsedResponse.status, "VIP");
  });

  // 7, 8, 9, 10: tenantId, userId, role, permissions cannot be supplied as authorization in input schemas
  it("tools must not accept tenantId, userId, role, or permissions in input schemas", () => {
    const server = createMcpServer();
    const registeredTools = getRegisteredTools(server);

    for (const [toolName, toolDef] of Object.entries(registeredTools)) {
      const inputSchema = toolDef.inputSchema;
      if (inputSchema && typeof inputSchema === "object") {
        const shape = inputSchema.shape || inputSchema;
        assert.equal(
          "tenantId" in shape,
          false,
          `Tool ${toolName} must not have tenantId in inputSchema`
        );
        assert.equal(
          "userId" in shape,
          false,
          `Tool ${toolName} must not have userId in inputSchema`
        );
        assert.equal(
          "role" in shape,
          false,
          `Tool ${toolName} must not have role in inputSchema`
        );
        assert.equal(
          "permissions" in shape,
          false,
          `Tool ${toolName} must not have permissions in inputSchema`
        );
      }
    }
  });

  // 11, 12, 13, 14, 15, 16: Error normalization on write tools
  it("should normalize 400, 401, 403, 404, 409, 429, 500/503 on write tools safely", async () => {
    const server = createMcpServer();
    const tool = getRegisteredTools(server)["create_lead"];

    // 400 Bad Request
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Invalid email format" }), { status: 400 });
    let res = await tool.handler({ name: "A", email: "invalid", confirmed: true }, {});
    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /invalid email format/i);

    // 401 Unauthorized
    globalThis.fetch = async () => new Response("Unauthorized", { status: 401 });
    res = await tool.handler({ name: "A", email: "a@b.com", confirmed: true }, {});
    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /authentication required/i);

    // 403 Forbidden
    globalThis.fetch = async () => new Response("Forbidden", { status: 403 });
    res = await tool.handler({ name: "A", email: "a@b.com", confirmed: true }, {});
    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /permission denied/i);

    // 404 Not Found
    globalThis.fetch = async () => new Response("Not Found", { status: 404 });
    res = await tool.handler({ name: "A", email: "a@b.com", confirmed: true }, {});
    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /not found/i);

    // 409 Conflict
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Lead already exists with this email" }), {
        status: 409,
      });
    res = await tool.handler({ name: "A", email: "a@b.com", confirmed: true }, {});
    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /lead already exists/i);

    // 429 Rate Limit
    globalThis.fetch = async () => new Response("Too Many Requests", { status: 429 });
    res = await tool.handler({ name: "A", email: "a@b.com", confirmed: true }, {});
    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /rate limit/i);

    // 500/503 Service Unavailable without leak
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          error: "Internal Server Error",
          stack: "Error at PrismaClient.execute (/api/src/prisma/prisma.service.ts:120:5)",
          sql: "INSERT INTO \"Lead\" ...",
        }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    res = await tool.handler({ name: "A", email: "a@b.com", confirmed: true }, {});
    assert.equal(res.isError, true);
    assert.equal(res.content[0].text, "CRM service is temporarily unavailable.");
    assert.equal(res.content[0].text.includes("PrismaClient"), false);
    assert.equal(res.content[0].text.includes("INSERT"), false);
  });

  // 17: Mutation timeout is NOT automatically retried and returns safe message
  it("mutation timeout on write tool returns safe unconfirmed message", async () => {
    const server = createMcpServer();
    const tool = getRegisteredTools(server)["create_lead"];

    globalThis.fetch = () =>
      new Promise((_, reject) => {
        const error = new Error("The operation was aborted");
        error.name = "AbortError";
        setTimeout(() => reject(error), 20);
      });

    const res = await tool.handler({ name: "John", email: "john@example.com", confirmed: true }, {});
    assert.equal(res.isError, true);
    assert.equal(
      res.content[0].text,
      "Mutation result could not be confirmed. Please verify the record before retrying."
    );
  });

  // 19: Backend audit system is the only audit authority (verify mcp-server source does not write audit logs)
  it("audit authority: mcp-server does not contain direct audit log writers", () => {
    const srcDir = path.join(__dirname);
    const files = fs.readdirSync(srcDir, { recursive: true }) as string[];

    for (const file of files) {
      if (typeof file === "string" && file.endsWith(".ts") && !file.endsWith(".spec.ts")) {
        const content = fs.readFileSync(path.join(srcDir, file), "utf8");
        assert.equal(
          content.includes("insertAuditLog") || content.includes("createAuditLog"),
          false,
          `Source file ${file} should not write audit logs directly`
        );
      }
    }
  });

  // Database security audit: No Prisma, pg, postgres, direct database dependencies
  it("audit: mcp-server source directory contains no Prisma or direct database dependencies", () => {
    const pkgPath = path.join(__dirname, "../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    assert.equal("prisma" in allDeps, false);
    assert.equal("@prisma/client" in allDeps, false);
    assert.equal("pg" in allDeps, false);
    assert.equal("postgres" in allDeps, false);
    assert.equal("mysql" in allDeps, false);
    assert.equal("typeorm" in allDeps, false);
  });
});
