import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// In-memory token cache for authenticated users (60s TTL)
interface CachedTokenUser {
  user: User;
  expiresAt: number;
}

const tokenUserCache = new Map<string, CachedTokenUser>();
let cachedSupabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (cachedSupabaseClient) return cachedSupabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing');
  }

  cachedSupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedSupabaseClient;
}

// Periodically clean expired tokens to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of tokenUserCache.entries()) {
    if (val.expiresAt <= now) {
      tokenUserCache.delete(key);
    }
  }
}, 60000).unref?.();

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const t0 = performance.now();
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (request.headers.cookie) {
      // Extract from Supabase SSR cookie
      const cookies = request.headers.cookie;
      const match = cookies.match(/(?:^|;)\s*sb-[a-z0-9]+-auth-token=([^;]+)/);
      if (match) {
        try {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          token = parsed[0]; // Next.js SSR typically stores it as a chunked array or JSON
          // Let's also check if it's directly the token string, or base64
          if (typeof token !== 'string') {
            token = parsed.access_token || parsed[0] || '';
          }
        } catch (e) {
          token = decodeURIComponent(match[1]); // Fallback if not JSON
        }
      }
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    const now = Date.now();
    const cached = tokenUserCache.get(token);
    if (cached && cached.expiresAt > now) {
      request.user = cached.user;
      const dur = performance.now() - t0;
      console.log(`[PROFILE: SupabaseAuthGuard] Token CACHED hit in ${dur.toFixed(2)} ms`);
      return true;
    }

    const tApi0 = performance.now();
    const supabase = getSupabaseClient();
    const { data, error } = await (supabase.auth as any).getClaims(token);
    const tApi1 = performance.now();

    if (error || !data?.claims) {
      tokenUserCache.delete(token);
      throw new UnauthorizedException(
        error?.message || 'Invalid or expired authentication token',
      );
    }

    const claims: any = data.claims;
    const user: any = {
      id: claims.sub,
      sub: claims.sub,
      email: claims.email,
      user_metadata: claims.user_metadata || {},
      app_metadata: claims.app_metadata || {},
      role: claims.role,
      aud: claims.aud,
      ...claims,
    };

    // Cache valid user for 60 seconds
    tokenUserCache.set(token, {
      user,
      expiresAt: now + 60000,
    });

    request.user = user;
    const totalDur = performance.now() - t0;
    console.log(`[PROFILE: SupabaseAuthGuard] Verified claims in ${(tApi1 - tApi0).toFixed(2)} ms (Total guard: ${totalDur.toFixed(2)} ms)`);
    return true;
  }
}

