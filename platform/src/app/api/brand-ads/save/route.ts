import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { fetchBrandLogoUrl } from '@/lib/brand-logo'

export const runtime = 'nodejs'

interface SaveRequest {
  brand_name: string
  image_url: string
  headline?: string
  body_text?: string
  cta?: string
  tags?: string[]
  brand_page_url?: string
}

async function downloadAndStore(
  imageUrl: string,
  brandName: string,
  supabase: ReturnType<typeof createServerClient>
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null

    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : contentType.includes('gif') ? 'gif' : 'jpg'
    const safeBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const path = `${safeBrand}/${uuidv4()}.${ext}`

    const { error } = await supabase.storage
      .from('brand-ads')
      .upload(path, buffer, { contentType, upsert: false })

    if (error) return null

    const { data } = supabase.storage.from('brand-ads').getPublicUrl(path)
    return data.publicUrl
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  let body: SaveRequest
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { brand_name, image_url, headline, body_text, cta, tags, brand_page_url } = body

  if (!brand_name || !image_url) {
    return Response.json({ error: 'brand_name and image_url are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Run image download and logo fetch in parallel
  const [storedUrl, brandLogoUrl] = await Promise.all([
    downloadAndStore(image_url, brand_name, supabase),
    fetchBrandLogoUrl(brand_name),
  ])

  const { data, error } = await supabase
    .from('brand_ads')
    .insert({
      brand_name,
      brand_page_url: brand_page_url ?? null,
      image_url: storedUrl ?? image_url,
      original_image_url: image_url,
      headline: headline ?? null,
      body_text: body_text ?? null,
      cta: cta ?? null,
      tags: tags ?? [],
      platform: 'facebook',
      brand_logo_url: brandLogoUrl,
    })
    .select('*')
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ad: data })
}
