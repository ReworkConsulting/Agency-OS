# Workflow: Build ICP Research Document

## Reference Documents
- `context/icp_framework.md` — defines the exact output structure, quality standards, and no-transcript protocol
- `context/client_model.md` — client folder structure and intake fields
- `context/agency.md` — Rework's positioning and niche (informs how we read the research)

---

## Objective

Produce a complete, six-profile ICP Research Document for a client by collecting real source material, synthesizing it accurately, and delivering a document that the entire team can use to write ads, scripts, emails, and landing pages.

The output is `clients/{client-name}/icp.md` — a living document built from real evidence, with every claim traceable to a source and every section rated for confidence.

**This workflow does not write copy. It produces the intelligence that makes copy possible.**

---

## Tools Used by This Workflow

All scraping and research is handled by **Firecrawl skills** — no Python tools required for collection. Claude handles synthesis directly.

| Task | Tool |
|---|---|
| Scrape website pages | `firecrawl-scrape` skill |
| Scrape Google reviews (JS-rendered) | `firecrawl-browser` skill |
| Search Reddit, X/Twitter, forums | `firecrawl-search` skill |
| Scrape Facebook business page | `firecrawl-scrape` skill |
| Scrape YouTube channel | `firecrawl-scrape` skill |
| Find competitor Google listing URLs | `firecrawl-search` skill |
| Scrape competitor Google reviews | `firecrawl-browser` skill |

---

## Step 0 — Gap Check & Client File Update

**Before anything else — read the client file and ask for what's missing.**

This step runs before pre-flight. It ensures you always work with the best information available, and that the client's files stay current.

### 0a — Read the client folder
Read `clients/{client-name}/overview.md` in full. Note every field that is `TBD` or blank.

Also check:
- `clients/{client-name}/services.md` — for service and pricing details
- `clients/{client-name}/competitors.md` — for any known competitors
- `clients/{client-name}/reviews_raw.md` — for any reviews already collected

### 0b — Present the gap list to the user
Show the user a clear summary of what you have and what's missing. Format:

```
Here's what I have for [Client Name]:

✅ Available
- Website URL
- Google Business Profile URL
- [list every field that has a real value]

⚠️ Missing (TBD or blank)
- Owner interview / Grill Them transcript
- Instagram URL
- YouTube channel
- [list every field that is TBD or blank]

Please provide anything you have for the missing items above. You don't need everything — provide what you can and I'll work with what's available. Anything you give me here will be saved to the client file before I start research.
```

### 0c — Update the client files with any new info provided
If the user provides anything — a transcript, a social media URL, a competitor name, an average job value — update `overview.md`, `services.md`, or `competitors.md` immediately before proceeding. This keeps the client files current regardless of what the ICP produces.

### 0d — Check for brand colors
If working in the Platform context, check whether `brand_primary_color` and `brand_secondary_color` are set for this client. If they're missing and the client has a known brand (logo, website with colors), note it:

> "Brand colors aren't set yet for [client name]. If you have their hex codes, set them under Brand settings in the Platform — they'll be applied automatically to the ICP document and PDF export."

If working in Claude Code only, skip this step.

### 0e — Proceed with what's available
Once the user has provided what they can (or confirmed they have nothing more), proceed to Pre-Flight. Do not wait indefinitely for missing information. If the user says "that's all I have" — that's the starting point, and the ICP will be built from it with honest confidence ratings.

---

## Pre-Flight Checklist

Do not begin research until every item below is confirmed or explicitly marked as unavailable.

### Required Inputs (must have before starting)
- [ ] **Client name** — used for folder naming and document header
- [ ] **Client website URL** — the site to be scraped (all service pages)
- [ ] **Client's Google Business Profile URL or business name + city** — for review scraping

### Strongly Recommended (proceed without, but flag as low-confidence)
- [ ] **Owner interview transcript ("Grill Them")** — if missing, build Profile 1 from digital footprint per no-transcript protocol in `icp_framework.md`
- [ ] **Competitor names + Google Business Profile URLs** — minimum 2 competitors
- [ ] **Industry / primary service** — HVAC, roofing, solar, etc.
- [ ] **Target geography** — city, region, or service area

### Optional (enrich if available)
- [ ] **Social content URLs** — Instagram, YouTube channel, Facebook page
- [ ] **Client's Facebook page URL** — for owner voice research when transcript missing
- [ ] **Any existing review exports or spreadsheets**

**If the owner interview transcript is missing:** Do NOT stop. Proceed using the No-Transcript Research Protocol (see icp_framework.md). Build Profile 1 from the digital footprint — website About/team page, Facebook posts, Google review responses written by the owner, and any video content. Label all Profile 1 sections MEDIUM or LOW confidence inline. Add the Missing Transcript Gap block to 1.9.

**If the client website is missing:** Stop. The website is required for Profile 3 (Offer Extraction). Ask for the URL.

---

## Red Flags — Check Before Every Step

The following conditions should trigger a pause and a message to the user before continuing. Do not silently proceed.

| Red Flag | What It Means | Action |
|---|---|---|
| Interview transcript is missing | Profile 1 will be inferred, not documented | Proceed with no-transcript protocol; flag all of Profile 1 as MEDIUM/LOW confidence |
| Fewer than 15 Google reviews total (client + competitors combined) | ICP data is too thin | Notify user, flag document as LOW CONFIDENCE, ask if they want to proceed or source more reviews |
| Only one source type available | Document will be unbalanced and speculative | Notify user, document which sections will be weak |
| Client and all competitors are in different markets | Competitor reviews won't reflect real ICP | Flag and ask user to confirm competitor list |
| Reviews are all 5-star with no specifics | Likely fake or generic — minimal ICP signal | Flag, note the limitation, use what signal exists |
| Website has no service-specific copy (generic/placeholder) | Offer extraction will be thin | Notify user, ask for any supplemental offer documents |
| Interview transcript contains contradictions | Conflicting statements create unreliable voice rules | Document the contradiction in the Analysis Pass, ask user for clarification |
| `clients/{client-name}/icp.md` already has content | Risk of overwriting prior work | Ask user: overwrite, append version (icp_v2.md), or abort |

---

## Phase 1: Source Collection

Collect all source material before writing anything. Do not begin synthesis until this phase is complete.

### Step 1 — Setup

1. Confirm all pre-flight inputs are present. If required inputs are missing, stop and request them.
2. Confirm the client folder exists: `clients/{client-name}/`
3. Check if `clients/{client-name}/icp.md` already has content — if yes, raise the red flag above and wait for instruction.
4. Tell the user: "Pre-flight complete. Beginning source collection for [client name]. I'll collect all sources before writing anything."

---

### Step 2 — Scrape the Client Website

Use the `firecrawl-scrape` skill on each of the following pages (in priority order):

1. Home page
2. Services pages (each service individually if they have separate pages)
3. About page (and any team/owner page)
4. Any FAQ or process page
5. Any testimonials, results, or guarantee page

**What to capture:** All visible copy — headlines, subheadings, body paragraphs, testimonials, CTAs, guarantee statements, and any quoted text. Skip nav menus, footers, cookie banners, and legal boilerplate.

Save the combined output as notes in context — label clearly as `[WEBSITE CONTENT]`.

**If a page fails to scrape:** Try `firecrawl-browser` for JS-rendered pages. If still unavailable, note the gap in the Analysis Pass.

---

### Step 3 — Collect Client Google Reviews

Use the `firecrawl-browser` skill on the client's Google Business Profile URL.

Target: All available reviews. Minimum 20 — capture everything if fewer than 50 exist.

**What to capture:** Full review text, star rating, reviewer first name (or anonymous), and approximate date. Capture verbatim — do not summarize.

**Also capture:** Any responses written by the owner — this is valuable voice data for Profile 1 when no transcript exists.

Save as notes — label clearly as `[CLIENT GOOGLE REVIEWS]`.

**If fewer than 10 reviews exist:** Flag as a red flag. Notify user. Proceed but mark Profile 2 as MEDIUM or LOW confidence.

**If Google URL scrape fails:** Use `firecrawl-search` with the query: `"[Business Name]" Google reviews site:google.com` or search for the business name directly to find the listing.

---

### Step 4 — Find and Scrape Competitor Reviews

**If competitors are not already identified:**
Use `firecrawl-search` to find them. Example queries:
- `best HVAC company [city] [state]`
- `heat pump installer [city] reviews`
- `[industry] contractor [city] Google reviews`

Select the top 3–5 locally-operating competitors. Confirm with the client's service area context.

**For each competitor:**
Use `firecrawl-browser` on their Google Business Profile URL to capture their reviews.

Target: 20+ reviews per competitor. Minimum 2 competitors required.

**What to capture:** Same as Step 3 — full review text, rating, name, date.

Save as notes — label each `[COMPETITOR REVIEWS: {Competitor Name}]`.

**If a competitor has no Google reviews:** Note it and move on.

---

### Step 5 — Reddit & Forum Research

Use `firecrawl-search` to find ICP voice data in online communities.

**Search queries to run (adapt to the client's industry and geography):**

1. `site:reddit.com [industry] [city or state] homeowner`
2. `site:reddit.com [industry] contractor reviews [geography]`
3. `site:reddit.com "looking for" [primary service] [geography]`
4. `site:reddit.com [primary service] "worth it" OR "is it worth"`
5. `site:reddit.com [primary service] "bad experience" OR "recommend"`
6. `site:reddit.com [industry subreddit] [primary service]`

Example for HVAC/heat pump in Massachusetts:
- `site:reddit.com HVAC heat pump Massachusetts homeowner`
- `site:reddit.com "heat pump" Boston OR Newton OR Wellesley "worth it"`
- `site:reddit.com r/HVAC mini split contractor experience`

Target: 10–20 relevant threads or comment chains. Capture raw text — questions people ask, complaints, what tipped them to act, what they wish they'd known.

Save as notes — label `[REDDIT / FORUM RESEARCH]`.

**If Reddit returns no relevant results:** Try Quora (`site:quora.com [topic]`), Nextdoor community posts, or HomeAdvisor/Angi review sections. Document what was tried in the Analysis Pass.

---

### Step 6 — Social Media & Digital Footprint Research

**Always run when transcript is missing. Run regardless when it adds value.**

**Facebook Business Page:**
Use `firecrawl-scrape` on the client's Facebook business page URL (if available). Capture posts, captions, and any about section.

**YouTube Channel:**
Use `firecrawl-scrape` on the client's YouTube channel URL (if available). Capture video titles, descriptions, and any about text.

**X / Twitter:**
Use `firecrawl-search` with: `site:x.com OR site:twitter.com "[Business Name]" OR "[Owner Name]"`

**Instagram:**
Use `firecrawl-scrape` on the public Instagram profile (if available). Capture post captions.

**Google Review Responses:**
From Step 3's output — pull every response written by the owner. These are direct owner voice.

Save as notes — label `[SOCIAL & DIGITAL FOOTPRINT]`.

---

### Step 7 — Process the Interview Transcript (If Available)

If the owner interview transcript was provided by the user (pasted in context or file path given):

1. Confirm it is present and readable
2. Note whether it is a raw recording transcription (with filler words, false starts) or a cleaned version — both are acceptable; raw requires more interpretation in synthesis
3. Label it clearly as `[INTERVIEW TRANSCRIPT]` in context

**If no transcript:** Skip this step. Profile 1 will be built from Step 6 (digital footprint) using the No-Transcript Research Protocol in `icp_framework.md`.

---

### Step 8 — Source Audit

Before moving to Phase 2, present this audit to the user:

| Source | Status | Volume | Notes |
|---|---|---|---|
| Website | ✅ / ❌ | # pages captured | Any gaps |
| Client reviews | ✅ / ❌ | # reviews | Confidence level |
| Competitor reviews | ✅ / ❌ | # per competitor | Confidence level |
| Reddit / forums | ✅ / ❌ | # threads | Confidence level |
| Social / digital footprint | ✅ / ❌ | What was found | Confidence level |
| Interview transcript | ✅ / ❌ / No-transcript protocol | Type | Any concerns |

If any critical source is missing, ask whether to proceed with reduced confidence or wait for the source.

---

## Phase 2: Synthesis

With all sources collected and the audit confirmed, build the six-profile document. Write directly into `clients/{client-name}/icp.md` using the skeleton already present in that file.

---

### Step 9 — Build Profile 1: Brand Voice

**If transcript is available:**
Primary source: Interview transcript.
Supporting sources: Website copy (About page, any owner-written content), Google review responses, social media.

**If no transcript (digital footprint protocol):**
Primary source: Website About/team page, owner's Google review responses, Facebook posts.
Supporting sources: Any YouTube/video content, Instagram captions.
Label every section MEDIUM or LOW confidence. Add the Missing Transcript Gap block to 1.9.

Follow the exact structure in `context/icp_framework.md` sections 1.1 through 1.9.

**Critical rules:**
- Every vocabulary term and phrase in 1.4 must come from confirmed content — not invented
- The "never use" list must be populated from observation, not assumption
- Voice Rules (1.9) must be directives derived from documented evidence, not generic writing advice
- The Sample Voice Recreation (1.8) must pass this test: if the owner read it, would they say "yes, that sounds like me"?
- If no transcript: add "⚠️ INFERRED — no transcript" inline after any section that is based on interpretation rather than direct evidence

---

### Step 10 — Build Profile 2: ICP

Primary sources: Client reviews, competitor reviews, Reddit threads.
Supporting sources: Interview transcript (owner's description of ideal client), website (any stated audience), social comments.

Follow the exact structure in `context/icp_framework.md` sections 2.1 through 2.10.

**Critical rules:**
- Demographics (2.2) must be supported by review demographics, stated service areas, or owner confirmation — not assumed from the industry
- The Internal Monologue (2.4) must use language that actually appears in the reviews and Reddit threads — not generic consumer psychology
- Private Browsing Patterns (2.5) must be grounded in confirmed acquisition channels and actual review language — not invented
- Objections (2.7) must be documented with the actual objection as stated or implied in reviews/forums, not a marketing-friendly summary
- Every objection in 2.7 must have a reframe — do not list problems without solutions

---

### Step 11 — Build Profile 3: Offer Extraction

Primary sources: Website copy, interview transcript.
Supporting sources: Reviews (for credibility signals and feature mentions), any additional documents provided.

Follow the exact structure in `context/icp_framework.md` sections 3.1 through 3.9.

**Critical rules:**
- Copy Ammunition (3.8): minimum 10 verbatim quotes, numbered, source labeled — never paraphrased
- The Mechanism (3.4) must explain HOW the offer works, not just what it promises
- The Cross-Skill Usage Guide (3.9) must be specific to this client — reference their actual sections and quote types, not generic instructions
- If pricing is unknown, mark it `[UNKNOWN — request from client]` rather than omitting the field

---

### Step 12 — Build Profile 4: Messaging & Positioning

Sources: All of the above — synthesize across Profiles 1–3 to produce actionable messaging frameworks.

Follow the exact structure in `context/icp_framework.md` sections 4.1 through 4.6.

**How to build each section:**
- **4.1 Core Problem Reframe:** Combine ICP's stated frustrations (from reviews/Reddit) with the offer's actual mechanism (3.4) to articulate what the customer is really buying
- **4.2 Marketing Angles:** List angles ranked by emotional resonance — cross-reference the strongest fear/desire language from reviews and Reddit with the client's strongest differentiators. Lead with the most emotionally loaded ones.
- **4.3 Objections & Reframes:** Pull from 2.7 — reformat as a table for direct use in ad briefs
- **4.4 Messaging Rules:** Synthesize from 1.9 (voice rules) and 2.10 (ICP communication rules) into copy-level directives for this specific market. These are rules about framing and structure, not just tone.
- **4.5 Trust-Building Proof Points:** Pull from 3.6 (credibility stack) and 3.8 (quotes) — rank by persuasive weight for this ICP specifically
- **4.6 Copy Angles:** Per offer or service, provide 3–5 specific positioning lines ready to use as headline concepts

---

### Step 13 — Build Profile 5: Marketing Channels & Content Strategy

Sources: 2.5 (browsing patterns), 2.6 (communities), client's current marketing context from overview.md, industry knowledge.

Follow the exact structure in `context/icp_framework.md` sections 5.1 through 5.3.

**How to build each section:**
- **5.1 Channels:** For each channel, base the "why it fits" on specific ICP behavior evidence from Profiles 2 and 4 — not generic channel descriptions
- **5.2 Content Pillars:** Ground each pillar in something the ICP demonstrably cares about — reference Reddit threads, review themes, or community mentions that confirm the pillar
- **5.3 Content Calendar:** One month, mapped to the content pillars. Practical and ready to execute.

---

### Step 14 — Build Profile 6: Customer Acquisition & Sales Process

Sources: Website (any stated process or booking flow), overview.md (service details, guarantees, financing), offer structure (3.2), ICP qualification signals (2.2 demographics).

Follow the exact structure in `context/icp_framework.md` sections 6.1 through 6.3.

**How to build each section:**
- **6.1 Lead Tiers:** Build from ICP demographics (2.2) — what profile is highest value, what is medium, and who to deprioritize based on fit
- **6.2 Sales Framework:** If the owner described their sales process in the interview, use that directly. If not, infer from the offer structure (guarantees, financing, process) and common patterns for the industry.
- **6.3 Sales Timeline:** Map the typical journey from lead to close. Be specific — use the offer's known timelines (e.g., install timeline, response guarantees) where available.

---

### Step 15 — Write the Analysis Pass

After all six profiles are written, complete the Analysis Pass:

- Assess source material volume, diversity, and recency
- Rate every section across all 6 profiles: HIGH / MEDIUM / LOW confidence with one-sentence justification
- List every gap explicitly — what's missing and how to get it
- Flag any contradictions between sources
- Write 3–5 specific recommended next steps

**This section is not optional.** A document without an Analysis Pass cannot be trusted.

---

## Phase 3: Quality Check

Before saving the final document, run through this checklist:

### Content Quality
- [ ] No fabricated quotes — every quote in 3.8 has a source label
- [ ] No AI vocabulary — check 1.4's never-use list against the document; remove any violations
- [ ] All voice rules in 1.9 are specific and actionable, not generic
- [ ] All objections in 2.7 and 4.3 have reframes (not just a list of problems)
- [ ] Internal Monologue (2.4) uses actual customer language from sources
- [ ] Cross-Skill Usage Guide (3.9) references specific section numbers from this document
- [ ] Marketing angles in 4.2 are ranked — most emotionally resonant first
- [ ] Channel recommendations in 5.1 explain *why* they fit this specific ICP, not just that the channel exists

### Structure Quality
- [ ] All section numbers present and in order (1.1–1.9, 2.1–2.10, 3.1–3.9, 4.1–4.6, 5.1–5.3, 6.1–6.3, Analysis Pass)
- [ ] Header includes date, client name, source materials list, and interview transcript status
- [ ] Analysis Pass is complete — no placeholder ratings
- [ ] Document header source list matches what was actually used

### Red Flag Check
- [ ] Any red flags raised during collection are documented in the Analysis Pass
- [ ] All LOW confidence sections are labeled inline, not just in the Analysis Pass
- [ ] If no transcript: "⚠️ INTERVIEW TRANSCRIPT NOT AVAILABLE" banner present at top of Profile 1
- [ ] Missing Transcript Gap block present in 1.9 (if no transcript)

---

## Phase 4: Delivery

### Step 16 — Save the Document

The document is written directly into `clients/{client-name}/icp.md` throughout synthesis. Confirm the file is complete and saved.

Also save a curated set of the strongest customer quotes (from reviews, Reddit, transcript) to: `clients/{client-name}/reviews.md`

Format for `reviews.md`:
```
# Curated Research Quotes — {Client Name}
Source: {source name and date}

## Client Reviews
- "Quote here" — Reviewer name, Star rating

## Competitor Reviews
- "Quote here" — Competitor name, Reviewer name

## Reddit
- "Quote here" — Subreddit, thread title
```

### Step 17 — Sync to Supabase

After saving the ICP document, sync the client data to Supabase so the Platform picks it up:

```bash
python tools/sync_client_to_supabase.py {client-slug}
```

This ensures the Platform's ICP view and export feature reflect the latest document.

### Step 18 — Confirm Delivery

Tell the user:
1. The document is saved at `clients/{client-name}/icp.md`
2. The overall confidence level (HIGH / MEDIUM / LOW — based on the lowest-scoring critical section)
3. A 3-sentence summary of what the document found (who the ICP is, top pain, top desire)
4. Any gaps that need to be filled before this document should be used for copy
5. Whether a Grill Them interview is still needed (and what specifically it would unlock)
6. The recommended next step (e.g., "Ready for ad copy workflow" or "Need competitor reviews before proceeding")
7. Remind the user: **"If you'd like a branded PDF export of this ICP, open the Research page in the Platform and click Export PDF. Your brand colors and logo will be applied automatically if set under Brand settings."**

---

## Edge Cases

| Situation | Action |
|---|---|
| No interview transcript | Use no-transcript protocol (see icp_framework.md). Build Profile 1 from digital footprint. Label all of Profile 1 MEDIUM/LOW confidence. Add Missing Transcript Gap block to 1.9. |
| Client is in a niche industry with no Reddit presence | Document the gap; use Quora, industry Facebook groups, HomeAdvisor/Angi reviews, or Nextdoor posts instead. |
| Competitor list is empty | Use `firecrawl-search` to find top 3 competitors in the client's industry + geography. Confirm with user before proceeding. |
| Firecrawl fails on Google reviews (rate limit or block) | Try `firecrawl-browser` with a slower/interactive mode. If still blocked, ask user to manually export reviews from their Google Business dashboard. |
| Client has reviews in multiple languages | Translate non-English reviews before analysis; note languages found in Analysis Pass. |
| Client is brand new with no reviews | Skip client review step; rely on competitor reviews and digital footprint; flag Profile 2 as MEDIUM confidence. |
| User provides a CSV or spreadsheet of reviews | Accept directly — paste into context and analyze as you would scraped reviews. Note source as "manually provided" in document header. |
| icp.md already has content | Always ask before overwriting. Offer: (a) overwrite, (b) save as icp_v2.md, (c) abort. |
| Research reveals a different ICP than what the client described | Document both in 2.1 — the client's stated ICP and the evidence-based ICP. Flag the discrepancy prominently in the Analysis Pass. Do not silently use only one. |
| X/Twitter returns no useful results | Note the gap; Twitter walls most content behind login. Move on — Reddit and Google reviews carry more weight for local service businesses. |
