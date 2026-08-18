import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorParam = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  const sendResponse = (targetPath: string, error?: string) => {
    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Authenticating...</title>
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        background: #f8fafc;
        color: #0f172a;
      }
      .card {
        text-align: center;
        background: #ffffff;
        padding: 24px 32px;
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
        border: 1px solid #e2e8f0;
      }
      .spinner {
        width: 28px;
        height: 28px;
        border: 3px solid #e2e8f0;
        border-top: 3px solid #059669;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 12px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      p {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner"></div>
      <p>${error ? 'Authentication failed. Closing window...' : 'Authentication successful! Redirecting...'}</p>
    </div>
    <script>
      (function() {
        var target = "${targetPath}";
        var err = ${error ? JSON.stringify(error) : "null"};
        if (window.opener) {
          try {
            window.opener.postMessage({
              type: err ? 'OAUTH_AUTH_ERROR' : 'OAUTH_AUTH_SUCCESS',
              target: target,
              error: err
            }, window.location.origin);
          } catch(e) {}
          setTimeout(function() {
            window.close();
          }, 300);
        } else {
          window.location.href = target;
        }
      })();
    </script>
  </body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }

  if (errorParam || errorDescription) {
    return sendResponse('/login?error=auth_failed', errorDescription || errorParam || 'OAuth error')
  }
  
  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Exchange code error:', error.message)
      return sendResponse('/login?error=auth_failed', error.message)
    }

    if (session?.user) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (res.ok) {
          return sendResponse('/dashboard')
        } else if (res.status === 403) {
          return sendResponse('/onboarding')
        } else {
          return sendResponse('/login?error=auth_failed', 'Failed to retrieve profile')
        }
      } catch (err) {
        console.error('API connection error during callback:', err);
        return sendResponse('/login?error=server_error', 'Server error')
      }
    }
  }

  // Fallback to login if no code or invalid session
  return sendResponse('/login')
}
