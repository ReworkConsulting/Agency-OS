/**
 * Attempts to find a brand's logo via Clearbit Logo API.
 * Tries several domain guesses derived from the brand name.
 */
export async function fetchBrandLogoUrl(brandName: string): Promise<string | null> {
  // Generate domain candidates from brand name
  const base = brandName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const noSpaces = base.replace(/\s+/g, '')
  const hyphenated = base.replace(/\s+/g, '-')

  // Common words to strip when guessing domain (e.g. "Coffee", "Labs", "Co", "Inc")
  const stripped = base
    .replace(/\b(coffee|cafe|labs?|co\.?|inc\.?|llc\.?|group|media|studio|brand|foods?|drinks?|health|fitness|home|services?)\b/gi, '')
    .replace(/\s+/g, '')
    .trim()

  const candidates = [
    `${noSpaces}.com`,
    `${hyphenated}.com`,
    stripped.length >= 3 ? `${stripped}.com` : null,
    `get${noSpaces}.com`,
    `try${noSpaces}.com`,
    `${noSpaces}.co`,
  ].filter(Boolean) as string[]

  // Deduplicate
  const domains = [...new Set(candidates)]

  for (const domain of domains) {
    const url = `https://logo.clearbit.com/${domain}`
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': 'Mozilla/5.0' },
      })
      if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
        return url
      }
    } catch {
      // try next
    }
  }

  return null
}
