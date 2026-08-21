import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { crmApiClient } from "../crm-api.client.js";
import { sanitizeUserProfile } from "../serializers/user.serializer.js";
import { CrmApiError } from "../types/api.js";

/**
 * Registers the `get_current_user` read-only MCP tool.
 *
 * Security:
 * - Accepts NO userId or tenantId argument.
 * - The authenticated session determines the identity and permitted tenant context.
 */
export function registerAuthTools(server: McpServer): void {
  server.tool(
    "get_current_user",
    "Get the authenticated user's permitted CRM profile. Security boundary: Identity, tenant context, and permissions are determined exclusively by the authenticated session. Accepts no identity overrides.",
    {},
    async () => {
      try {
        const response = await crmApiClient.request({
          path: "/auth/me",
          method: "GET",
        });

        const safeProfile = sanitizeUserProfile(response.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(safeProfile, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const message =
          err instanceof CrmApiError
            ? err.safeMessage
            : "An unexpected error occurred while retrieving user profile.";

        return {
          isError: true,
          content: [{ type: "text", text: message }],
        };
      }
    }
  );
}
