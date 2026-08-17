import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

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

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    if (user && !(user as any).sub) {
      (user as any).sub = user.id;
    }
    request.user = user;
    return true;
  }
}
