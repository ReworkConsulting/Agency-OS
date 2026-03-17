# SEO Audit Workflow

## Objective
Produce a complete local SEO audit for a home service business. Identify keyword gaps, on-page issues, competitor ranking advantages, and a prioritized action plan to improve organic search visibility and lead volume.

## Prerequisites
- Client record must exist in the system (overview, services, competitors loaded)
- ICP document must be completed first — the audit uses ICP audience data to prioritize keywords by buyer intent

## Required Inputs
- `target_service` — The primary service to audit (e.g. "Roof Replacement", "HVAC Installation")
- `target_location` — The geographic target (e.g. "Denver, CO")

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

---

## Phase 2: Keyword Research

### 2.1 Identify Primary Keywords
Use `firecrawl-search` to find:
- Top-ranking pages for `[target_service] [target_location]`
- Related queries: "best", "near me", "cost of", "how much does", "[service] company [location]"
- Question-based keywords: "how long does [service] take", "is [service] worth it"

### 2.2 Identify Competitor Keyword Advantages
For each known competitor:
- Search `site:[competitor_domain]` to see their indexed pages
- Search `[competitor_name] [target_service]` to see where they rank
- Note which keywords they rank for that the client does not

### 2.3 Local Pack Analysis
Search `[target_service] near me` and `[target_service] [target_location]`:
- Who appears in the Google Local Pack (top 3 map results)?
- Does the client appear? If not, identify why (review volume, category mismatch, distance)
- How many reviews do Local Pack leaders have vs. the client?

---

## Phase 3: Competitor Comparison

For each known competitor, scrape their primary service page for `target_service`.

Compare:
- Page structure and content depth
- Keyword usage in title, H1, body
- Trust signals (reviews, years in business, certifications)
- CTAs and conversion elements
- Schema markup presence (if detectable)

Build a comparison table: Client vs. each competitor across these dimensions.

---

## Phase 4: Synthesis — The SEO Audit Report

Produce the full audit in this structure:

### Executive Summary
- 3-5 sentence overview of current SEO health
- Top 3 opportunities
- Top 3 risks

### On-Page Audit
| Page | Issue | Priority | Recommended Fix |
|------|-------|----------|-----------------|

Rate each issue: **Critical** / **High** / **Medium** / **Low**

### Keyword Gap Analysis
List keywords the client is not ranking for but should be, ordered by estimated search volume and buyer intent.

### Local Pack Status
- Is the client in the top 3? Why or why not?
- What would move them into the Local Pack?

### Competitor Advantages
What are the top 1-2 competitors doing that is working? What can be directly replicated?

### 90-Day Action Plan
Numbered list, ordered by impact. Each action should be:
- Specific and executable
- Assigned a difficulty: Easy / Medium / Hard
- Tied to a measurable outcome

---

## Phase 5: Quality Check

Before delivering:
- [ ] Every claim is grounded in scraped data — no generic SEO advice
- [ ] Keyword recommendations match the ICP's actual search behavior
- [ ] Action plan is prioritized by impact, not difficulty
- [ ] Competitor claims are traceable to actual scraped pages
- [ ] No filler sections — if data wasn't available, say so and explain why

---

## Output Format
Save the completed audit as a `workflow_output` of type `seo_audit`.

The report should be delivered as clean markdown that can be copied directly into a Google Doc or shared with the client.
