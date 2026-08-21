import { config } from "../config.js";
import { CrmRateLimitError } from "../types/api.js";

/**
 * In-memory sliding window rate limiter for MCP tool requests.
 *
 * Security Purpose:
 * - Prevents accidental AI tool loops, infinite recursion, and rapid request flooding.
 * - Operates entirely locally in MCP memory as a client-side safety guard.
 * - Does NOT replace or weaken backend NestJS ThrottlerGuard / rate limiting.
 */
export class McpRateLimiter {
  private readonly requestTimestamps: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private enabled: boolean;

  constructor(options?: { maxRequests?: number; windowMs?: number; enabled?: boolean }) {
    this.maxRequests = options?.maxRequests ?? config.mcpRateLimitMaxRequests;
    this.windowMs = options?.windowMs ?? config.mcpRateLimitWindowMs;
    this.enabled = options?.enabled ?? config.mcpRateLimitEnabled;
  }

  /**
   * Reconfigures the rate limiter parameters (useful in testing).
   */
  public configure(options: { maxRequests?: number; windowMs?: number; enabled?: boolean }): void {
    if (options.maxRequests !== undefined) this.maxRequests = options.maxRequests;
    if (options.windowMs !== undefined) this.windowMs = options.windowMs;
    if (options.enabled !== undefined) this.enabled = options.enabled;
  }

  /**
   * Resets all stored timestamp buckets.
   */
  public reset(): void {
    this.requestTimestamps.clear();
  }

  /**
   * Checks if a request for the given key is allowed under the rate limit.
   */
  public checkLimit(key = "global"): { allowed: boolean; remaining: number; resetMs: number } {
    if (!this.enabled) {
      return { allowed: true, remaining: this.maxRequests, resetMs: 0 };
    }

    const now = Date.now();
    const cutoff = now - this.windowMs;

    let timestamps = this.requestTimestamps.get(key);
    if (!timestamps) {
      timestamps = [];
      this.requestTimestamps.set(key, timestamps);
    }

    // Filter out timestamps outside the sliding window
    timestamps = timestamps.filter((ts) => ts > cutoff);
    this.requestTimestamps.set(key, timestamps);

    if (timestamps.length >= this.maxRequests) {
      const oldestInWindow = timestamps[0];
      const resetMs = Math.max(0, oldestInWindow + this.windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    // Record this request
    timestamps.push(now);
    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      resetMs: this.windowMs,
    };
  }

  /**
   * Asserts that the request is within rate limits. Throws CrmRateLimitError if exceeded.
   */
  public assertWithinLimit(key = "global"): void {
    const result = this.checkLimit(key);
    if (!result.allowed) {
      throw new CrmRateLimitError(
        `MCP client rate limit exceeded (${this.maxRequests} req / ${this.windowMs}ms). Please slow down tool requests.`
      );
    }
  }
}

export const mcpRateLimiter = new McpRateLimiter();
