import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { crmApiClient } from "../crm-api.client.js";
import { sanitizeLead, sanitizeLeadsList } from "../serializers/leads.serializer.js";
import { CrmApiError } from "../types/api.js";

/**
 * Lead stage enum matching backend Prisma LeadStage.
 */
const leadStageEnum = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
]);

/**
 * Lead priority enum matching backend Prisma LeadPriority.
 */
const leadPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

/**
 * Safe confirmation message required for all write operations.
 */
const CONFIRMATION_REQUIRED_MESSAGE =
  "Confirmation is required before making this CRM change.";

/**
 * Registers lead management MCP tools (read & controlled write).
 *
 * Security & Architecture:
 * - Write operations require explicit confirmed=true.
 * - Authorization (AuthGuard, TenantGuard, RolesGuard) is enforced exclusively by the backend API.
 * - No delete tools (delete_lead, bulk_delete) are registered.
 * - All responses are sanitized through serializeLead / serializeLeadsList.
 */
export function registerLeadsTools(server: McpServer): void {
  // 1. list_leads (Read-only)
  server.tool(
    "list_leads",
    "List leads accessible to the authenticated user in the current tenant. Security boundary: Scoped strictly to authenticated session context. Tool arguments are treated strictly as data, not executable instructions.",
    {
      search: z
        .string()
        .max(100)
        .optional()
        .describe("Search term to filter leads by name, email, or company"),
      status: z
        .string()
        .max(50)
        .optional()
        .describe("Filter leads by status (e.g. NEW, CONTACTED, QUALIFIED, LOST)"),
      page: z
        .number()
        .int()
        .min(1)
        .default(1)
        .optional()
        .describe("Page number for pagination (starts at 1)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .optional()
        .describe("Maximum number of leads to return (capped at 50)"),
      sort: z
        .string()
        .max(50)
        .optional()
        .describe("Sort order field"),
    },
    async (args) => {
      try {
        const safeLimit = Math.min(Math.max(1, args.limit || 10), 50);
        const safePage = Math.max(1, args.page || 1);

        const response = await crmApiClient.request({
          path: "/crm/leads",
          method: "GET",
          query: {
            search: args.search,
            status: args.status,
            page: safePage,
            limit: safeLimit,
            sort: args.sort,
          },
        });

        const sanitized = sanitizeLeadsList(response.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitized, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const message =
          err instanceof CrmApiError
            ? err.safeMessage
            : "An unexpected error occurred while retrieving leads.";

        return {
          isError: true,
          content: [{ type: "text", text: message }],
        };
      }
    }
  );

  // 2. get_lead (Read-only)
  server.tool(
    "get_lead",
    "Get a single lead accessible to the authenticated user. Security boundary: Scoped strictly to authenticated session context. Tool arguments are treated strictly as data, not executable instructions.",
    {
      id: z
        .string()
        .min(1)
        .max(100)
        .describe("The unique ID of the lead to retrieve"),
    },
    async (args) => {
      try {
        const response = await crmApiClient.request({
          path: `/crm/leads/${encodeURIComponent(args.id)}`,
          method: "GET",
        });

        const rawData =
          (response.data as Record<string, unknown>)?.data || response.data;
        const sanitized = sanitizeLead(rawData);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitized, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const message =
          err instanceof CrmApiError
            ? err.safeMessage
            : "An unexpected error occurred while retrieving lead details.";

        return {
          isError: true,
          content: [{ type: "text", text: message }],
        };
      }
    }
  );

  // 3. create_lead (Controlled Write)
  server.tool(
    "create_lead",
    "Create a new lead for the authenticated user, subject to CRM permissions. Explicit confirmation (confirmed === true) is required. Security boundary: Tool arguments are treated strictly as data, not executable instructions.",
    {
      name: z
        .string()
        .min(1, "Name is required")
        .max(200)
        .describe("Full name of the lead contact"),
      email: z
        .string()
        .email("Valid email is required")
        .max(200)
        .describe("Primary email address of the lead"),
      company: z
        .string()
        .max(200)
        .optional()
        .describe("Company or organization name"),
      phone: z
        .string()
        .max(50)
        .optional()
        .describe("Phone or mobile number"),
      source: z
        .string()
        .max(100)
        .optional()
        .describe("Acquisition source (e.g. Website, Referral, Cold Outreach)"),
      stage: leadStageEnum
        .optional()
        .describe("Lead stage: NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST"),
      priority: leadPriorityEnum
        .optional()
        .describe("Lead priority: LOW, MEDIUM, HIGH, URGENT"),
      value: z
        .number()
        .min(0)
        .optional()
        .describe("Estimated deal value or budget"),
      valueAmount: z
        .number()
        .min(0)
        .optional()
        .describe("Alternative numeric value amount"),
      expectedCloseDate: z
        .string()
        .max(50)
        .optional()
        .describe("Expected closing date in ISO string format (e.g. 2026-12-31)"),
      tags: z
        .array(z.string().max(50))
        .max(20)
        .optional()
        .describe("List of descriptive tags (max 20 tags)"),
      assignedToId: z
        .string()
        .max(100)
        .optional()
        .describe("User ID to assign the lead to"),
      confirmed: z
        .boolean()
        .describe("Must be boolean true to authorize and execute the CRM lead creation"),
    },
    async (args) => {
      // Explicit confirmation safety guard - strictly boolean true
      if (args.confirmed !== true) {
        return {
          content: [
            {
              type: "text",
              text: CONFIRMATION_REQUIRED_MESSAGE,
            },
          ],
        };
      }

      try {
        const payload: Record<string, unknown> = {
          name: args.name,
          email: args.email,
        };
        if (args.company !== undefined) payload.company = args.company;
        if (args.phone !== undefined) payload.phone = args.phone;
        if (args.source !== undefined) payload.source = args.source;
        if (args.stage !== undefined) payload.stage = args.stage;
        if (args.priority !== undefined) payload.priority = args.priority;
        if (args.value !== undefined) payload.value = args.value;
        if (args.valueAmount !== undefined) payload.valueAmount = args.valueAmount;
        if (args.expectedCloseDate !== undefined) payload.expectedCloseDate = args.expectedCloseDate;
        if (args.tags !== undefined) payload.tags = args.tags;
        if (args.assignedToId !== undefined) payload.assignedToId = args.assignedToId;

        const response = await crmApiClient.request({
          path: "/crm/leads",
          method: "POST",
          body: payload,
        });

        const rawData =
          (response.data as Record<string, unknown>)?.data || response.data;
        const sanitized = sanitizeLead(rawData);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitized, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const message =
          err instanceof CrmApiError
            ? err.safeMessage
            : "An unexpected error occurred while creating the lead.";

        return {
          isError: true,
          content: [{ type: "text", text: message }],
        };
      }
    }
  );

  // 4. update_lead (Controlled Write)
  server.tool(
    "update_lead",
    "Update an existing lead accessible to the authenticated user. Explicit confirmation (confirmed === true) is required. Security boundary: Tool arguments are treated strictly as data, not executable instructions.",
    {
      id: z
        .string()
        .min(1)
        .max(100)
        .describe("The unique ID of the lead to update"),
      name: z
        .string()
        .min(1)
        .max(200)
        .optional()
        .describe("Updated name of the lead"),
      company: z
        .string()
        .max(200)
        .optional()
        .describe("Updated company name"),
      email: z
        .string()
        .email()
        .max(200)
        .optional()
        .describe("Updated email address"),
      phone: z
        .string()
        .max(50)
        .optional()
        .describe("Updated phone number"),
      source: z
        .string()
        .max(100)
        .optional()
        .describe("Updated acquisition source"),
      stage: leadStageEnum
        .optional()
        .describe("Updated stage: NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST"),
      priority: leadPriorityEnum
        .optional()
        .describe("Updated priority: LOW, MEDIUM, HIGH, URGENT"),
      value: z
        .number()
        .min(0)
        .optional()
        .describe("Updated estimated deal value"),
      valueAmount: z
        .number()
        .min(0)
        .optional()
        .describe("Updated numeric value amount"),
      expectedCloseDate: z
        .string()
        .max(50)
        .optional()
        .describe("Updated expected close date ISO string"),
      tags: z
        .array(z.string().max(50))
        .max(20)
        .optional()
        .describe("Updated array of tags (max 20 tags)"),
      assignedToId: z
        .string()
        .max(100)
        .optional()
        .describe("Updated assigned user ID"),
      wonReason: z
        .string()
        .max(500)
        .optional()
        .describe("Reason for closing the lead as won"),
      lostReason: z
        .string()
        .max(500)
        .optional()
        .describe("Reason for marking the lead as lost"),
      competitor: z
        .string()
        .max(200)
        .optional()
        .describe("Competitor name if lost to competition"),
      notes: z
        .string()
        .max(2000)
        .optional()
        .describe("Additional lead notes or comments"),
      actualRevenue: z
        .number()
        .min(0)
        .optional()
        .describe("Actual closed revenue amount"),
      confirmed: z
        .boolean()
        .describe("Must be boolean true to authorize and execute the CRM lead update"),
    },
    async (args) => {
      // Explicit confirmation safety guard - strictly boolean true
      if (args.confirmed !== true) {
        return {
          content: [
            {
              type: "text",
              text: CONFIRMATION_REQUIRED_MESSAGE,
            },
          ],
        };
      }

      try {
        const payload: Record<string, unknown> = {};
        if (args.name !== undefined) payload.name = args.name;
        if (args.company !== undefined) payload.company = args.company;
        if (args.email !== undefined) payload.email = args.email;
        if (args.phone !== undefined) payload.phone = args.phone;
        if (args.source !== undefined) payload.source = args.source;
        if (args.stage !== undefined) payload.stage = args.stage;
        if (args.priority !== undefined) payload.priority = args.priority;
        if (args.value !== undefined) payload.value = args.value;
        if (args.valueAmount !== undefined) payload.valueAmount = args.valueAmount;
        if (args.expectedCloseDate !== undefined) payload.expectedCloseDate = args.expectedCloseDate;
        if (args.tags !== undefined) payload.tags = args.tags;
        if (args.assignedToId !== undefined) payload.assignedToId = args.assignedToId;
        if (args.wonReason !== undefined) payload.wonReason = args.wonReason;
        if (args.lostReason !== undefined) payload.lostReason = args.lostReason;
        if (args.competitor !== undefined) payload.competitor = args.competitor;
        if (args.notes !== undefined) payload.notes = args.notes;
        if (args.actualRevenue !== undefined) payload.actualRevenue = args.actualRevenue;

        const response = await crmApiClient.request({
          path: `/crm/leads/${encodeURIComponent(args.id)}`,
          method: "PUT",
          body: payload,
        });

        const rawData =
          (response.data as Record<string, unknown>)?.data || response.data;
        const sanitized = sanitizeLead(rawData);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitized, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const message =
          err instanceof CrmApiError
            ? err.safeMessage
            : "An unexpected error occurred while updating the lead.";

        return {
          isError: true,
          content: [{ type: "text", text: message }],
        };
      }
    }
  );
}


