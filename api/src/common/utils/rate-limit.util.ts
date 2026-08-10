import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Request } from 'express';

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  REGISTER: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  REFRESH: { maxRequests: 10, windowMs: 15 * 60 * 1000 },
  FORGOT_PASSWORD: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  RESET_PASSWORD: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  DELETE: { maxRequests: 20, windowMs: 60 * 1000 },
  BULK_DELETE: { maxRequests: 5, windowMs: 60 * 1000 },
  IMPORT: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  EXPORT: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  FILE_UPLOAD: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  AI: { maxRequests: 20, windowMs: 60 * 1000 },
  ADMIN: { maxRequests: 60, windowMs: 60 * 1000 },
  SEARCH: { maxRequests: 60, windowMs: 60 * 1000 },
};

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisClient =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

const ratelimiters = new Map<string, Ratelimit>();

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
) {
  if (redisClient) {
    const key = `${config.windowMs}-${config.maxRequests}`;
    let ratelimit = ratelimiters.get(key);

    if (!ratelimit) {
      ratelimit = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(
          config.maxRequests,
          `${config.windowMs} ms`,
        ),
        analytics: true,
      });
      ratelimiters.set(key, ratelimit);
    }

    const { success, reset } = await ratelimit.limit(identifier);
    return { allowed: success, resetTime: reset };
  }

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

export async function incrementRateLimit(
  identifier: string,
  config: RateLimitConfig,
) {
  if (redisClient) {
    const key = `${config.windowMs}-${config.maxRequests}`;
    let ratelimit = ratelimiters.get(key);
    if (!ratelimit) {
      ratelimit = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(
          config.maxRequests,
          `${config.windowMs} ms`,
        ),
      });
      ratelimiters.set(key, ratelimit);
    }
    await ratelimit.limit(identifier);
    return;
  }

  const now = Date.now();
  const record = store.get(identifier);

  if (record && now <= record.resetTime) {
    record.count++;
  } else {
    store.set(identifier, { count: 1, resetTime: now + config.windowMs });
  }
}

export function resetRateLimit(identifier: string) {
  if (!redisClient) {
    store.delete(identifier);
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(',')[0]?.trim();
  }

  if (typeof realIp === 'string') {
    return realIp;
  } else if (Array.isArray(realIp) && realIp.length > 0) {
    return realIp[0];
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
}
