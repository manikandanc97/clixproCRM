type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

// Simple in-memory rate limiter
export function checkRateLimit(identifier: string, config: RateLimitConfig) {
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

export function incrementRateLimit(identifier: string, config: RateLimitConfig) {
  const now = Date.now();
  const record = store.get(identifier);

  if (record && now <= record.resetTime) {
    record.count++;
  } else {
    store.set(identifier, { count: 1, resetTime: now + config.windowMs });
  }
}

export function resetRateLimit(identifier: string) {
  store.delete(identifier);
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
