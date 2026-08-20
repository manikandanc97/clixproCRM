import { URL } from 'url';

const ALLOWED_REDIRECT_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://clixprocrm.vercel.app',
]);

/**
 * Validates and sanitizes a redirect target URL to prevent open redirect vulnerabilities.
 */
export function sanitizeRedirectUrl(
  redirectUrl: string | undefined | null,
  fallback: string = '/dashboard',
): string {
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return fallback;
  }

  const trimmed = redirectUrl.trim();
  if (!trimmed) return fallback;

  // 1. Safe Relative Path Check
  // Must start with '/' but not '//' (protocol-relative) or '/\' (browser evasion)
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\') &&
    !trimmed.includes('javascript:') &&
    !trimmed.includes('data:')
  ) {
    return trimmed;
  }

  // 2. Absolute URL Check against allowed origins
  try {
    const parsed = new URL(trimmed);
    const origin = parsed.origin.toLowerCase();

    if (
      ALLOWED_REDIRECT_ORIGINS.has(origin) ||
      origin.endsWith('.vercel.app') ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
    ) {
      return trimmed;
    }
  } catch {
    // Invalid URL format
  }

  return fallback;
}
