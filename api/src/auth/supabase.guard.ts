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
      return true;
    }

    const supabase = getSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      tokenUserCache.delete(token);
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    if (user && !(user as any).sub) {
      (user as any).sub = user.id;
    }

    // Cache valid user for 60 seconds
    tokenUserCache.set(token, {
      user,
      expiresAt: now + 60000,
    });

    request.user = user;
    return true;
  }
}

