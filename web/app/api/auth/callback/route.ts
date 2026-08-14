import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Exchange code error:', error.message)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
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
          return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
        } else if (res.status === 403) {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
        }
      } catch (err) {
        console.error('API connection error during callback:', err);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=server_error`)
      }
    }
  }

  // Redirect to login if no code or something went wrong
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
