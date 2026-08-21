/**
 * Types and Error Classes for ClixProCRM MCP API Client.
 *
 * Security Guarantee:
 * Error messages in this layer are strictly sanitized. Internal database traces,
 * SQL errors, stack traces, and backend credentials are NEVER propagated to AI/MCP callers.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface CrmApiRequestOptions {
  /** Relative endpoint path (e.g. "/api/v1/health") */
  path: string;
  /** HTTP verb (default: GET) */
  method?: HttpMethod;
  /** Query parameters */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** JSON payload */
  body?: unknown;
  /**
   * User authentication bearer token passed from the caller/host.
   * NEVER hardcoded, NEVER stored as service-role.
   */
  authToken?: string;
  /** Request timeout in ms (default: 10,000ms) */
  timeoutMs?: number;
  /**
   * Safe, non-secret correlation identifier for request tracing.
   * Must never contain tokens, passwords, or secrets.
   */
  correlationId?: string;
  /** Optional custom headers (sensitive headers will be sanitized before logging) */
  headers?: Record<string, string>;
}

export interface CrmApiResponse<T = unknown> {
  status: number;
  ok: boolean;
  data: T;
  headers: Headers;
}

/**
 * Base sanitized error for all CRM API communication failures.
 */
export class CrmApiError extends Error {
  public readonly isCrmApiError = true;

  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly safeMessage: string,
    public readonly details?: unknown
  ) {
    super(safeMessage);
    this.name = "CrmApiError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 400 Bad Request: Validation failed.
 */
export class CrmValidationError extends CrmApiError {
  constructor(message = "Validation failed: invalid request parameters.") {
    super(400, "VALIDATION_FAILED", message);
    this.name = "CrmValidationError";
  }
}

/**
 * 401 Unauthorized: Valid session credential must be provided.
 */
export class CrmAuthRequiredError extends CrmApiError {
  constructor(message = "Authentication required: valid session credential must be provided.") {
    super(401, "AUTH_REQUIRED", message);
    this.name = "CrmAuthRequiredError";
  }
}

/**
 * 403 Forbidden: Insufficient permissions for the requested operation.
 */
export class CrmForbiddenError extends CrmApiError {
  constructor(message = "Permission denied: insufficient privileges for this operation.") {
    super(403, "PERMISSION_DENIED", message);
    this.name = "CrmForbiddenError";
  }
}

/**
 * 404 Not Found: The requested CRM resource was not found.
 */
export class CrmNotFoundError extends CrmApiError {
  constructor(message = "Resource not found.") {
    super(404, "NOT_FOUND", message);
    this.name = "CrmNotFoundError";
  }
}

/**
 * 409 Conflict: Conflict with current state of the resource.
 */
export class CrmConflictError extends CrmApiError {
  constructor(message = "Conflict: resource already exists or conflict occurred.") {
    super(409, "CONFLICT", message);
    this.name = "CrmConflictError";
  }
}

/**
 * 429 Rate Limit: Rate limit exceeded on CRM API gateway.
 */
export class CrmRateLimitError extends CrmApiError {
  constructor(message = "Rate limit exceeded. Please retry later.") {
    super(429, "RATE_LIMIT_EXCEEDED", message);
    this.name = "CrmRateLimitError";
  }
}

/**
 * 500..599 Service Unavailable: CRM API service temporarily unavailable.
 */
export class CrmServiceUnavailableError extends CrmApiError {
  constructor(message = "CRM service is temporarily unavailable.") {
    super(503, "SERVICE_UNAVAILABLE", message);
    this.name = "CrmServiceUnavailableError";
  }
}

/**
 * Network / Timeout Error: Unable to communicate with CRM API gateway.
 */
export class CrmNetworkError extends CrmApiError {
  constructor(message = "CRM service connection timed out or is unreachable.") {
    super(504, "NETWORK_ERROR", message);
    this.name = "CrmNetworkError";
  }
}

