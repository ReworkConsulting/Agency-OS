import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const clientSlug = formData.get('client_slug') as string | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return Response.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Resolve client_id if slug provided
  let clientId: string | null = null
  if (clientSlug) {
    const { data } = await supabase
      .from('clients')
      .select('id')
      .eq('slug', clientSlug)
      .single()
    clientId = data?.id ?? null
  }

  // Upload to Supabase Storage
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/webp' ? 'webp' : 'png'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const storagePath = clientId ? `clients/${clientId}/${filename}` : `global/${filename}`

  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('reference-images')
    .upload(storagePath, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    return Response.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('reference-images').getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  // Persist to reference_images table
  const { data: refImage, error: dbError } = await supabase
    .from('reference_images')
    .insert({
      client_id: clientId,
      name: file.name,
      url: publicUrl,
      source: 'upload',
    })
    .select('id, url, name')
    .single()

  if (dbError) {
    return Response.json({ error: `DB error: ${dbError.message}` }, { status: 500 })
  }

  return Response.json({ id: refImage.id, url: refImage.url, name: refImage.name })
}
