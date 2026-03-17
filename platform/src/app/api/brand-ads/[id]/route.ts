import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  // Fetch row to get the storage path from image_url
  const { data: ad } = await supabase
    .from('brand_ads')
    .select('image_url, brand_name')
    .eq('id', id)
    .single()

  if (ad?.image_url) {
    // Extract path from public URL: .../brand-ads/BRAND/uuid.jpg
    const url = new URL(ad.image_url)
    const pathParts = url.pathname.split('/brand-ads/')
    if (pathParts.length > 1) {
      await supabase.storage.from('brand-ads').remove([pathParts[1]])
    }
  }

  const { error } = await supabase.from('brand_ads').delete().eq('id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
