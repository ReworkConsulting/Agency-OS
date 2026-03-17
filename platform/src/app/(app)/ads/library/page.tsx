import { createServerClient } from '@/lib/supabase/server'
import { AdLibraryClient } from '@/components/ads/AdLibraryClient'
import type { AdCreative } from '@/components/ads/AdCard'
import type { BrandAd } from '@/components/ads/BrandAdCard'

export default async function AdLibraryPage() {
  const supabase = createServerClient()

  const [savedAdsResult, brandAdsResult] = await Promise.all([
    supabase
      .from('ad_creatives')
      .select('id, hook, primary_text, headline, cta, image_url, image_status, angle, visual_style, ad_size, saved_to_library, created_at')
      .eq('saved_to_library', true)
      .order('created_at', { ascending: false })
      .limit(60),

    supabase
      .from('brand_ads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const myAds = (savedAdsResult.data ?? []) as AdCreative[]
  const brandAds = (brandAdsResult.data ?? []) as BrandAd[]
  const brands = [...new Set(brandAds.map((a) => a.brand_name))].sort()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="px-8 pt-8 pb-6 border-b border-zinc-800">
        <h1 className="text-xl font-semibold text-white mb-1">Ad Library</h1>
        <p className="text-xs text-zinc-500">
          Saved ads and brand inspiration — use as references for new campaigns.
        </p>
      </div>

      <AdLibraryClient
        myAds={myAds}
        initialBrandAds={brandAds}
        brands={brands}
      />
    </div>
  )
}
