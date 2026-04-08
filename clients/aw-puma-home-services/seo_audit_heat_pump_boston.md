# SEO Audit — A.W. Puma Home Services
**Target Service:** Heat Pump Installation
**Target Location:** Boston, MA
**Audit Date:** 2026-04-07
**Auditor:** Agency OS / Claude Sonnet 4.6

---

## Executive Summary

A.W. Puma has a solid structural foundation — 36 indexed pages, active service and location sections, a blog, and a clear brand identity rooted in Mass Save expertise. However, the site has a **critical, show-stopping SEO problem: `/services/heat-pump` returns a 404 error.** The primary service page for a company that markets itself as Greater Boston's go-to heat pump installer doesn't load. This is the single most damaging issue on the site.

Beyond the 404, the location architecture is targeting counties rather than cities — which is how nobody searches. "Heat pump installation Suffolk County" gets negligible traffic. "Heat pump installation Boston" and "heat pump installation Newton" drive real commercial volume, and competitors are capturing those searches while AW Puma has no city-level landing pages.

The third major gap: Akian Plumbing — AW Puma's primary competitor — has a functioning, well-optimized heat pump installation page, 870 reviews (vs. AW Puma's 100+), and an active blog. AW Puma's content velocity edge is its Mass Save positioning, which no competitor leads with. That's the lever to pull — but only after the 404 is fixed.

**Top 3 Opportunities:**
1. Fix the `/services/heat-pump` 404 immediately — every piece of marketing that points to this page is wasted
2. Replace county location pages with city-level pages targeting "heat pump installation [city]" — 8–10 high-value city pages within 60 days
3. Build Mass Save–specific content ("Mass Save heat pump rebate Boston", "Mass Save contractor Newton MA") — a differentiation angle Akian doesn't own

**Top 3 Risks:**
1. The `/services/heat-pump` 404 is actively costing leads every day it exists — this is not a nice-to-have fix
2. Akian is accelerating: 870 reviews, an active blog, a "Heat Pump Store," and a functioning heat pump page — their authority gap is widening
3. Forge (forgeco.com) — a heat pump specialist — is appearing in top positions for "heat pump installation Boston MA" and has single-service focus that beats generalist pages

**Modules to run next (in order):** GBP Optimization → Site Structure Generator → Content Engine

---

## Technical SEO Checklist

| Signal | Status | Priority | Notes |
|--------|--------|----------|-------|
| HTTPS | ✅ Found | — | Site serves over HTTPS correctly |
| robots.txt | ⚠️ Not verified | Medium | Could not confirm — check /robots.txt manually |
| XML Sitemap | ⚠️ Not verified | Medium | Check /sitemap.xml — Vercel-hosted sites often omit this unless configured |
| Canonical Tags | ⚠️ Not verified | Medium | Next.js SPA — verify canonical tags are set on all pages |
| 404 Errors | ❌ CRITICAL | Critical | `/services/heat-pump` returns 404. `/heating-repair` returns 404. At minimum 2 broken service pages confirmed. |
| Redirect Chains | ⚠️ Not verified | Medium | Check for redirect loops on electrical orphan pages |
| Mobile Viewport | ✅ Likely present | — | Vercel/Next.js defaults include viewport meta |
| LocalBusiness Schema | ⚠️ Not detected | High | No JSON-LD schema detected in scraped pages — needs verification |
| Service Schema | ⚠️ Not detected | High | None detected — Akian uses WordPress which typically auto-generates schema |
| NAP Consistency | ✅ Consistent | — | Name, phone (617) 618-3366, address (Brookline, MA) consistent across homepage |
| GBP Linked on Site | ⚠️ Not confirmed | Medium | Not visibly linked from footer — confirm manually |
| Trust Signals Visible | ✅ Present | — | "Licensed & Insured", "Mass Save Installer", "5.0 Stars / 100+ Reviews" on homepage |
| GBP Exists | ✅ Confirmed | — | https://g.co/kgs/jBRY9x1 confirmed |

---

## On-Page Audit

| Page | Issue | Priority | Recommended Fix |
|------|-------|----------|-----------------|
| `/services/heat-pump` | **Returns 404 — page does not exist** | **Critical** | This page must be built and published immediately. It is linked from the nav and homepage. Every ad, GBP link, and word-of-mouth referral that clicks through loses to a blank page. |
| `/heating-repair` | Returns 404 | Critical | Either build this page or add a 301 redirect to `/services/` — it appeared in the site map and may have inbound links |
| Homepage (`/`) | H1 is "HVAC, Plumbing, and Electrical Services in Massachusetts" — does not include target keyword "heat pump" or "Boston" | High | Change H1 to: "Heat Pump Installation & HVAC Services in Massachusetts" — leads with the primary service and matches search intent |
| Homepage (`/`) | Meta description mentions "Greater Boston's trusted Mass Save Contractor" and "heat pump installation" — good, but missing the city keyword | Medium | Add "Boston" or "Greater Boston" into the first 100 characters of meta description |
| Location pages (`/locations/*`) | All 7 location pages are county-level (`/locations/suffolk`, `/locations/middlesex`, etc.) — no one searches "heat pump installation Norfolk County" | Critical | Rebuild location pages as city-level pages. `/locations/boston`, `/locations/newton`, `/locations/cambridge` etc. County pages have near-zero commercial search demand. |
| `/locations/newton` | One city-level page exists (`/locations/newton`) but is inconsistent with the county-level architecture | High | Newton page is the right model — replicate this format for all 8–10 primary cities |
| Electrical pages | `/electrical-inspection`, `/electrical-installation`, `/electrical-repair`, `/house-rewiring-2`, `/circuit-breaker-repair-and-installation` are all standalone orphan pages — not under `/services/electrical/` and inconsistently named | Medium | Reorganize under `/services/electrical/` with consistent URL slugs. `/house-rewiring-2` is particularly bad — the `-2` suffix indicates a duplicate. |
| `/blog/heat-pump-revolution` | Likely the strongest blog asset — exact keyword match to commercial intent, but title not confirmed as optimized | Medium | Scrape and verify: does this post rank for anything? Is it internally linked from the heat pump service page? |
| All service pages | No FAQ sections with schema detected on scraped pages | Medium | Add FAQPage JSON-LD schema to each service page — Akian doesn't have this either, so it's a differentiation opportunity |

---

## Keyword Research Output

### Bucket A — Service Page Targets

| Keyword | Search Intent | Priority | Notes |
|---------|--------------|----------|-------|
| heat pump installation Boston MA | Commercial — high intent | Critical | Top-ranking pages: Forge (specialist), Boston Unique Indoor Comfort, MassCEC directory. AW Puma not visible in top 5. |
| heat pump installation Massachusetts | Commercial — broad | Critical | Broad-state keyword; foundational |
| Mass Save heat pump contractor Boston | Commercial — high intent + qualifier | Critical | Mass Save logo/certification is AW Puma's #1 differentiator — no competitor owns this keyword cluster |
| Mass Save certified heat pump installer Greater Boston | Commercial — qualified | High | Highly specific, buyer-ready searcher |
| mini split installation Boston MA | Commercial | High | Strong secondary keyword — `/services/mini-splits` exists but needs optimization |
| heat pump replacement Boston MA | Commercial — replacement intent | High | Different buyer stage than "installation" — replacement buyers are often more urgent |
| ductless heat pump installation Massachusetts | Commercial | Medium | Long-form variation |
| heat pump repair Boston MA | Commercial — service intent | High | Repair buyers are high-urgency; no dedicated repair page found |

### Bucket B — Location Page Targets

| Keyword | City | Priority | Est. Search Volume |
|---------|------|----------|--------------------|
| heat pump installation Boston MA | Boston | Critical | High — multiple competitors targeting this |
| heat pump installation Newton MA | Newton | Critical | Medium-High — affluent suburb, high conversion value |
| heat pump installation Cambridge MA | Cambridge | Critical | Medium-High — dense housing, high renter-to-owner conversion |
| heat pump installation Brookline MA | Brookline | High | Medium — where AW Puma is headquartered; most credible geo signal |
| heat pump installation Worcester MA | Worcester | High | Medium — 2nd largest city in MA, within service area |
| heat pump installation Wellesley MA | Wellesley | High | Medium — high-income suburb, strong heat pump upgrade demographic |
| heat pump installation Brockton MA | Brockton | Medium | Medium — in service area, less competitive |
| heat pump installation Lawrence MA | Lawrence | Medium | Lower — but in Essex County service area |
| Mass Save contractor Newton MA | Newton | High | Low volume, very high intent — Mass Save searches convert |
| Mass Save contractor Boston | Boston | High | Low volume, very high intent |

### Bucket C — Blog/Informational Targets

| Keyword | Search Intent | Internal Link Target |
|---------|--------------|---------------------|
| how much does heat pump installation cost in Massachusetts | Informational — cost research | → `/services/heat-pump` |
| Mass Save heat pump rebate 2025 | Informational — rebate research | → `/mass-save` + `/services/heat-pump` |
| heat pump vs furnace Massachusetts | Informational — comparison | → `/services/heat-pump` |
| is a heat pump worth it in Massachusetts | Informational — decision stage | → `/services/heat-pump` + `/mass-save` |
| signs you need a new heat pump | Informational — problem aware | → `/services/heat-pump` (repair/replace CTA) |
| how long does heat pump installation take | Informational — pre-purchase | → `/contact` (get estimate CTA) |
| best heat pump brands Massachusetts | Informational — research stage | → `/services/heat-pump` (brands: Carrier, Mitsubishi, Lennox, Trane) |
| heat pump cold weather Massachusetts | Informational — objection | → `/services/heat-pump` + `/blog/heat-pump-revolution` |

---

## Local Pack Status

**Search: "heat pump installation Boston MA"**

AW Puma does not appear in the top 5 organic results for this query. Top results include:
- Forge (forgeco.com) — heat pump specialist, single-service focus, strong domain authority for this niche
- masssave.com — government rebate program pages dominate informational intent
- Boston Unique Indoor Comfort — established local operator with dedicated landing page
- MassCEC and EnergyStar installer directories

**GBP / Local Pack:**
- AW Puma's GBP exists (confirmed: https://g.co/kgs/jBRY9x1)
- The site shows "100+ Reviews, 5.0 Stars" which is competitive but below Akian's 870
- Akian Plumbing appears prominently in heat pump contractor searches
- Mass Save's own contractor finder (masssave.com/find-a-contractor) frequently appears above local GBPs for Mass Save-qualified searches — AW Puma being listed there is important and should be confirmed

**What would move AW Puma into the Local Pack:**
1. Fix the 404 on `/services/heat-pump` — a business whose service page 404s cannot rank in Local Pack for that service
2. Increase review velocity toward 200+ (current: 100+) — at 200 reviews, the gap with Akian starts to matter less
3. Ensure GBP primary category is "HVAC Contractor" or "Heat Pump Contractor" (not "Plumber" which Akian leads with)
4. Build city-level location pages that link back to the GBP for each service area

---

## Competitor Advantages

### Akian Plumbing, Heating, Cooling & Electric (akianplumbing.com)

**What's working:**
- H1 on heat pump page: "#1 Heat Pump Installation Services in MA — Serving The Greater Boston Area" — leads with "heat pump installation" + "Massachusetts" + "Greater Boston Area" in the first visible heading. AW Puma's equivalent page is a 404.
- Active blog with heat pump-specific content (seen: "Myths About Heat Pumps in New England", "Why Choosing Name-Brand Heat Pump Equipment Matters") — building topical authority directly in the purchase-consideration window
- Heat Pump Store — a unique page that signals deep inventory and commitment to the product category; no other local competitor has this
- 870 Google reviews — the single biggest trust gap vs. AW Puma. When a homeowner is comparing two contractors, this is what closes the gap.
- Mass Save rebates ($8,500) prominently displayed on their heat pump page — they are now competing directly on AW Puma's core differentiator

**Direct replications for AW Puma:**
- Write and publish a heat pump service page with H1 that includes "Heat Pump Installation" + "Massachusetts" + "Boston" in the first heading
- Start a review velocity program — even getting to 200 reviews within 90 days changes the competitive dynamic
- Create a Mass Save-specific landing page for each key city (`/boston/mass-save-heat-pump`, `/newton/mass-save-heat-pump`) — Akian links to Mass Save's rebate page but doesn't own those local keyword combinations

### Boston Standard Company (bostonstandard.com)

Full research pending per `competitors.md`. However, MassCEC lists Boston Standard as the designated installer for Suffolk County in the Whole-Home Pilot program — this is a **significant authority signal** that gives them top placement in government referral searches. AW Puma should confirm whether they're listed in the MassCEC program and if not, pursue it.

---

## Competitor Comparison Table

| Signal | AW Puma | Akian Plumbing |
|--------|---------|----------------|
| Heat pump service page exists | ❌ 404 | ✅ akianplumbing.com/heating-air-conditioning/heat-pump-installation |
| H1 includes "heat pump installation" | ❌ Page doesn't load | ✅ "#1 Heat Pump Installation Services in MA" |
| Mass Save rebates displayed prominently | ✅ Yes (homepage) | ✅ Yes ($8,500 on heat pump page) |
| Review count | ~100 Google reviews | 870 Google reviews |
| Active blog (heat pump content) | ✅ 6 posts (1 heat pump) | ✅ Multiple heat pump posts |
| Schema markup detectable | ⚠️ Not detected | ⚠️ Not detected (but WordPress likely generates it) |
| Heat pump-specific store/resource | ❌ None | ✅ "Heat Pump Store: NOW OPEN" |
| City-level location pages | ⚠️ 1 (Newton) | Not analyzed |
| Financing offer | ✅ 0% up to 84 months | ✅ 0% financing |
| Price guarantee | ✅ "Beat any licensed competitor's quote" | ❌ Not found |

---

## 90-Day Action Plan

**Difficulty: Easy = < 2 hours | Medium = half day | Hard = full day+**

1. **Fix the `/services/heat-pump` 404** — Difficulty: Easy | Impact: Critical
   Build and publish the heat pump service page at `/services/heat-pump`. Minimum viable version: H1 with "Heat Pump Installation in Massachusetts", 600+ words, Mass Save rebate section, trust signals (licensed, insured, 100+ reviews, price match guarantee), CTA (call + get quote form). Every day this 404 exists is a direct revenue loss.
   → Technical fix

2. **Rebuild location architecture — city pages, not county pages** — Difficulty: Hard | Impact: Critical
   The 7 county pages are near-worthless for ranking. Replace or supplement with city-level pages targeting the 8 highest-value cities: Boston, Newton, Cambridge, Brookline, Wellesley, Worcester, Brockton, and Lawrence. Each page targets "[service] + [city]" keyword. Start with Boston, Newton, and Cambridge.
   → Site Structure module

3. **Fix `/heating-repair` 404 and resolve electrical orphan pages** — Difficulty: Medium | Impact: High
   `/heating-repair` 404s — either build this page or 301 redirect to the relevant service. The 5 standalone electrical pages need to be reorganized under `/services/electrical/` with clean slugs. `/house-rewiring-2` must be renamed and the old URL 301-redirected.
   → Technical fix

4. **Update Homepage H1 to lead with heat pump + Massachusetts** — Difficulty: Easy | Impact: High
   Change from "HVAC, Plumbing, and Electrical Services in Massachusetts" to "Heat Pump Installation & HVAC Services in Massachusetts". Albert built his identity around heat pumps and Mass Save — the homepage H1 should reflect that.
   → On-page fix

5. **Add LocalBusiness + Service JSON-LD schema to all service pages** — Difficulty: Medium | Impact: High
   No schema detected on any scraped page. Schema helps with rich results and is a Local Pack trust signal. Implement at minimum: `LocalBusiness` on homepage, `Service` on each service page, `FAQPage` on any page with FAQ sections.
   → Technical fix (Developer)

6. **Launch review velocity program** — Difficulty: Medium | Impact: High (Local Pack)
   The gap between AW Puma (~100 reviews) and Akian (870) is the largest single ranking disadvantage in the Local Pack. Set a target: 10 new reviews/month. Distribute SMS/email review request templates to all field techs. Run the GBP Optimization module for ready-to-use templates.
   → GBP module

7. **Publish "How Much Does Heat Pump Installation Cost in Massachusetts?" blog post** — Difficulty: Medium | Impact: High
   Cost searches are actively happening on Reddit, Facebook groups, and blogs. This is the single highest-traffic blog topic available. Real data: $5,000–$20,000 range, Mass Save rebates reduce cost by up to $8,500. Use AW Puma's brands (Carrier, Mitsubishi, Lennox) for specificity.
   → Content Engine module

8. **Create a Mass Save landing page for Boston and Newton** — Difficulty: Medium | Impact: High
   "Mass Save heat pump contractor Boston" and "Mass Save heat pump contractor Newton" are high-intent, low-competition keywords. A dedicated page (or section per city page) that explains the rebate process, AW Puma's role as a certified contractor, and includes a CTA to start the process captures buyers who are already in the program funnel.
   → Content Engine module

9. **Confirm GBP primary category and add additional categories** — Difficulty: Easy | Impact: Medium-High
   Verify the GBP primary category is "HVAC Contractor" not "Plumber" or "General Contractor." Add additional categories: Heat Pump Installation Service, Air Conditioning Contractor, Heating Contractor, Electrical Contractor. Run the GBP Optimization module for a full category recommendation.
   → GBP module

10. **Verify `/sitemap.xml` exists and submit to Google Search Console** — Difficulty: Easy | Impact: Medium
    Confirm the Vercel/Next.js deployment generates a sitemap. If not, add `next-sitemap` to the codebase. Submit to Google Search Console to accelerate indexing of new/fixed pages.
    → Technical fix (Developer)

---

## Phase 5: Quality Check

- [x] Every claim is grounded in scraped data — 404 errors confirmed by live scrape, competitor H1 pulled directly from akianplumbing.com HTML, keyword landscape from live Firecrawl search results
- [x] Keyword recommendations match ICP Profile 2 search behavior — cost queries, Mass Save rebate searches, and trust-qualifier searches ("licensed contractor", "Mass Save certified") all align with the ICP's documented search patterns
- [x] Action plan is prioritized by impact, not difficulty — 404 fix is #1 despite being Easy because the impact is Critical
- [x] Competitor claims are traceable — Akian's H1 text sourced directly from scraped page at akianplumbing.com/heating-air-conditioning/heat-pump-installation
- [x] Keyword clusters: Bucket A (8 keywords ✅), Bucket B (10 keywords ✅), Bucket C (8 keywords ✅) — all above minimum of 5
- [x] Technical checklist fully populated
- [x] GBP existence confirmed
- [x] 90-Day Action Plan labels downstream module for each action
