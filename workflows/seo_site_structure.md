# SEO Site Structure Generator

## Objective
Generate a complete site architecture for a local service business based on the keyword clusters produced by the SEO Audit. Every recommended URL must map to a keyword with confirmed search demand. The output of this workflow is consumed by `seo_content_engine.md` and `seo_game_plan.md`.

## Prerequisites
- Client folder exists (overview, services loaded)
- ICP document is complete
- **`seo_audit.md` must have been run first** — the keyword cluster output (Buckets A, B, C from Phase 2.5) is required

## Required Inputs
- `target_service` — The primary service (must match the audit input)
- `target_location` — The geographic target (must match the audit input)

## Optional Inputs
- `service_count` — How many service pages to plan for: `all` (default) | `3` | `5` | `10`
- `location_count` — How many location pages to plan for: `primary_only` | `3` | `5` (default) | `10`
- `include_blog_structure` — Whether to plan blog pages: `true` (default) | `false`

## Tools Available
- `firecrawl-map` — Discover all existing URLs on the client's domain
- `firecrawl-search` — Validate search demand for location-level keywords
- `firecrawl-scrape` — Check competitor site structures for pattern reference

---

## Phase 0: Load Prior Audit Data

1. Read the most recent `seo_audit` workflow output for this client
2. Extract the full keyword clusters:
   - **Bucket A** — Service page target keywords
   - **Bucket B** — Location page target keywords
   - **Bucket C** — Blog/informational target keywords
3. Note the client's services list from `clients/{slug}/services.md`
4. Note the client's website URL from `clients/{slug}/overview.md`

**If no `seo_audit` output exists:** Stop immediately. Tell the user: "Site Structure requires a completed SEO Audit. Run the SEO Audit first — it produces the keyword clusters this workflow depends on."

---

## Phase 1: Current Site Structure Audit

Use `firecrawl-map` on the client's website URL to discover all indexed pages.

For each URL discovered, categorize it:
- **Homepage** — `/`
- **Service page** — page about a specific service
- **Location page** — page targeting a city or region
- **Blog/content** — informational article or resource
- **About/team** — company information page
- **Contact** — contact or quote page
- **Other** — footer pages, legal, etc.

Then identify gaps:

**Missing Service Pages**
Compare discovered service pages against `services.md`. List any services that have no dedicated page.

**Missing Location Pages**
Compare discovered location pages against the Bucket B keywords from the audit. List any city+service combinations that are missing.

**Orphaned Pages**
Note any pages with no internal links pointing to them (they exist but can't be discovered by crawlers or users navigating the site).

**Over-indexing Issues**
Note any near-duplicate pages, paginated content without proper canonicalization, or parameter-based URLs that should be noindexed.

---

## Phase 2: Recommended Site Architecture

Generate the full recommended URL structure. Every URL must have:
- A mapped target keyword from the audit's keyword clusters
- A priority level: **Critical** (missing, high-volume keyword) / **High** (missing, medium-volume) / **Medium** (exists but needs improvement)
- A status: **Exists** | **Create** | **Improve**

Recommended structure:

```
/                                               ← Homepage (target: brand + city)
│
├── /services/                                  ← Services hub (optional, if many services)
│   ├── /services/[primary-service]/            ← Primary service page (Bucket A, highest volume)
│   ├── /services/[service-2]/                  ← Additional service pages
│   └── /services/[service-n]/
│
├── /[city]/                                    ← Location hub (target city)
│   ├── /[city]/[primary-service]/              ← City+Service landing page (Bucket B)
│   ├── /[city]/[service-2]/
│   ├── /[surrounding-city-1]/[primary-service]/
│   └── /[surrounding-city-n]/[service]/
│
├── /blog/                                      ← Blog hub (if include_blog_structure: true)
│   ├── /blog/[informational-slug-1]/           ← Content opportunity page (Bucket C)
│   └── /blog/[informational-slug-n]/
│
├── /about/                                     ← E-E-A-T signal page
└── /contact/                                   ← CTA conversion page
```

For each URL in the plan, produce a row in the architecture table:

| URL | Status | Target Keyword | Bucket | Priority | Notes |
|-----|--------|---------------|--------|----------|-------|

Apply `service_count` and `location_count` filters from the optional inputs to limit the scope if specified.

---

## Phase 3: Internal Linking Architecture

Map the internal link relationships that should exist. This is the navigation and authority flow of the site.

**Linking Rules:**
1. **Homepage → Service pages** — Homepage should link directly to the top 5 service pages (text links in body or navigation, not just footer)
2. **Service page → Location variants** — Each service page should link to its city+service variants
3. **Service page → Related services** — Cross-link related services (e.g., HVAC repair links to HVAC installation)
4. **Service page → Relevant blog posts** — Each service page should link to the top 2–3 blog posts that support it
5. **Location pages → Service hub** — Each location page links back to the parent service page
6. **Location pages → Sibling locations** — Optional: link nearby city pages to each other
7. **Blog posts → Service pages** — Every blog post should have 1–2 contextual links to the most relevant service or location page
8. **Blog posts → Contact/CTA** — All blog posts should include a CTA linking to contact or a primary service page

Produce the internal linking plan table:

| Source Page | Should Link To | Suggested Anchor Text | Currently Exists? | Priority |
|-------------|---------------|----------------------|------------------|----------|

Identify the top 5 linking gaps (links that don't exist but have the highest SEO impact).

---

## Phase 4: Synthesis Output

### Section 1: Current vs. Recommended Structure

| Page Type | Currently Exists | Recommended | Target Keyword | Priority |
|-----------|-----------------|-------------|---------------|----------|

### Section 2: Full URL Architecture

Reproduce the full URL tree from Phase 2 with all fields populated.

### Section 3: Missing Pages — Priority Build Queue

List all pages with status **Create**, ordered by priority (Critical first, then High, then Medium).

| Priority | URL to Create | Target Keyword | Est. Search Volume | Difficulty |
|----------|---------------|---------------|-------------------|------------|

This is the direct input to `seo_content_engine.md` for content brief generation.

### Section 4: Internal Linking Plan

Reproduce the full linking plan table from Phase 3. Highlight the top 5 gaps.

### Section 5: Quick Wins

List any existing pages that can be improved with minimal effort:
- Add internal links (specify source and destination)
- Update page title to include keyword (specify old → new)
- Add missing H1 or fix duplicate H1
- Add CTA where missing

---

## Phase 5: Quality Check

Before delivering:
- [ ] Every recommended URL maps to a keyword from the SEO Audit's keyword clusters
- [ ] No two pages target the same primary keyword (keyword cannibalization check complete)
- [ ] Internal linking plan covers all service and location pages
- [ ] Blog structure is included if `include_blog_structure` is true
- [ ] Missing pages queue is ordered by priority, not alphabetically
- [ ] `service_count` and `location_count` filters have been applied correctly
- [ ] Phase 4, Section 3 (Missing Pages Build Queue) is formatted for direct handoff to `seo_content_engine.md`

---

## Output Format
Save the completed output as a `workflow_output` of type `seo_site_structure`.

The output should be clean markdown. The URL architecture table and Missing Pages Build Queue must be present in full — they are the data contract between this workflow and `seo_content_engine.md`.
