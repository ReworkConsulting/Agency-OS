import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Only JPEG, PNG, WebP, and SVG are allowed' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return Response.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!client) {
    return Response.json({ error: 'Client not found' }, { status: 404 })
  }

  const ext = file.type === 'image/svg+xml' ? 'svg'
    : file.type === 'image/jpeg' ? 'jpg'
    : file.type === 'image/webp' ? 'webp'
    : 'png'
  const filename = `${Date.now()}.${ext}`
  const storagePath = `logos/${client.id}/${filename}`

  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('brand-ads')
    .upload(storagePath, bytes, { contentType: file.type, upsert: true })

  if (uploadError) {
    return Response.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('brand-ads').getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  const { error: dbError } = await supabase
    .from('clients')
    .update({ logo_url: publicUrl })
    .eq('id', client.id)

  if (dbError) {
    return Response.json({ error: `DB error: ${dbError.message}` }, { status: 500 })
  }

  return Response.json({ url: publicUrl })
}
