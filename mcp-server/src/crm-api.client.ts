import crypto from "node:crypto";
import { config } from "./config.js";
import { mcpRateLimiter } from "./security/rate-limiter.js";
import { getActiveSessionContext } from "./security/session-context.js";
import {
  CrmApiError,
  CrmApiResponse,
  CrmApiRequestOptions,
  CrmValidationError,
  CrmAuthRequiredError,
  CrmForbiddenError,
  CrmNotFoundError,
  CrmConflictError,
  CrmRateLimitError,
  CrmServiceUnavailableError,
  CrmNetworkError,
} from "./types/api.js";

/**
 * Sensitive header keys that MUST be redacted from all log outputs and diagnostics.
 */
const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "apikey",
  "x-supabase-auth",
  "x-session-id",
  "x-session-token",
  "session-token",
  "x-auth-token",
  "x-refresh-token",
  "proxy-authorization",
  "x-supabase-key",
  "x-supabase-service-key",
  "private-key",
  "jwt",
  "access-token",
  "refresh-token",
]);

/**
 * Pattern matching JWT structures or secret markers to prevent accidental leakage in errors/correlation IDs.
 */
const JWT_PATTERN = /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]*/g;
const SENSITIVE_KEYWORD_PATTERN = /(bearer|eyj|token|secret|password|auth|jwt|session|private|supabase|service_role)/i;

/**
 * Database internal error signature markers that MUST NEVER leak to callers.
 */
const DB_INTERNAL_PATTERNS = [
  /prismaclient/i,
  /syntax error at or near/i,
  /select\s+.+\s+from/i,
  /insert\s+into/i,
  /update\s+.+\s+set/i,
  /delete\s+from/i,
  /pg_\w+/i,
  /relation\s+".+"\s+does not exist/i,
  /unique constraint/i,
  /foreign key constraint/i,
  /connection refused/i,
  /econnrefused/i,
  /[a-z]:\\(?:[\w.-]+\\)+[\w.-]+/i, // Windows file path
  /\/(?:home|usr|app|api|src|root)\/[\w.-]+/i, // Unix file path
];

/**
 * Sanitizes or generates a safe, non-secret correlation ID.
 */
export function sanitizeOrGenerateCorrelationId(input?: string): string {
  if (input && typeof input === "string") {
    const trimmed = input.trim();
    // Validate length and safe characters (alphanumeric, hyphens, underscores, dots)
    const isSafeFormat = /^[a-zA-Z0-9_.\-:]{1,128}$/.test(trimmed);
    const containsSecrets = SENSITIVE_KEYWORD_PATTERN.test(trimmed);

    if (isSafeFormat && !containsSecrets) {
      return trimmed;
    }
  }
  // Generate safe fallback UUID correlation ID
  return `req_${crypto.randomUUID()}`;
}

/**
 * Strips secrets, JWT tokens, and internal database stack traces from string messages.
 */
export function scrubSensitiveText(text: string): string {
  if (!text) return "";
  let scrubbed = text.replace(JWT_PATTERN, "[REDACTED_TOKEN]");

  for (const pattern of DB_INTERNAL_PATTERNS) {
    if (pattern.test(scrubbed)) {
      return "An internal system error occurred.";
    }
  }

  return scrubbed;
}

/**
 * Typed HTTP Client for secure MCP → ClixProCRM API communication.
 *
 * Security Principles:
 * 1. Zero Direct DB: Strictly communicates over HTTP/HTTPS with the NestJS API gateway.
 * 2. Credential Forwarding Only: Never generates tokens, never stores user passwords or service-role keys.
 * 3. Sanitized Logging: Redacts authorization headers, bearer tokens, and sensitive query keys.
 * 4. Error Normalization: Converts backend failures into safe, standardized errors without leaking internals.
 * 5. MCP Rate Limiting: Safeguards against runaway AI loops and request flooding.
 * 6. Mutation Protection: Never blindly retries timed-out or failed POST/PUT mutations.
 * 7. Request Size Limits: Rejects oversized bodies and query payloads before dispatch.
 */
export class CrmApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;

  constructor(options?: { baseUrl?: string; defaultTimeoutMs?: number }) {
    this.baseUrl = (options?.baseUrl || config.crmApiBaseUrl).replace(/\/+$/, "");
    this.defaultTimeoutMs = options?.defaultTimeoutMs || config.requestTimeoutMs;
  }

  /**
   * Constructs a sanitized URL given the base URL, endpoint path, and query parameters.
   */
  public buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined | null>
  ): URL {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url;
  }

  /**
   * Sanitizes header map for safe diagnostics/logging without exposing sensitive credentials.
   */
  public sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [key, val] of Object.entries(headers)) {
      if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = scrubSensitiveText(val);
      }
    }
    return sanitized;
  }

  /**
   * Executes an authenticated or unauthenticated HTTP request against the CRM API gateway.
   */
  public async request<T = unknown>(options: CrmApiRequestOptions): Promise<CrmApiResponse<T>> {
    // 1. MCP Client-Side Rate Limit Safety Guard
    mcpRateLimiter.assertWithinLimit();

    const method = options.method || "GET";
    const targetUrl = this.buildUrl(options.path, options.query);
    const timeoutMs = options.timeoutMs || this.defaultTimeoutMs;

    // 2. Query Size Safety Guard
    if (targetUrl.search.length > 8192) {
      throw new CrmValidationError("Request query parameters exceed maximum allowed size.");
    }

    // 3. Correlation ID & Session Token Resolution
    const activeContext = getActiveSessionContext();
    const incomingCorrelationId =
      options.correlationId ||
      activeContext?.correlationId ||
      options.headers?.["x-correlation-id"] ||
      options.headers?.["X-Correlation-ID"] ||
      options.headers?.["x-request-id"] ||
      options.headers?.["X-Request-ID"];
    const safeCorrelationId = sanitizeOrGenerateCorrelationId(incomingCorrelationId);

    const requestHeaders: Record<string, string> = {
      Accept: "application/json",
      "X-Correlation-ID": safeCorrelationId,
      "X-Request-ID": safeCorrelationId,
      ...(options.headers || {}),
    };

    // Forward Bearer token if provided by options or active session context
    const token = options.authToken || activeContext?.authToken;
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    // 4. Request Body Size Safety Guard
    let bodyPayload: string | undefined;
    if (options.body !== undefined && method !== "GET") {
      requestHeaders["Content-Type"] = "application/json";
      bodyPayload = typeof options.body === "string" ? options.body : JSON.stringify(options.body);

      const byteLength = Buffer.byteLength(bodyPayload, "utf8");
      if (byteLength > config.mcpMaxPayloadSizeBytes) {
        throw new CrmValidationError(
          `Request payload (${byteLength} bytes) exceeds maximum allowed limit of ${config.mcpMaxPayloadSizeBytes} bytes.`
        );
      }
    }

    // Prepare abort controller for request timeout
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(targetUrl.toString(), {
        method,
        headers: requestHeaders,
        body: bodyPayload,
        signal: controller.signal,
      });

      clearTimeout(timeoutHandle);

      if (!response.ok) {
        throw await this.normalizeHttpError(response);
      }

      // Safe JSON parsing with fallback for empty/text bodies
      let data: T;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = (await response.json()) as T;
      } else {
        const text = await response.text();
        data = (text ? { message: scrubSensitiveText(text) } : {}) as T;
      }

      return {
        status: response.status,
        ok: response.ok,
        data,
        headers: response.headers,
      };
    } catch (error: unknown) {
      clearTimeout(timeoutHandle);

      if (error instanceof CrmApiError) {
        throw error;
      }

      // Check for Abort / Timeout error
      if (
        (error instanceof Error && error.name === "AbortError") ||
        (error instanceof Error && error.name === "TimeoutError")
      ) {
        if (method !== "GET") {
          throw new CrmNetworkError(
            "Mutation result could not be confirmed. Please verify the record before retrying."
          );
        }
        throw new CrmNetworkError(`CRM API request timed out after ${timeoutMs}ms.`);
      }

      // Network / Fetch transport errors
      const rawErrorMessage = error instanceof Error ? error.message : "Network error occurred";
      const safeErrorMsg = scrubSensitiveText(rawErrorMessage);
      console.error(`[CRM API Client] Connection failure to ${method} ${options.path}:`, safeErrorMsg);

      if (method !== "GET") {
        throw new CrmNetworkError(
          "Mutation result could not be confirmed. Please verify the record before retrying."
        );
      }
      throw new CrmNetworkError("CRM service connection failed or is unreachable.");
    }
  }

  /**
   * Normalizes non-2xx HTTP responses into safe, standardized CrmApiError instances.
   * Prevents internal SQL, Prisma, or backend stack traces from leaking to caller.
   */
  private async normalizeHttpError(response: Response): Promise<CrmApiError> {
    const status = response.status;
    let serverMessage: string | undefined;

    try {
      const errorJson = (await response.json()) as Record<string, unknown>;
      if (typeof errorJson?.message === "string") {
        serverMessage = errorJson.message;
      } else if (Array.isArray(errorJson?.message) && typeof errorJson.message[0] === "string") {
        serverMessage = errorJson.message.join(", ");
      }
    } catch {
      // Body was not JSON or failed to parse; safe fallback
    }

    // Clean server message from sensitive content, database errors, or stack traces
    const cleanMessage = serverMessage ? scrubSensitiveText(serverMessage) : undefined;

    switch (status) {
      case 400:
        return new CrmValidationError(
          cleanMessage || "Validation failed: invalid request parameters."
        );
      case 401:
        return new CrmAuthRequiredError(
          cleanMessage || "Authentication required: valid session credential must be provided."
        );
      case 403:
        return new CrmForbiddenError(
          cleanMessage || "Permission denied: insufficient privileges for this operation."
        );
      case 404:
        return new CrmNotFoundError(cleanMessage || "Resource not found.");
      case 409:
        return new CrmConflictError(
          cleanMessage || "Conflict: resource already exists or conflict occurred."
        );
      case 429:
        return new CrmRateLimitError(cleanMessage || "Rate limit exceeded. Please retry later.");
      case 500:
      case 502:
      case 503:
      case 504:
        return new CrmServiceUnavailableError("CRM service is temporarily unavailable.");
      default:
        return new CrmApiError(
          status,
          `HTTP_${status}`,
          cleanMessage || `CRM API responded with status ${status}.`
        );
    }
  }

  /**
   * Internal non-throwing health check probe for diagnostic monitoring.
   */
  public async checkHealth(): Promise<{ healthy: boolean; status?: number; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const response = await this.request<{ status?: string }>({
        path: "/health",
        method: "GET",
        timeoutMs: 3000,
      });
      return {
        healthy: response.ok,
        status: response.status,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      const safeMessage = err instanceof CrmApiError ? err.safeMessage : "Connection failed";
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: safeMessage,
      };
    }
  }
}

export const crmApiClient = new CrmApiClient();

