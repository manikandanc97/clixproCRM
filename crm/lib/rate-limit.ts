import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

// Fallback in-memory store
const store = new Map<string, RateLimitRecord>();

// Initialize Upstash Redis if available
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisClient = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Cache for ratelimit instances
const ratelimiters = new Map<string, Ratelimit>();

export async function checkRateLimit(identifier: string, config: RateLimitConfig) {
  if (redisClient) {
    const key = `${config.windowMs}-${config.maxRequests}`;
    let ratelimit = ratelimiters.get(key);
    
    if (!ratelimit) {
      ratelimit = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowMs} ms`),
        analytics: true,
      });
      ratelimiters.set(key, ratelimit);
    }

    const { success, reset } = await ratelimit.limit(identifier);
    return { allowed: success, resetTime: reset };
  }

  // Fallback to in-memory
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    return { allowed: true, resetTime: now + config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, resetTime: record.resetTime };
  }

  return { allowed: true, resetTime: record.resetTime };
}

export async function incrementRateLimit(identifier: string, config: RateLimitConfig) {
  if (redisClient) {
    // Upstash Ratelimit automatically increments within checkRateLimit, 
    // but if we need a manual increment we can call limit() without failing.
    const key = `${config.windowMs}-${config.maxRequests}`;
    let ratelimit = ratelimiters.get(key);
    if (!ratelimit) {
      ratelimit = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowMs} ms`),
      });
      ratelimiters.set(key, ratelimit);
    }
    await ratelimit.limit(identifier);
    return;
  }

  // Fallback
  const now = Date.now();
  const record = store.get(identifier);

  if (record && now <= record.resetTime) {
    record.count++;
  } else {
    store.set(identifier, { count: 1, resetTime: now + config.windowMs });
  }
}

export function resetRateLimit(identifier: string) {
  if (redisClient) {
    // Cannot easily delete sliding window keys in Upstash without knowing the exact internal keys,
    // but for simple scenarios we might skip this or use a prefix deletion if necessary.
  } else {
    store.delete(identifier);
  }
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
