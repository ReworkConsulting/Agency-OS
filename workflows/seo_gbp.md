# GBP Optimization Workflow

## Objective
Audit the client's Google Business Profile against Local Pack competitors and produce a specific, data-driven GBP optimization plan. All deliverables in this workflow are ready to use — the description, post scripts, and review templates can be copy-pasted directly without further editing.

## Prerequisites
- Client folder exists (overview, services, ICP loaded)
- **`seo_audit.md` must have been run first** — the Local Pack Analysis (Phase 2.7) and competitor data are required

## Required Inputs
- `target_service` — The primary service (must match the audit input)
- `target_location` — The geographic target (must match the audit input)
- `gbp_url` — The client's Google Business Profile URL (pre-filled from client record if set)

## Optional Inputs
- `include_post_scripts` — Generate 4 weeks of GBP post copy: `true` (default) | `false`
- `include_review_templates` — Generate review request templates: `true` (default) | `false`
- `competitor_gbp_urls` — Paste competitor GBP URLs (one per line) to analyze directly. If not provided, use the Local Pack competitors identified in the SEO Audit.

## Tools Available
- `firecrawl-browser` — JS-rendered GBP page scraping (GBPs require a real browser)
- `firecrawl-search` — Local Pack analysis and People Also Ask data
- `firecrawl-scrape` — Competitor GBP page scraping (fallback if browser fails)

---

## Phase 0: Load Prior Audit Data

1. Read the most recent `seo_audit` workflow output for this client
2. Extract from the audit:
   - Local Pack Analysis (Phase 2.7): who appears in the top 3, their review counts, GBP category data
   - Competitor list: top 2–3 competitors identified during the audit
3. Read `clients/{slug}/overview.md` for: GBP URL (if not provided as input), review count, business category, address/phone
4. Read `clients/{slug}/services.md` for the full services list

**If no `seo_audit` output exists:** Stop. Tell the user: "GBP Optimization requires a completed SEO Audit for the Local Pack data. Run the SEO Audit first."

**If `gbp_url` is not available** from either the input or `overview.md`: Note that Phase 1 (client GBP audit) will be limited to what's publicly discoverable via search. Continue — the competitor analysis and deliverables can still be produced.

---

## Phase 1: Client GBP Audit

Use `firecrawl-browser` on the client's GBP URL. If the browser tool fails, use `firecrawl-scrape` as fallback and note any data that couldn't be captured.

Capture and evaluate each signal:

| Signal | Captured Value | Benchmark | Status |
|--------|---------------|-----------|--------|
| Business name (exact) | | Should match website exactly | |
| Primary category | | Should match top Local Pack leader | |
| Additional categories | | 3–5 additional categories recommended | |
| Total review count | | Compare to Local Pack leader | |
| Average star rating | | 4.5+ is competitive | |
| Review response rate | | 100% response recommended | |
| Photo count | | 20+ photos recommended | |
| Most recent post date | | Within last 7 days ideally | |
| Services listed in GBP | | Should match `services.md` | |
| Q&A section | | Pre-seeded Q&A recommended | |
| "From the business" description | | 750 chars, keyword-optimized | |
| Website URL listed | | Must be present and correct | |
| Hours completeness | | All days + holiday hours | |

---

## Phase 2: Competitor GBP Audit

For each Local Pack competitor (from the SEO Audit or from `competitor_gbp_urls` input):

Use `firecrawl-browser` on each competitor's GBP. Capture the same signals as Phase 1.

Focus on:
- What primary category do they use?
- What additional categories are they using that the client is not?
- How many reviews do they have and what's their average?
- How frequently do they post?
- Do they have a "From the business" description? Is it keyword-optimized?
- What services are listed in their GBP services section?

---

## Phase 3: Gap Analysis

Build a comparison table:

| Signal | Client | Competitor 1 | Competitor 2 | Gap Level |
|--------|--------|-------------|-------------|-----------|

**Gap Level:** Critical / High / Medium / Low

Rank the gaps by estimated Local Pack ranking impact (in this order, highest impact first):

1. **Review count gap** — The single biggest Local Pack ranking signal. If the client has 30 reviews and Local Pack leaders have 200+, this is the #1 priority.
2. **Primary category mismatch** — Wrong primary category can completely prevent Local Pack inclusion.
3. **Additional categories missing** — Each additional category expands the keyword surface area.
4. **Review response rate** — Low response rate = lower trust signal to Google.
5. **Photo count gap** — More photos = higher engagement signal.
6. **Post frequency gap** — Active posters signal an engaged business to Google.
7. **Services section completeness** — Missing services = missed ranking opportunities.
8. **Q&A not seeded** — Unseeded Q&A can be hijacked by competitors or filled with bad questions.
9. **"From the business" description missing or unoptimized** — Lost keyword opportunity.

---

## Phase 4: Optimization Deliverables

### 4.1 Category Recommendations

Based on the Local Pack competitor analysis:

- **Recommended primary category:** [category name]
  - *Why:* [Which Local Pack leader uses this, and why it's the best match for `target_service`]
- **Recommended additional categories (up to 9 more):**
  - [Category 1] — *Why:* [ranking opportunity or competitor uses this]
  - [Category 2–9 as applicable]

### 4.2 Optimized GBP Business Description

Write an optimized description using the following rules:
- Maximum 750 characters
- First sentence includes the primary keyword (`target_service + target_location`) naturally
- Mention a key differentiator (years in business, licensed/insured, guarantee, response time)
- Include a CTA in the final sentence (call, get a quote, visit the website)
- Use the client's brand voice from ICP Profile 1 — avoid generic marketing language
- Do NOT include URLs, phone numbers, or special characters (Google will reject them)

**Draft description:**
> [Full 750-character description ready to copy-paste]

### 4.3 Services Section

List all services from `services.md` formatted as GBP service entries. For each service, include:
- **Service name** (short, matches how customers search)
- **Service description** (1–2 sentences, keyword-natural, benefit-focused)

Format:
```
[Service Name]
[Description: 1-2 sentences]

[Service Name]
[Description: 1-2 sentences]
```

### 4.4 Photo Strategy

**Minimum photo count recommendation:** [N] photos (based on gap with Local Pack leaders)

**Required photo types:**
| Type | Count | Notes |
|------|-------|-------|
| Exterior (business location or job sites) | 5+ | Show the work environment |
| Interior (if applicable) | 2–3 | Show the workspace or team environment |
| Team/staff | 3–5 | Faces build trust |
| Work in progress | 5+ | Document jobs being done |
| Completed jobs | 5+ | Before/after where possible |
| Equipment/vehicles | 2–3 | Branding on vehicles is a local signal |

**Geo-tagging instruction:**
Photos taken at job sites carry embedded GPS coordinates that support local relevance signals. Before uploading:
1. For job site photos: verify the EXIF location data is intact (most smartphone photos automatically embed GPS)
2. For studio/office photos: use a free EXIF editor (e.g., ExifTool or a mobile app) to remove inaccurate location data rather than add a fake location
3. Do not manually add GPS coordinates to photos not taken at a real local job site

### 4.5 Review Generation System *(if `include_review_templates: true`)*

**Review velocity target:**
- Client current reviews: [N]
- Local Pack leader reviews: [N]
- Gap: [N reviews]
- Target: [N reviews/month to close the gap in 6 months]

**SMS Request Template** (send 24–48 hours after job completion):
> Hi [Customer Name], it was great working with you on your [service] project! If you have 60 seconds, an honest Google review would mean a lot to us. Here's the direct link: [Google Review Link]. Thanks, [Your Name] at [Company Name]

**Email Request Template** (send 2–3 days after job completion):
> Subject: How did your [service] go?
>
> Hi [Customer Name],
>
> We just wanted to check in — we hope your [service] project went smoothly and everything is working as expected.
>
> If you were happy with the work, it would help us a lot if you could leave us a quick Google review. It only takes about 60 seconds: [Google Review Link]
>
> If anything wasn't right, please reply to this email directly and we'll make it right.
>
> Thanks for choosing [Company Name].
> [Your Name]

**Verbal Script for Field Technicians** (use immediately after job is done, before leaving the site):
> "Hey [Customer Name], really glad we could get this taken care of for you. If the work was up to your expectations, we'd really appreciate a quick Google review — it helps a lot for a small business like ours. I can text you the link right now if that works?"

**3-Day Follow-Up** (if no review after 3 days, send once only):
> Hi [Customer Name], just following up on the [service] we completed — did everything go well? We'd still love a quick review if you have a moment: [Google Review Link]

### 4.6 GBP Post Strategy *(if `include_post_scripts: true`)*

**Recommended post types and cadence:**
- Minimum 1 post per week
- Mix: What's New (2/month), Offer (1/month), and Event/Seasonal (as relevant)
- Each post: 150–300 words, one CTA, primary keyword included naturally

**4 weeks of post copy:**

**Week 1 — What's New** (service spotlight):
> [Post copy using ICP brand voice, mentions target_service, target_location, includes a specific proof point or recent job detail, ends with CTA]

**Week 2 — Offer** (limited-time or seasonal):
> [Post copy for a real offer from services.md — e.g., free estimate, seasonal discount, financing option — specific dollar amount or % if applicable, clear expiry, CTA]

**Week 3 — What's New** (trust/authority signal):
> [Post copy highlighting a credential, certification, years in business, award, or notable job completion — specific not generic, ends with CTA]

**Week 4 — What's New** (social proof / recent job):
> [Post copy referencing a recent job type (not customer name for privacy) — what was done, the result, the location neighborhood if possible, ends with CTA]

### 4.7 Q&A Seeding

Pre-write 5–8 Q&A pairs using the most common questions from the SEO Audit's People Also Ask data and the client's services.

**How to post them:** Go to your GBP, scroll to the Q&A section, click "Ask a question," and post each question as yourself (logged in as the business owner or a personal Google account). Then switch to your business account and answer each question.

Format:
```
Q: [Common customer question]
A: [Helpful, honest answer — 2-4 sentences, mentions location and service naturally, ends with a way to contact you]
```

---

## Phase 5: Synthesis Output

### GBP Audit Score

Score the client's GBP on a 0–100 scale based on signal completeness:

| Signal Category | Weight | Client Score | Notes |
|----------------|--------|-------------|-------|
| Review count vs. Local Pack | 25 pts | | |
| Category optimization | 20 pts | | |
| Profile completeness (description, hours, services) | 20 pts | | |
| Photo count and quality | 15 pts | | |
| Post recency/frequency | 10 pts | | |
| Q&A presence | 5 pts | | |
| Review response rate | 5 pts | | |
| **Total** | **100 pts** | | |

**Overall GBP Score: [N]/100**

### Top 5 Priority Fixes

Ordered by estimated Local Pack ranking impact:

1. [Fix] — *Impact:* [Why this matters] — *Time to complete:* [estimate]
2. [Fix] — *Impact:* [Why this matters] — *Time to complete:* [estimate]
3. [Fix]
4. [Fix]
5. [Fix]

---

## Phase 6: Quality Check

Before delivering:
- [ ] Every gap claim traces to scraped competitor data — no assumed benchmarks
- [ ] Business description is exactly within 750 characters (count it)
- [ ] Description includes primary keyword naturally (not stuffed)
- [ ] Review templates are specific to the service type (not generic)
- [ ] Post scripts use the client's ICP voice (Profile 1) — not generic marketing language
- [ ] Post scripts mention `target_location` or a specific neighborhood naturally
- [ ] Q&A pairs are pulled from actual PAA data or genuine common questions for this service type
- [ ] Category recommendations are backed by what Local Pack leaders actually use

---

## Output Format
Save the completed output as a `workflow_output` of type `seo_gbp`.

All content blocks (description, post scripts, review templates, Q&A) must be fully written and ready to use — no placeholders except for customer-specific variables like `[Customer Name]` and `[Google Review Link]`.
