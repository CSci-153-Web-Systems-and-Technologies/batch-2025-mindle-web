// file: middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Protect Routes
  if (request.nextUrl.pathname.startsWith('/protected')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // 👇 NEW: Handle Role Redirection ONLY on the main landing page
    // This prevents the "Uncached data" build error by moving logic here
    if (request.nextUrl.pathname === '/protected') {
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role?.toLowerCase()

      const url = request.nextUrl.clone()
      // Default to student if role is missing or unknown
      if (role === 'tutor') {
        url.pathname = '/protected/dashboard/tutor'
      } else {
        url.pathname = '/protected/dashboard/student'
      }
      return NextResponse.redirect(url)
    }
  }

  // 3. Redirect logged-in users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth') && user) {
    const url = request.nextUrl.clone()
    // Redirect to the root protected route, so the logic above ^ handles the role check
    url.pathname = '/protected' 
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}