import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorParam = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  const sendResponse = (targetPath: string, error?: string) => {
    const isError = Boolean(error);
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ClixProCRM Authentication</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #0f172a;
        color: #f8fafc;
        padding: 20px;
      }
      .card {
        text-align: center;
        background: #1e293b;
        padding: 32px 28px;
        border-radius: 20px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        max-width: 360px;
        width: 100%;
      }
      .icon-container {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        background: ${isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'};
      }
      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top: 3px solid #10b981;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      .error-icon {
        color: #ef4444;
        font-size: 24px;
        font-weight: bold;
      }
      .success-icon {
        color: #10b981;
        font-size: 24px;
        font-weight: bold;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      h2 {
        font-size: 17px;
        font-weight: 600;
        margin-bottom: 6px;
        color: #f8fafc;
      }
      p {
        font-size: 13px;
        color: #94a3b8;
        line-height: 1.5;
      }
      .close-btn {
        display: inline-block;
        margin-top: 18px;
        padding: 8px 16px;
        background: #334155;
        color: #f8fafc;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      .close-btn:hover {
        background: #475569;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon-container">
        ${
          isError
            ? '<span class="error-icon">✕</span>'
            : '<div class="spinner"></div>'
        }
      </div>
      <h2>${isError ? 'Authentication Failed' : 'Authentication Successful'}</h2>
      <p id="status-text">${
        isError
          ? 'An error occurred during authentication. Closing window...'
          : 'Connecting to ClixProCRM...'
      }</p>
      <button id="close-btn" class="close-btn" style="display: none;" onclick="window.close()">Close Window</button>
    </div>
    <script>
      (function() {
        var target = ${JSON.stringify(targetPath)};
        var err = ${error ? JSON.stringify(error) : "null"};
        var payload = {
          type: err ? 'OAUTH_AUTH_ERROR' : 'OAUTH_AUTH_SUCCESS',
          target: target,
          error: err,
          timestamp: Date.now()
        };

        // 1. PostMessage to opener with exact origin check
        if (window.opener && window.opener !== window) {
          try {
            window.opener.postMessage(payload, window.location.origin);
          } catch (e) {}
        }

        // 2. BroadcastChannel
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            var channel = new BroadcastChannel('oauth_auth_channel');
            channel.postMessage(payload);
            channel.close();
          }
        } catch (e) {}

        // 3. LocalStorage event fallback
        try {
          localStorage.setItem('oauth_auth_event', JSON.stringify(payload));
        } catch (e) {}

        // Automatically attempt to close popup
        setTimeout(function() {
          try {
            window.close();
          } catch (e) {}

          // If browser policy prevents window.close(), update UI and show manual close button
          setTimeout(function() {
            var statusEl = document.getElementById('status-text');
            var btnEl = document.getElementById('close-btn');
            if (statusEl) {
              statusEl.innerText = err ? 'You can close this window and try again.' : 'You are now signed in. You may close this window.';
            }
            if (btnEl) {
              btnEl.style.display = 'inline-block';
            }
          }, 300);
        }, 200);
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
