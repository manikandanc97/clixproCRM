import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config.js";
import { registerCrmTools } from "./tools/index.js";

/**
 * Creates and initializes the ClixProCRM MCP Server with authorized read-only CRM tools.
 *
 * NOTE (Step 3 - Read-Only Tools):
 * - Registers get_current_user, list_leads, get_lead, list_customers, get_customer.
 * - All requests are routed through CrmApiClient to the authorized ClixProCRM API.
 * - No direct DB or write tools.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: config.serverName,
      version: config.serverVersion,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
        logging: {},
      },
    }
  );

  // Register authorized read-only CRM tools
  registerCrmTools(server);

  return server;
}

/**
 * Starts the MCP Server using the standard stdio transport.
 */
export async function startServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();

  const handleShutdown = async (signal: string) => {
    console.error(`[MCP Server] Received ${signal}. Shutting down cleanly...`);
    try {
      await server.close();
    } catch (err) {
      console.error("[MCP Server] Error during shutdown:", err);
    }
    process.exit(0);
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));

  await server.connect(transport);
  console.error(
    `[MCP Server] ${config.serverName} v${config.serverVersion} initialized and listening on stdio.`
  );
}

// Auto-start server when executed directly as entrypoint (not when imported in test suites)
const isDirectEntry =
  Boolean(process.argv[1]) &&
  (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.js")) &&
  !process.argv.some((arg) => arg.includes("--test") || arg.includes("spec"));

if (isDirectEntry) {
  startServer().catch((error) => {
    console.error("[MCP Server] Fatal initialization error:", error);
    process.exit(1);
  });
}
