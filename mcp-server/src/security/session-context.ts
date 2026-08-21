import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Session context structure passed through MCP tool executions.
 *
 * Security Boundary:
 * - Scoped strictly per-request using Node's AsyncLocalStorage.
 * - Forwards Bearer token and correlation ID from the authenticated user's session.
 * - Never leaks across concurrent asynchronous requests or background workers.
 */
export interface McpSessionContext {
  authToken?: string;
  tenantId?: string;
  userId?: string;
  correlationId?: string;
}

const sessionContextStore = new AsyncLocalStorage<McpSessionContext>();

/**
 * Retrieves the active session context for the currently executing async execution chain.
 */
export function getActiveSessionContext(): McpSessionContext | undefined {
  return sessionContextStore.getStore();
}

/**
 * Runs a function within the isolated scope of a specific session context.
 */
export function runWithSessionContext<T>(
  context: McpSessionContext,
  fn: () => Promise<T>
): Promise<T> {
  return sessionContextStore.run(context, fn);
}
