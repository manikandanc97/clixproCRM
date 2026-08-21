import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAuthTools } from "./auth.tools.js";
import { registerLeadsTools } from "./leads.tools.js";
import { registerCustomersTools } from "./customers.tools.js";

/**
 * Registers all authorized CRM tools onto the MCP server.
 *
 * Registered Tools (Step 4):
 * Read Tools:
 * 1. get_current_user
 * 2. list_leads
 * 3. get_lead
 * 4. list_customers
 * 5. get_customer
 *
 * Controlled Write Tools (Explicit confirmation required):
 * 6. create_lead
 * 7. update_lead
 * 8. create_customer
 * 9. update_customer
 *
 * NOTE: Destructive operations (delete_lead, delete_customer, delete_deal, bulk_delete)
 * are STRICTLY excluded.
 */
export function registerCrmTools(server: McpServer): void {
  registerAuthTools(server);
  registerLeadsTools(server);
  registerCustomersTools(server);
}

