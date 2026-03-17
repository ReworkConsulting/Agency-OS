import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import { createSessionClient, createServerClient } from './server'

export async function requireAdmin(): Promise<{ userId: string }> {
  // First try: read user context from proxy headers (fast, reliable)
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const role = headersList.get('x-user-role')
    if (userId && role === 'admin') {
      return { userId }
    }
    if (userId && role && role !== 'admin') {
      throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }
  } catch (e) {
    if (e instanceof Response) throw e
    // Fall through to cookie-based check
  }

  // Fallback: cookie-based session check
  const cookieStore = await cookies()
  const sessionClient = createSessionClient(cookieStore)
  const { data: { user } } = await sessionClient.auth.getUser()

  if (!user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = createServerClient()
  const { data: profile } = await db
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  return { userId: user.id }
}
