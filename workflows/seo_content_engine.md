# SEO Content Engine

## Objective
Produce fully-scoped content briefs for every page in the site structure plan. Each brief tells a writer (human or AI) exactly what to write, what keywords to target, what structure to use, and what proof points to include. Nothing here is generic — all recommendations are pulled from scraped competitor data and the client's ICP.

## Prerequisites
- Client folder exists (overview, services, ICP loaded)
- **`seo_audit.md` must have been run** — keyword clusters are required
- `seo_site_structure.md` is recommended but not required — if it has been run, read the Missing Pages Build Queue from its output

## Required Inputs
- `target_service` — The primary service (must match the audit input)
- `target_location` — The geographic target (must match the audit input)
- `page_type` — Which brief type(s) to produce: `all` | `service_page` | `location_page` | `blog_post`

## Optional Inputs
- `word_count_target` — Target word count for pages (default: `800-1200`)
- `include_schema_recommendations` — Include JSON-LD schema type recommendations per page: `true` (default) | `false`
- `include_faq_sections` — Include FAQ section with People Also Ask data: `true` (default) | `false`

## Tools Available
- `firecrawl-scrape` — Scrape top-ranking competitor pages for each target keyword
- `firecrawl-search` — People Also Ask (PAA) data, search intent analysis
- `firecrawl-browser` — JS-rendered pages where needed

---

## Phase 0: Load Context

1. Read the most recent `seo_audit` workflow output — extract keyword clusters (Buckets A, B, C)
2. If `seo_site_structure` output exists for this client, read the Missing Pages Build Queue (Phase 4, Section 3) — this is the priority order for briefs
3. Read ICP document — specifically:
   - **Profile 2 (ICP):** Customer pain points, emotional triggers, private concerns
   - **Profile 3 (Offer Extraction):** Trust signals, proof points, guarantees, credentials
   - **Profile 4 (Messaging & Positioning):** Brand voice, objection reframes, key angles
4. Read `clients/{slug}/reviews_raw.md` — extract any reviews that mention specific cities or neighborhoods (used in location page briefs)

**If no `seo_audit` output exists:** Stop. Tell the user: "Content Engine requires a completed SEO Audit for keyword data. Run the SEO Audit first."

Filter to only the requested `page_type`. If `page_type: all`, run all three phases.

---

## Phase 1: Service Page Brief(s)

*Run if `page_type` is `all` or `service_page`*

For each service page in the site structure plan (or for `target_service` if no site structure output exists):

### Step 1.1 — Competitor Research
Use `firecrawl-scrape` on the top 2–3 ranking pages for `[target_service] [target_location]`.

Extract:
- Their page title format
- Their H1
- Their H2 structure (list all H2s)
- Approximate word count
- Trust signals they use
- CTA placement and copy
- Any schema types detectable

### Step 1.2 — PAA Research *(if `include_faq_sections: true`)*
Use `firecrawl-search` to find People Also Ask questions for `[target_service] [target_location]`.

Collect 6–8 questions. These become the FAQ section.

### Step 1.3 — Produce the Brief

For each service page, output:

---
**SERVICE PAGE BRIEF: [Service Name] — [Location]**

**Target URL:** `/services/[service-slug]/` (or the URL from the site structure plan)
**Target Keyword (Primary):** [primary keyword from Bucket A]
**Target Keywords (Secondary):** [2–3 secondary keywords from Bucket A]
**Competitor Pages Analyzed:** [URLs scraped]

**Page Title:**
`[Primary Keyword] in [Location] | [Company Name]`
*Max 60 characters. Primary keyword first.*

**Meta Description:**
`[1–2 sentence description, 140–155 characters, includes keyword + location + CTA (e.g. "Get a free estimate")]`

**H1:**
`[Keyword-optimized H1 — matches search intent, benefit-forward, includes location]`

**Required H2 Sections (minimum 5):**

| H2 | Purpose | Key Points to Cover |
|----|---------|-------------------|
| [H2 text] | [Why this section: ICP pain point / trust signal / keyword] | [2–3 bullets] |
| [H2 text] | | |
| [H2 text] | | |
| [H2 text] | | |
| [H2 text] | | |

*H2 recommendations are drawn from: (1) competitor H2 patterns, (2) ICP Profile 2 pain points, (3) ICP Profile 4 messaging angles.*

**Word Count Target:** [from optional input, default 800–1200]

**Required Trust Signals to Include:**
- [Specific credential from ICP Profile 3, e.g., "Licensed & Insured in [State]"]
- [Years in business if available]
- [Guarantee or warranty if available]
- [Review count or rating if available — source from overview.md]

**Required Proof Points:**
- [Specific testimonial type from ICP, e.g., "Quote from a customer about fast response time"]
- [Stat or outcome from ICP Profile 3, e.g., "X jobs completed"]
- [Before/after signal if applicable]

**CTA Recommendations:**
- Primary CTA: [button text + action, e.g., "Get Your Free Estimate — Call (555) 555-5555"]
- Secondary CTA: [trust element, e.g., "Licensed & Insured badge + 'No obligation' text"]
- CTA placement: Above fold (below H1), end of each major section, sticky mobile bar

**FAQ Section:** *(if `include_faq_sections: true`)*
| Question | Answer |
|----------|--------|
| [PAA question 1] | [2–3 sentence answer, uses keyword naturally] |
| [PAA question 2] | |
| [PAA question 3] | |
| [PAA question 4] | |
| [PAA question 5] | |
| [PAA question 6] | |

**Schema Recommendations:** *(if `include_schema_recommendations: true`)*
- `LocalBusiness` — business name, address, phone, hours
- `Service` — service name, description, areaServed
- `FAQPage` — wrap FAQ section
- `AggregateRating` — if review count and average are available

**Internal Links to Include:**
- Link to: [location page for target city + service] — Anchor: "[Service] in [City]"
- Link to: [related service page if applicable]
- Link to: [most relevant blog post from Bucket C]
- Link to: /contact/ — Anchor: "Get a free estimate"

---

Repeat for each service page in scope.

---

## Phase 2: Location Page Brief(s)

*Run if `page_type` is `all` or `location_page`*

Location pages must be meaningfully different from the primary service page — not just the city name swapped in. They should feel like they were written specifically for that city.

For each city+service combination in Bucket B:

### Step 2.1 — City Signal Research
Use `firecrawl-search` to find any local context signals for this city:
- Any local news or neighborhoods relevant to the service
- Search `[service] [city]` to see what the top-ranking page covers

### Step 2.2 — City-Specific Reviews
Scan `clients/{slug}/reviews_raw.md` for any reviews that mention this city, neighborhood, or nearby area. Extract direct quotes.

### Step 2.3 — Produce the Brief

---
**LOCATION PAGE BRIEF: [Service Name] in [City Name]**

**Target URL:** `/[city-slug]/[service-slug]/`
**Target Keyword (Primary):** `[service] [city]`
**Target Keywords (Secondary):** `[service] near me`, `[service] [city] [state]`, `best [service] [city]`

**Page Title:**
`[Service] in [City], [State] | [Company Name]`

**Meta Description:**
`[140–155 characters, mentions city, service, and differentiator (e.g., "local, licensed, same-day")]`

**H1:**
`[Service] in [City] — [Benefit or differentiator]`

**What Makes This Page Unique (vs. the primary service page):**
This page must have unique content. Differentiation signals to include:
- Specific mention of the city, neighborhood names, or county
- Any city-specific context (e.g., "We serve homeowners throughout [City], including [neighborhoods]")
- City-specific review quote (if available from `reviews_raw.md`): `"[Quote]"` — [Reviewer first name], [City]
- Service area proximity statement: "We're based in [primary city] and serve [target city] with [response time] typical response times"

**Required H2 Sections (minimum 4):**
| H2 | Purpose |
|----|---------|
| [Service] Services in [City] | Main content section — describe the service in context of this city |
| Why [City] Homeowners Choose [Company Name] | Trust signals + city-specific social proof |
| Service Areas Near [City] | Internal links to sibling location pages + service area confirmation |
| Get a Free [Service] Estimate in [City] | CTA section |

**NAP Block (for footer or sidebar):**
```
[Company Name]
[Address]
[City, State ZIP]
Phone: [Phone]
Service Area: [City] and surrounding areas
```
Include `LocalBusiness` schema on this block.

**Internal Links:**
- Link to: `/services/[primary-service]/` — Anchor: "[Service] Services"
- Link to: `/contact/` — Anchor: "Get a free estimate"
- Link to: [1–2 sibling location pages from Bucket B] — Anchor: "[Service] in [Sibling City]"

**Schema:** `LocalBusiness` + `Service` with `areaServed` set to this city

---

Repeat for each location page in scope.

---

## Phase 3: Blog Content Brief(s)

*Run if `page_type` is `all` or `blog_post`*

Blog posts build topical authority and capture informational traffic that eventually converts. Every blog post must have a clear internal link path back to a commercial service or location page.

For each keyword in Bucket C (informational targets):

### Step 3.1 — SERP Research
Use `firecrawl-search` to find: what type of content currently ranks for this keyword (list post, how-to guide, FAQ, video, etc.), and use `firecrawl-scrape` on the top result to see its structure.

### Step 3.2 — PAA Research
Use `firecrawl-search` for People Also Ask questions for this keyword. Collect 4–6 questions.

### Step 3.3 — Produce the Brief

---
**BLOG BRIEF: [Keyword / Topic]**

**Target URL:** `/blog/[slug]/`
**Target Keyword (Primary):** [keyword from Bucket C]
**Target Keywords (Secondary):** [2–3 related terms]
**Search Intent:** Informational / Commercial Investigation *(classify based on keyword)*

**Headline Options (pick one):**
1. [Headline using ICP voice — problem-aware format]
2. [Headline using list format — "X Signs You Need..."]
3. [Headline using question format — "How to..."]

**Content Outline:**

**Intro (100–150 words):**
- Hook: [specific pain point or scenario from ICP Profile 2]
- What this article covers
- Who this is for

**Section 1 — [H2]:** [Key points to cover, ~150–200 words]
**Section 2 — [H2]:** [Key points to cover]
**Section 3 — [H2]:** [Key points to cover]
**Section 4 — [H2]:** [Key points to cover]
**Section 5 — [H2] (Optional):** [Only if needed]

**FAQ Section (4–6 questions from PAA):**
| Question | Answer |
|----------|--------|
| [PAA question] | [2–3 sentences] |

**Conclusion + CTA (100–150 words):**
- Recap key points
- Transition to commercial intent: "If you're dealing with [problem], [Company Name] can help..."
- CTA: [specific link to service or location page with anchor text]

**E-E-A-T Signals to Include:**
- First-hand experience language: "In our experience..." / "After completing [X] jobs in [location]..."
- Specific example or scenario (can be anonymized)
- Data point or stat (cite a real source)
- Author note (if applicable): "[Name], [Title] at [Company], [Years] in the industry"

**Word Count Target:** [from optional input, default 800–1200]

**Internal Links:**
- Primary: Link to `/services/[most-relevant-service]/` — Anchor: "[Service Name]"
- Secondary: Link to `/[city]/[service]/` — Anchor: "[Service] in [City]"
- Optional: Link to 1 related blog post (once published)

**Schema:** `Article` + `FAQPage` *(if `include_schema_recommendations: true`)*

---

Repeat for each blog topic in scope.

---

## Phase 4: Master Content Brief Summary

### Content Brief Table

| Page | Type | Target URL | Primary Keyword | Word Count | Priority | Status |
|------|------|-----------|----------------|------------|----------|--------|
| [Page name] | Service/Location/Blog | [URL] | [Keyword] | [target] | Critical/High/Medium | Briefed |

### Handoff Notes

- All briefs are ready for writer assignment
- Pages marked **Critical** should be created first
- Location pages require a city-specific review quote — check `reviews_raw.md` for each city; if none found, the writer should request one from the client
- Blog posts should be published with author attribution for E-E-A-T — confirm with client who will be credited

---

## Phase 5: Quality Check

Before delivering:
- [ ] Every brief maps to a keyword from the SEO Audit's keyword clusters
- [ ] No two briefs target the same primary keyword (cannibalization check)
- [ ] Service page briefs include trust signals grounded in the client's actual credentials from ICP Profile 3 — not invented
- [ ] All FAQ questions are pulled from PAA data, not invented
- [ ] Location page briefs have unique content signals beyond just city name substitution
- [ ] Blog briefs have a clear internal link path to a commercial page
- [ ] E-E-A-T signals are included in every blog brief
- [ ] Schema recommendations are present on every brief *(if `include_schema_recommendations: true`)*

---

## Output Format
Save the completed output as a `workflow_output` of type `seo_content_engine`.

Output is clean markdown. Each brief section must be complete and ready for handoff — no placeholder content except for customer-specific variables.
