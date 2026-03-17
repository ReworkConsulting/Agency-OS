import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { fetchBrandLogoUrl } from '@/lib/brand-logo'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ScrapeRequest {
  page_url: string
  brand_name: string
  limit?: number
}

interface BrandAdInsert {
  brand_name: string
  brand_page_url: string
  original_image_url: string
  image_url: string | null
  headline: string | null
  body_text: string | null
  platform: string
  source_url: string
  brand_logo_url: string | null
}

// Facebook CDN path types:
// t45.5328 = ad creative images (what we want)
// t39.30808 = profile photos (logos, avatars — skip)
// t1.6435  = general photos
// t15.5256 = video thumbnails
function isAdCreativeUrl(url: string): boolean {
  if (url.includes('/v/t45.5328-4/')) return true
  if (url.includes('/v/t15.5256-4/')) return true

  // Skip profile photos / logos
  if (url.includes('/v/t39.30808-')) return false

  // Include other Facebook CDN images
  if (url.includes('scontent') || url.includes('fbcdn')) return true

  return false
}

function likelySmallImage(url: string): boolean {
  const sizeMatch = url.match(/[?&]_?s=(\d+)x(\d+)/)
  if (sizeMatch) {
    const w = parseInt(sizeMatch[1])
    const h = parseInt(sizeMatch[2])
    if (w < 300 || h < 300) return true
  }
  if (/[_/]s?[0-9]{2,3}x[0-9]{2,3}[_/.]/.test(url)) return true
  return false
}

async function downloadAndStore(
  imageUrl: string,
  brandName: string,
  supabase: ReturnType<typeof createServerClient>
): Promise<{ storedUrl: string | null; fileSize: number }> {
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return { storedUrl: null, fileSize: 0 }

    const buffer = Buffer.from(await res.arrayBuffer())
    const fileSize = buffer.length

    // Ad creatives are typically >15KB; skip tiny images (icons, profile pics, etc.)
    if (fileSize < 15 * 1024) return { storedUrl: null, fileSize }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : contentType.includes('gif') ? 'gif' : 'jpg'
    const safeBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const path = `${safeBrand}/${uuidv4()}.${ext}`

    const { error } = await supabase.storage
      .from('brand-ads')
      .upload(path, buffer, { contentType, upsert: false })

    if (error) return { storedUrl: null, fileSize }

    const { data } = supabase.storage.from('brand-ads').getPublicUrl(path)
    return { storedUrl: data.publicUrl, fileSize }
  } catch {
    return { storedUrl: null, fileSize: 0 }
  }
}

function extractImageUrls(htmlSources: string[]): string[] {
  const urls: string[] = []

  for (const html of htmlSources) {
    if (!html) continue

    // 1. Standard <img> tags
    const imgRegex = /<img[^>]+(?:data-src|src)=["']([^"']+)["']/gi
    let match
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1].replace(/&amp;/g, '&')
      if (isAdCreativeUrl(src) && !likelySmallImage(src)) urls.push(src)
    }

    // 2. srcset — take highest-res entry
    const srcsetRegex = /srcset=["']([^"']+)["']/gi
    while ((match = srcsetRegex.exec(html)) !== null) {
      const parts = match[1].split(',')
      const last = parts[parts.length - 1]?.trim().split(' ')[0]
      if (last) {
        const decoded = last.replace(/&amp;/g, '&')
        if (isAdCreativeUrl(decoded) && !likelySmallImage(decoded)) urls.push(decoded)
      }
    }

    // 3. JSON-embedded URLs in <script> tags (Facebook React SPA)
    // Facebook encodes image URLs inside JSON as "https:\/\/scontent..." or as unicode escapes
    // Pattern: extract raw text between quotes that contains scontent/fbcdn
    const jsonUrlRegex = /"(https?:\\?\/\\?\/(?:scontent|static\.xx\.fbcdn)[^"]+\.(?:jpg|jpeg|png|gif|webp)[^"]*)"/gi
    while ((match = jsonUrlRegex.exec(html)) !== null) {
      try {
        // Unescape backslash-encoded forward slashes and unicode sequences
        let url = match[1]
          .replace(/\\u002F/gi, '/')
          .replace(/\\u003A/gi, ':')
          .replace(/\\\//g, '/')
          .replace(/&amp;/g, '&')
        // Strip any trailing JSON artifacts
        url = url.split('"')[0]
        if (url.startsWith('http') && isAdCreativeUrl(url) && !likelySmallImage(url)) {
          urls.push(url)
        }
      } catch {
        // skip malformed
      }
    }

    // 4. background-image: url(...) in style attributes
    const bgRegex = /background(?:-image)?:\s*url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/gi
    while ((match = bgRegex.exec(html)) !== null) {
      const url = match[1].replace(/&amp;/g, '&')
      if (isAdCreativeUrl(url) && !likelySmallImage(url)) urls.push(url)
    }
  }

  // Deduplicate by base URL (strip query params for comparison)
  const seen = new Set<string>()
  return urls.filter((u) => {
    const base = u.split('?')[0]
    if (seen.has(base)) return false
    seen.add(base)
    return true
  })
}

export async function POST(request: NextRequest) {
  let body: ScrapeRequest
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { page_url, brand_name, limit = 10 } = body

  if (!page_url || !brand_name) {
    return Response.json({ error: 'page_url and brand_name are required' }, { status: 400 })
  }

  const firecrawlKey = process.env.FIRECRAWL_API_KEY
  if (!firecrawlKey) {
    return Response.json({ error: 'FIRECRAWL_API_KEY not configured' }, { status: 500 })
  }

  // Collect HTML from all scrape snapshots + final response
  const htmlSources: string[] = []

  try {
    const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: page_url,
        formats: ['html'],
        actions: [
          // Initial wait for page JS to render
          { type: 'wait', milliseconds: 4000 },
          // Capture first batch of ads before scrolling
          { type: 'scrape' },
          // Scroll pass 1 — use executeJavascript since 'amount' is not supported in scroll action
          { type: 'executeJavascript', script: 'window.scrollBy(0, 1500)' },
          { type: 'wait', milliseconds: 2000 },
          { type: 'scrape' },
          // Scroll pass 2
          { type: 'executeJavascript', script: 'window.scrollBy(0, 1500)' },
          { type: 'wait', milliseconds: 2000 },
          { type: 'scrape' },
          // Scroll pass 3
          { type: 'executeJavascript', script: 'window.scrollBy(0, 1500)' },
          { type: 'wait', milliseconds: 2000 },
          { type: 'scrape' },
          // Scroll pass 4 — deep scroll for more ads
          { type: 'executeJavascript', script: 'window.scrollBy(0, 2000)' },
          { type: 'wait', milliseconds: 2500 },
        ],
        timeout: 55000,
        onlyMainContent: false,
      }),
      signal: AbortSignal.timeout(58000),
    })

    if (fcRes.ok) {
      const fcData = await fcRes.json()
      // Final HTML snapshot
      if (fcData?.data?.html) htmlSources.push(fcData.data.html)
      // Mid-scroll HTML snapshots from scrape actions
      const scrapes = fcData?.data?.actions?.scrapes ?? []
      for (const s of scrapes) {
        if (s?.html) htmlSources.push(s.html)
      }
      // Also check screenshots array which sometimes includes HTML
      const screenshots = fcData?.data?.actions?.screenshots ?? []
      for (const sc of screenshots) {
        if (sc?.html) htmlSources.push(sc.html)
      }
    } else {
      const errData = await fcRes.json().catch(() => ({}))
      console.error('Firecrawl error:', fcRes.status, errData)
    }
  } catch (err) {
    console.error('Firecrawl fetch failed:', err)
    return Response.json({
      ads: [],
      count: 0,
      message: 'Scrape request failed. Facebook may be blocking access. Try adding ads manually.',
    })
  }

  if (htmlSources.length === 0) {
    return Response.json({
      ads: [],
      count: 0,
      message: 'No content returned from Facebook. The Ad Library may require login. Try the manual tab to paste image URLs directly.',
    })
  }

  const imageUrls = extractImageUrls(htmlSources).slice(0, limit * 3) // over-fetch, filter by size after download

  if (imageUrls.length === 0) {
    return Response.json({
      ads: [],
      count: 0,
      message: 'No ad creative images found. Facebook Ad Library may require login. Try the manual tab to paste image URLs directly.',
    })
  }

  const supabase = createServerClient()

  // Fetch brand logo in parallel with image downloads
  const [brandLogoUrl, ...imageDownloadResults] = await Promise.all([
    fetchBrandLogoUrl(brand_name),
    ...imageUrls.map(async (imgUrl) => {
      const { storedUrl, fileSize } = await downloadAndStore(imgUrl, brand_name, supabase)
      return { imgUrl, storedUrl, fileSize }
    }),
  ])

  const validResults = (imageDownloadResults as Array<{ imgUrl: string; storedUrl: string | null; fileSize: number }>)
    .filter((r) => r.storedUrl !== null)
    .slice(0, limit)

  if (validResults.length === 0) {
    return Response.json({
      ads: [],
      count: 0,
      message: `Found ${imageUrls.length} image URL(s) but all were too small (likely icons/logos). Facebook may be blocking image downloads. Try using the manual tab to paste specific ad image URLs.`,
    })
  }

  const insertRows: BrandAdInsert[] = validResults.map(({ imgUrl, storedUrl }) => ({
    brand_name,
    brand_page_url: page_url,
    original_image_url: imgUrl,
    image_url: storedUrl!,
    headline: null,
    body_text: null,
    platform: 'facebook',
    source_url: page_url,
    brand_logo_url: brandLogoUrl as string | null,
  }))

  const { data: inserted, error } = await supabase
    .from('brand_ads')
    .insert(insertRows)
    .select('*')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    ads: inserted ?? [],
    count: inserted?.length ?? 0,
  })
}
