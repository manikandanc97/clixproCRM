import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

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
      // Check if user exists in ClixProCRM Prisma database
      const userRecord = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (userRecord) {
        // User exists in Prisma, redirect to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      } else {
        // User does not exist in Prisma, needs onboarding
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
      }
    }
  }

  // Redirect to login if no code or something went wrong
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
