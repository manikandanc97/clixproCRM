import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env if present
dotenv.config();

const configSchema = z.object({
  serverName: z.string().min(1).default("clixprocrm-mcp-server"),
  serverVersion: z.string().min(1).default("0.1.0"),
  crmApiBaseUrl: z
    .string()
    .url({ message: "CRM_API_BASE_URL must be a valid URL (e.g. http://localhost:4000 or https://api.clixprocrm.com)" })
    .default("http://localhost:4000"),
  requestTimeoutMs: z.coerce.number().positive().default(10000),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  mcpRateLimitEnabled: z
    .preprocess((val) => (val === undefined || val === "" ? true : val === "true" || val === true), z.boolean())
    .default(true),
  mcpRateLimitMaxRequests: z.coerce.number().positive().default(60),
  mcpRateLimitWindowMs: z.coerce.number().positive().default(60000),
  mcpMaxPayloadSizeBytes: z.coerce.number().positive().default(102400), // 100 KB
});

export type ServerConfig = z.infer<typeof configSchema>;

export function loadConfig(): ServerConfig {
  const parsed = configSchema.safeParse({
    serverName: process.env.MCP_SERVER_NAME,
    serverVersion: process.env.MCP_SERVER_VERSION,
    crmApiBaseUrl: process.env.CRM_API_BASE_URL,
    requestTimeoutMs: process.env.CRM_REQUEST_TIMEOUT_MS,
    logLevel: process.env.LOG_LEVEL,
    mcpRateLimitEnabled: process.env.MCP_RATE_LIMIT_ENABLED,
    mcpRateLimitMaxRequests: process.env.MCP_RATE_LIMIT_MAX_REQUESTS,
    mcpRateLimitWindowMs: process.env.MCP_RATE_LIMIT_WINDOW_MS,
    mcpMaxPayloadSizeBytes: process.env.MCP_MAX_PAYLOAD_SIZE_BYTES,
  });

  if (!parsed.success) {
    console.error("[MCP Config] Warning: Configuration validation issues detected. Using safe defaults:", parsed.error.format());
    return {
      serverName: "clixprocrm-mcp-server",
      serverVersion: "0.1.0",
      crmApiBaseUrl: "http://localhost:4000",
      requestTimeoutMs: 10000,
      logLevel: "info",
      mcpRateLimitEnabled: true,
      mcpRateLimitMaxRequests: 60,
      mcpRateLimitWindowMs: 60000,
      mcpMaxPayloadSizeBytes: 102400,
    };
  }

  return parsed.data;
}

export const config = loadConfig();

