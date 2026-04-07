import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import { Sidebar } from '@/components/layout/Sidebar'
import { PreviewBanner } from '@/components/layout/PreviewBanner'
import { TopBar } from '@/components/layout/TopBar'
import { PageTransitionWrapper } from '@/components/layout/PageTransitionWrapper'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createServerClient } from '@/lib/supabase/server'

const PREVIEW_COOKIE = 'agency_os_preview_user'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const cookieStore = await cookies()

  // User context injected by proxy.ts
  // When in preview mode, proxy already swaps in the previewed user's permissions.
  const userId = headersList.get('x-user-id') ?? ''
  const userEmail = headersList.get('x-user-email') ?? ''
  const userRole = headersList.get('x-user-role') ?? 'member'
  const allowedTools: string[] = JSON.parse(headersList.get('x-user-allowed-tools') ?? '[]')
  const clientAccess = headersList.get('x-user-client-access') ?? 'all'
  const allowedClientIds: string[] = JSON.parse(headersList.get('x-user-allowed-clients') ?? '[]')
  const allowedMenus: string[] = JSON.parse(headersList.get('x-user-allowed-menus') ?? '[]')

  const previewUserId = cookieStore.get(PREVIEW_COOKIE)?.value ?? null

  // Fetch the real user's full name (for sidebar avatar)
  let fullName: string | null = null
  try {
    const db = createServerClient()
    const { data } = await db
      .from('user_profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    fullName = data?.full_name ?? null
  } catch { /* non-fatal */ }

  // Fetch clients — filtered by the effective permissions (preview or real)
  let clients: { slug: string; company_name: string; logo_url: string | null; id: string }[] = []
  try {
    const db = createServerClient()
    const { data } = await db
      .from('clients')
      .select('id, slug, company_name, logo_url')
      .eq('status', 'active')
      .order('company_name')
    const all = data ?? []
    clients = clientAccess === 'specific' && allowedClientIds.length > 0
      ? all.filter(c => allowedClientIds.includes(c.id))
      : all
  } catch { /* non-fatal */ }

  // Fetch preview user info (name + role) for the banner
  let previewProfile: { full_name: string | null; role: string } | null = null
  if (previewUserId) {
    try {
      const db = createServerClient()
      const { data } = await db
        .from('user_profiles')
        .select('full_name, role')
        .eq('id', previewUserId)
        .single()
      previewProfile = data
    } catch { /* non-fatal */ }
  }

  // In preview mode, show the previewed user's name/role in sidebar
  const sidebarUser = previewUserId && previewProfile
    ? { id: previewUserId, email: '', full_name: previewProfile.full_name, role: previewProfile.role }
    : userId
      ? { id: userId, email: userEmail, full_name: fullName, role: userRole }
      : null

  return (
    <>
      {previewProfile && (
        <PreviewBanner
          userName={previewProfile.full_name || 'Unknown User'}
          userRole={previewProfile.role}
        />
      )}
      <div
        className="flex min-h-screen"
        style={{
          background: 'var(--bg)',
          marginTop: previewProfile ? '41px' : undefined,
        }}
      >
        <Sidebar
          clients={clients}
          user={sidebarUser}
          allowedMenus={allowedMenus}
          allowedTools={allowedTools}
        />
        <main className="flex-1 min-w-0 overflow-auto flex flex-col" style={{ background: 'var(--bg)' }}>
          <TopBar />
          <TooltipProvider>
            <PageTransitionWrapper>{children}</PageTransitionWrapper>
          </TooltipProvider>
        </main>
      </div>
    </>
  )
}
