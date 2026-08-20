export interface SessionTimeoutConfig {
  idleTimeoutMs: number;
  absoluteTimeoutMs: number;
  lastActiveThrottleMs: number;
}

export function getSessionTimeoutConfig(): SessionTimeoutConfig {
  const idleMinutes = parseInt(process.env.IDLE_SESSION_TIMEOUT_MINUTES || '30', 10);
  const absoluteHours = parseInt(process.env.ABSOLUTE_SESSION_TIMEOUT_HOURS || '24', 10);
  const throttleSeconds = parseInt(process.env.SESSION_ACTIVITY_THROTTLE_SECONDS || '60', 10);

  // Validate configuration strictly — fallback to secure defaults if invalid/negative
  const idleTimeoutMs =
    Number.isFinite(idleMinutes) && idleMinutes > 0
      ? idleMinutes * 60 * 1000
      : 30 * 60 * 1000; // default 30 minutes

  const absoluteTimeoutMs =
    Number.isFinite(absoluteHours) && absoluteHours > 0
      ? absoluteHours * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000; // default 24 hours

  const lastActiveThrottleMs =
    Number.isFinite(throttleSeconds) && throttleSeconds > 0
      ? throttleSeconds * 1000
      : 60 * 1000; // default 60 seconds

  return {
    idleTimeoutMs,
    absoluteTimeoutMs,
    lastActiveThrottleMs,
  };
}
