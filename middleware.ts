import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => {
            // Update the request cookies
            request.cookies.set(name, value)
            // Update the response cookies with proper options
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: options?.sameSite || 'lax',
              path: options?.path || '/',
            })
          })
        },
      },
    }
  )

  // Get user - Supabase will automatically parse the session from cookies
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Debug logging (remove in production)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('[Middleware] Dashboard route - User:', user ? 'found' : 'not found', 'Error:', authError)
    const cookieNames = request.cookies.getAll().map(c => c.name).join(', ')
    console.log('[Middleware] Cookies:', cookieNames)
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    console.log('[Middleware] Redirecting to login - no user found')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Don't automatically redirect from login - let the page handle it
  // This prevents redirect loops when cookies are being set

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
