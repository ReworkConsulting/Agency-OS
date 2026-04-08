# SEO Audit Workflow

## Objective
Produce a complete local SEO audit for a home service business. Identify technical issues, keyword gaps, on-page problems, competitor ranking advantages, and a prioritized action plan to improve organic search visibility and lead volume. This is the entry point for the full SEO system — all downstream modules (Site Structure, Content Engine, GBP, Game Plan) depend on the keyword clusters and findings produced here.

## Prerequisites
- Client record must exist in the system (overview, services, competitors loaded)
- ICP document must be completed first — the audit uses ICP audience data to prioritize keywords by buyer intent

## Required Inputs
- `target_service` — The primary service to audit (e.g. "Roof Replacement", "HVAC Installation")
- `target_location` — The geographic target (e.g. "Denver, CO")

## Optional Inputs
- `website_url` — Pre-filled from client record if available
- `gbp_url` — Client's Google Business Profile URL (pre-filled from client record if available)
- `audit_scope` — Limit the audit: `full` (default) | `technical_only` | `keywords_only` | `competitors_only`
- `competitor_count` — How many competitors to analyze: `2` | `3` (default) | `5`

## Tools Available
- `firecrawl-scrape` — Scrape the client's website pages for on-page SEO analysis
- `firecrawl-search` — Search Google for competitor rankings and keyword opportunities
- `firecrawl-crawl` — Crawl the full website to identify missing pages, thin content, and structural gaps
- `firecrawl-map` — Discover all indexed pages on the client's domain

---

## Phase 0: Pre-Flight Check

Before starting, verify:
1. Client website URL is set in the system
2. At least one competitor is listed
3. ICP document exists — if missing, stop and ask the user to run **Build ICP** first
4. If `audit_scope` is set to anything other than `full`, skip the phases that don't apply and note which phases were skipped in the Executive Summary

If any critical data is missing, list exactly what's needed and stop.

---

## Phase 1: Website Audit

### 1.1 Crawl the Client Website
Use `firecrawl-crawl` on the client's website URL.

Capture:
- Total pages indexed
- Page titles and meta descriptions (are they set? are they keyword-optimized?)
- H1 and H2 headings on service pages
- Internal linking structure (are service pages linked from the homepage?)
- Page speed indicators (if available)
- Missing pages (e.g. no dedicated page for `target_service` in `target_location`)

### 1.2 Analyze the Service Page for `target_service`
Use `firecrawl-scrape` on the specific service page.

Evaluate:
- Is there a dedicated page for this service? If not, flag as a critical gap.
- Does the page title include the primary keyword (`target_service + target_location`)?
- Does the page include trust signals: reviews, credentials, guarantees?
- Is there a clear CTA (call, form, booking)?
- Word count — is it competitive (600+ words for local SEO)?

### 1.3 Technical SEO Signals
Using the crawl output from 1.1, check for:

- **HTTPS** — Is the site served over HTTPS? HTTP = Critical issue.
- **robots.txt** — Does `/robots.txt` exist and is it not blocking crawlers?
- **XML Sitemap** — Does `/sitemap.xml` exist? Is it linked from robots.txt?
- **Canonical Tags** — Are canonical tags present on crawled pages? Any self-referencing issues?
- **404s and Redirects** — Any broken internal links or redirect chains (301→301→301)?
- **Mobile Viewport** — Is the viewport meta tag present?
- **Schema Markup** — Is `LocalBusiness`, `Service`, or any structured data detectable in the HTML? Note the schema types found.

### 1.4 Local SEO On-Page Signals
- **NAP Consistency** — Is the Name, Address, Phone consistent across all pages (header, footer, contact page)?
- **City/Region Mentions** — Does page copy mention the target city and service area naturally?
- **Location Pages** — Does the site have dedicated location/city pages, or is it a single-area site?
- **GBP Link** — Is the Google Business Profile linked from the website (footer or contact page)?
- **Geo-Tagged Images** — Any evidence of geo-tagged or locally relevant images?

### 1.5 Authority Signals
- **Homepage Internal Links** — Does the homepage link directly to key service pages?
- **Trust Signals** — Are there visible trust elements: reviews widget, star ratings, certifications, guarantees, badges?
- **E-E-A-T Indicators** — Does the site have: an About page, team page or bio section, author attribution, years in business mentioned?
- **Orphaned Pages** — Any pages with zero internal links pointing to them?

---

## Phase 2: Keyword Research

### 2.0 Keyword Ranking Status Check

**Run this before all other keyword research.** Check whether the client currently ranks for their most important keywords so we know what's working, what needs boosting, and what's a full gap.

**If `clients/{slug}/gsc_data.md` exists:** Read it and use actual GSC positions as ground truth. Skip the proxy searches below for any keyword where GSC data is available.

**If no GSC data:** Use `firecrawl-search` as a proxy:
- For each candidate primary keyword (at minimum: `[target_service] [target_location]`, `[target_service] near me`, `best [target_service] [target_location]`):
  1. Search `site:[client_domain] [keyword]` — if client pages appear → **Ranking**
  2. Search `[keyword]` — if client appears but not in top 10 → **Weak** (positions 11–30)
  3. No client result found → **Gap**

**Classification tiers:**
- ✅ **Ranking** — Client page appears in top 10 results for this keyword
- ⚠️ **Weak** — Client page exists and ranks, but positions 11–30 (page 2+)
- ❌ **Gap** — No client page ranking for this keyword

Add the following table to the Phase 4 output under **Keyword Ranking Status**:

```
| Keyword | Status | Client Page | Notes |
|---------|--------|-------------|-------|
| [keyword] | ✅ Ranking | /services/heat-pump | Pos ~5 |
| [keyword] | ⚠️ Weak | /services/mini-splits | Pos ~18, page not optimized |
| [keyword] | ❌ Gap | None found | No dedicated page exists |
```

Note at the bottom: "GSC data used: yes/no" — this flags the data quality for the reader.

### 2.1 Identify Primary Keywords
Use `firecrawl-search` to find:
- Top-ranking pages for `[target_service] [target_location]`
- Related queries: "best", "near me", "cost of", "how much does", "[service] company [location]"

### 2.2 Long-Tail and Question Keywords
Use `firecrawl-search` to find:
- Cost/price queries: "how much does `[target_service]` cost in `[target_location]`", "`[target_service]` price `[target_location]`"
- Comparison queries: "`[target_service]` vs `[alternative]`", "should I `[action]` or `[alternative]`"
- Qualifier queries: "best `[target_service]` company near me", "licensed `[target_service]` contractor `[target_location]`", "affordable `[target_service]` `[target_location]`"
- Seasonal/emergency modifiers: "emergency `[target_service]`", "`[target_service]` same day", "`[target_service]` in winter/summer"

### 2.3 Local Expansion Keywords
- Identify 5–10 surrounding cities/neighborhoods within the service area (use the client's `overview.md` service area if listed, otherwise infer from the target location)
- Search `[target_service] [surrounding_city]` for each to confirm search demand exists
- Search what city+service keyword combinations the top competitors rank for (use `site:[competitor_domain]` + city name combinations)
- Document the full list of `[service] + [city]` pairs to target with location pages

### 2.4 Content Opportunity Keywords
Use `firecrawl-search` to identify informational queries:
- "how to `[related action]`", "what is `[related term]`", "signs you need `[target_service]`"
- "how long does `[target_service]` take", "is `[target_service]` worth it", "what happens during `[target_service]`"
- "DIY vs professional `[target_service]`", "how to choose a `[target_service]` company"
These become blog/content targets. Note each keyword and its search intent.

### 2.5 Keyword Clustering
Group all keywords discovered in Phases 2.1–2.4 into three buckets. This output is consumed directly by `seo_site_structure.md` and `seo_content_engine.md`.

**Bucket A — Service Page Targets**
| Keyword | Search Intent | Priority |
|---------|--------------|----------|
| (high-intent buying keywords — "service + location", "best service company", "licensed contractor") | Commercial | Critical/High/Medium |

**Bucket B — Location Page Targets**
| Keyword | City | Priority |
|---------|------|----------|
| (city+service combinations for each surrounding area) | | |

**Bucket C — Blog/Informational Targets**
| Keyword | Search Intent | Internal Link Target |
|---------|--------------|---------------------|
| (how-to, what-is, signs-you-need queries) | Informational | (which service page this should feed) |

Minimum: 5 keywords per bucket. Flag if any bucket is under 5 and explain why.

### 2.6 Competitor Keyword Gaps
For each known competitor:
- Search `site:[competitor_domain]` to see their indexed pages
- Search `[competitor_name] [target_service]` to see where they rank
- Note which keywords they rank for that the client does not

### 2.7 Local Pack Analysis
Search `[target_service] near me` and `[target_service] [target_location]`:
- Who appears in the Google Local Pack (top 3 map results)?
- Does the client appear? If not, identify why (review volume, category mismatch, distance)
- How many reviews do Local Pack leaders have vs. the client?
- **GBP Existence Check** — Does the client have a GBP at all? If `gbp_url` was provided, confirm it resolves. If not, flag as Critical.
- **Category Alignment** — What primary category do Local Pack leaders use? Does the client's category match?

---

## Phase 3: Competitor Comparison

For each known competitor (up to `competitor_count`), scrape their primary service page for `target_service`.

Compare:
- Page structure and content depth
- Keyword usage in title, H1, body
- Trust signals (reviews, years in business, certifications)
- CTAs and conversion elements

### 3.1 Schema Markup Detection
For each competitor page scraped: check for JSON-LD in the page source. Note which schema types are present (LocalBusiness, Service, FAQPage, Review, AggregateRating). Flag if competitors have schema and the client does not.

### 3.2 Backlink Proxy
For each competitor: run `site:[competitor_domain]` to get total indexed pages as a rough authority proxy. More indexed pages generally correlates with higher authority.

### 3.3 Content Velocity
- Does the competitor have a blog or resource section?
- When was the most recent post published?
- Estimated post frequency (multiple recent posts = active content program)
- Note: an active blog signals topical authority investment

Build a comparison table: Client vs. each competitor across all dimensions.

| Signal | Client | Competitor 1 | Competitor 2 |
|--------|--------|-------------|-------------|
| Page title includes keyword | | | |
| H1 includes keyword | | | |
| Word count (est.) | | | |
| Trust signals | | | |
| CTA present | | | |
| Schema markup | | | |
| Schema types | | | |
| Total indexed pages | | | |
| Active blog | | | |

---

## Phase 4: Synthesis — The SEO Audit Report

Produce the full audit in this structure:

### Executive Summary
- 3–5 sentence overview of current SEO health
- Top 3 opportunities
- Top 3 risks
- Note: which downstream SEO modules should be run next and in what order

### Technical SEO Checklist
| Signal | Status | Priority | Notes |
|--------|--------|----------|-------|
| HTTPS | ✅/❌ | Critical/High/Medium | |
| robots.txt | ✅/❌ | | |
| XML Sitemap | ✅/❌ | | |
| Canonical Tags | ✅/❌ | | |
| No 404s | ✅/❌ | | |
| Mobile Viewport | ✅/❌ | | |
| LocalBusiness Schema | ✅/❌ | | |
| Service Schema | ✅/❌ | | |
| NAP Consistency | ✅/❌ | | |
| GBP Linked on Site | ✅/❌ | | |
| Trust Signals Visible | ✅/❌ | | |
| GBP Exists | ✅/❌ | | |

### On-Page Audit
| Page | Issue | Priority | Recommended Fix |
|------|-------|----------|-----------------|

Rate each issue: **Critical** / **High** / **Medium** / **Low**

### Keyword Research Output
This section is consumed by `seo_site_structure.md` and `seo_content_engine.md`. Reproduce the full clustered keyword table from Phase 2.5 here.

**Bucket A — Service Page Targets** (reproduce full table)
**Bucket B — Location Page Targets** (reproduce full table)
**Bucket C — Blog/Informational Targets** (reproduce full table)

### Keyword Ranking Status
Reproduce the full table from Phase 2.0 here (Ranking / Weak / Gap tiers). Include the "GSC data used: yes/no" note.

### Keyword Gap Analysis
List keywords the client is not ranking for (❌ Gap tier from above), ordered by estimated search volume and buyer intent.

### Local Pack Status
- Is the client in the top 3? Why or why not?
- GBP existence and category alignment
- Review count vs. Local Pack leaders
- What would move them into the Local Pack?

### Competitor Advantages
What are the top 1–2 competitors doing that is working? What can be directly replicated?

### 90-Day Action Plan
Numbered list, ordered by impact. Each action should be:
- Specific and executable
- Assigned a difficulty: Easy / Medium / Hard
- Tied to a measurable outcome
- Labeled with which downstream module handles it: **(→ Technical fix)** | **(→ Site Structure)** | **(→ GBP)** | **(→ Content Engine)**

### AI Builder Change Brief

*This section is for clients whose websites are built with an AI website builder (e.g. Anti Gravity, Framer AI, Wix ADI). Paste the instructions directly into the builder as a change request.*

Produce the top 5 highest-impact, lowest-effort changes — formatted as direct, paste-ready instructions. Pull from the On-Page Audit and 90-Day Action Plan. Prioritize changes that:
- Require no new pages (text edits on existing pages)
- Fix Critical or High priority issues first
- Take less than 2 hours each

Format each change as:

```markdown
## AI Builder Change Brief
*Copy and paste each change below directly into your website builder as a change request.*

**Change 1 — [Short title]**
[Page URL or section]: [Exact current text or state]
→ Change to: [Exact replacement text or instruction]
Why: [One sentence on the SEO impact]

**Change 2 — ...**
```

If a required change involves creating a new page (not just editing existing content), flag it separately:

```
**🆕 New Page Required — [Page Name]**
URL: /[recommended-slug]
Target keyword: [keyword]
Content needed: [1-2 sentence brief on what this page should contain]
Note: This requires creating a new page in your builder, not just editing existing content.
```

Minimum: 5 changes total (mix of edits and new page flags as applicable).

---

## Phase 5: Quality Check

Before delivering:
- [ ] Every claim is grounded in scraped data — no generic SEO advice
- [ ] Keyword recommendations match the ICP's actual search behavior
- [ ] Action plan is prioritized by impact, not difficulty
- [ ] Competitor claims are traceable to actual scraped pages
- [ ] No filler sections — if data wasn't available, say so and explain why
- [ ] Keyword clusters are complete: ≥5 keywords per bucket (A, B, and C)
- [ ] Technical SEO checklist is fully populated — no blank rows
- [ ] GBP existence is confirmed or flagged as unknown
- [ ] 90-Day Action Plan labels which downstream module handles each action
- [ ] Keyword Ranking Status table is present with ✅/⚠️/❌ tiers and GSC data note
- [ ] AI Builder Change Brief has ≥5 entries with exact text replacements (not generic advice)

---

## Output Format
Save the completed audit as a `workflow_output` of type `seo_audit`.

The report should be delivered as clean markdown that can be copied directly into a Google Doc or shared with the client.

**Important:** The Keyword Research Output section (Phase 4) must be present in full — it is the data contract between this workflow and the downstream SEO modules. Do not summarize or truncate it.
