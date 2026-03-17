import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PREVIEW_COOKIE = 'agency_os_preview_user'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pass through: login page, auth API routes, static assets
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Collect cookies to set on response (Supabase may refresh session)
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          pendingCookies.push(...cookiesToSet)
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // No session → redirect to login
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.id)
  requestHeaders.set('x-user-email', user.email ?? '')

  // API routes handle their own auth via requireAdmin() which reads cookies
  // directly — never swap in preview permissions for them or exit-preview breaks.
  const isApiRoute = pathname.startsWith('/api/')

  // For page routes: if admin is previewing as another user, load THAT user's
  // profile so menus/clients/tools reflect their restrictions.
  const previewUserId = !isApiRoute ? (request.cookies.get(PREVIEW_COOKIE)?.value ?? null) : null
  const profileUserId = previewUserId ?? user.id

  try {
    const profileRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_profiles?id=eq.${profileUserId}&select=role,allowed_tools,client_access,allowed_clients,allowed_menus`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        cache: 'no-store',
      }
    )
    const profiles = await profileRes.json()
    const profile = Array.isArray(profiles) ? profiles[0] : null

    if (profile) {
      // In preview mode always show as 'member' role so Settings is hidden
      const effectiveRole = previewUserId ? (profile.role ?? 'member') : (profile.role ?? 'member')
      requestHeaders.set('x-user-role', effectiveRole)
      requestHeaders.set('x-user-allowed-tools', JSON.stringify(profile.allowed_tools ?? []))
      requestHeaders.set('x-user-client-access', profile.client_access ?? 'all')
      requestHeaders.set('x-user-allowed-clients', JSON.stringify(profile.allowed_clients ?? []))
      requestHeaders.set('x-user-allowed-menus', JSON.stringify(profile.allowed_menus ?? []))
    } else {
      requestHeaders.set('x-user-role', 'member')
      requestHeaders.set('x-user-allowed-tools', '[]')
      requestHeaders.set('x-user-client-access', 'all')
      requestHeaders.set('x-user-allowed-clients', '[]')
      requestHeaders.set('x-user-allowed-menus', '[]')
    }
  } catch {
    requestHeaders.set('x-user-role', 'member')
    requestHeaders.set('x-user-allowed-tools', '[]')
    requestHeaders.set('x-user-client-access', 'all')
    requestHeaders.set('x-user-allowed-clients', '[]')
    requestHeaders.set('x-user-allowed-menus', '[]')
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  )

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
