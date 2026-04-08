# SEO Game Plan Workflow

## Objective
Synthesize all prior SEO module outputs into one unified execution document. This is the final client-facing deliverable — a complete SEO game plan that an agency VA or in-house team member can execute without any additional context. No new web scraping is done here — this workflow reads prior workflow outputs and synthesizes them into an actionable plan.

## Prerequisites
- **`seo_audit.md` must have been run** — it is the required base
- At least one other module (`seo_site_structure`, `seo_content_engine`, or `seo_gbp`) is recommended but not required — missing modules are flagged in the output, not blockers

## Required Inputs
- `target_service` — The primary service (must match the audit input)
- `target_location` — The geographic target (must match the audit input)

## Optional Inputs
- `output_scope` — Adjust the output scope: `full` (default) | `quick_wins_only` | `30_day_sprint`
- `include_va_task_breakdown` — Generate VA-ready task cards: `true` (default) | `false`
- `include_content_calendar` — Generate a 30-day content calendar: `true` (default) | `false`

---

## Phase 0: Load All Prior SEO Outputs

Read the following from `workflow_outputs` for this client, sorted by most recent:

1. `seo_audit` — Required. Stop if missing.
2. `seo_site_structure` — Load if exists
3. `seo_content_engine` — Load if exists
4. `seo_gbp` — Load if exists

**Module availability check:** Note which modules have been run and which haven't. Include this at the top of the output:

```
Modules used in this game plan:
✅ SEO Audit (run [date])
✅ Site Structure Generator (run [date])
⬜ SEO Content Engine — not yet run (content calendar will be limited)
✅ GBP Optimization (run [date])
```

If `output_scope: quick_wins_only`: Skip the 60-day schedule and content calendar. Only produce the health dashboard and priority fix list.

If `output_scope: 30_day_sprint`: Produce the full plan but limit the schedule to 30 days and the content calendar to 2 weeks.

---

## Phase 1: SEO Health Dashboard

One-page snapshot of the client's current SEO state across all dimensions. Pull data from the relevant module outputs.

| Category | Status | Top Issue | Priority Score (1–10) |
|----------|--------|-----------|----------------------|
| Technical SEO | 🔴 / 🟡 / 🟢 | [Specific issue from audit Technical Checklist] | |
| On-Page SEO | | [Specific issue from audit On-Page Audit table] | |
| Keyword Coverage | | [Specific gap from audit Keyword Research Output] | |
| Site Structure | | [Specific gap from site structure output, or "Module not run"] | |
| Google Business Profile | | [Specific gap from GBP output, or "Module not run"] | |
| Content | | [Specific gap from content engine output, or "Module not run"] | |
| Authority (E-E-A-T) | | [Specific finding from audit Authority Signals 1.5] | |

**Status legend:** 🔴 Needs immediate attention | 🟡 Improvement opportunity | 🟢 In good shape

**Overall SEO Health Score:** [Sum of priority scores / 70] × 100 = [N]%

---

## Phase 2: 80/20 Priority Fix List

The 10 highest-leverage actions across all modules, ordered by impact-to-effort ratio (highest impact per unit of effort first).

**Rules for every action:**
- State exactly what to do — not "optimize title tags" but "Change the page title of `/services/hvac/` from `HVAC Services` to `HVAC Installation in Denver, CO | [Company Name]`"
- Assign an owner: Owner/Operator | VA | Developer | Agency
- Estimate time: `< 1 hour` | `half day` | `full day` | `ongoing`
- Source: which module's finding justifies this action and why it matters

| # | Action | Owner | Time | Impact | Source |
|---|--------|-------|------|--------|--------|
| 1 | [Specific action] | | | Critical/High | [Module + finding] |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |
| 6 | | | | | |
| 7 | | | | | |
| 8 | | | | | |
| 9 | | | | | |
| 10 | | | | | |

---

## Phase 3: 60-Day Game Plan

Week-by-week execution schedule. Each week has a clear theme and specific tasks pulled from the priority fix list and module outputs.

*Skip or condense to 30 days if `output_scope: 30_day_sprint`.*

---

**WEEKS 1–2: Foundation**
*Theme: Fix the highest-impact technical and on-page issues. Get the primary service page performing.*

Week 1 tasks:
- [Technical fix 1 from audit — specific page and change]
- [Technical fix 2 from audit]
- [Primary service page title/meta update — specify old → new]
- [GBP primary category update — if GBP module was run]

Week 2 tasks:
- [Homepage internal linking fix — specify which links to add]
- [GBP description update — paste from GBP output]
- [GBP services section update — from GBP output]
- [Schema markup addition — specify which pages and types]

---

**WEEKS 3–4: Structure**
*Theme: Build the missing pages. Fix internal linking gaps.*

Week 3 tasks:
- [Create missing service page #1 — specify URL and target keyword from site structure output]
- [Create missing service page #2 (if applicable)]
- [Fix internal linking gap #1 — specify source page, destination page, anchor text]
- [Fix internal linking gap #2]

Week 4 tasks:
- [Create missing location page #1 — specify URL and target keyword]
- [Create missing location page #2 (if applicable)]
- [Fix remaining internal linking gaps]
- [Add location page to homepage navigation or service area section]

---

**WEEKS 5–6: Content Sprint**
*Theme: Publish new content to build topical authority and capture long-tail traffic.*

Week 5 tasks:
- [Publish blog post #1 — specify URL, topic, and target keyword from content engine output]
- [Publish location page #3 (if applicable)]
- [GBP post #1 live — from GBP output week 1 script]
- [GBP post #2 live — from GBP output week 2 script]

Week 6 tasks:
- [Publish blog post #2 — specify URL, topic, and target keyword]
- [Update existing service page with expanded content — specify which page and what to add]
- [GBP photo upload — minimum N new photos per GBP output recommendation]
- [GBP Q&A seeding — post N Q&A pairs from GBP output]

---

**WEEKS 7–8: GBP Velocity**
*Theme: Accelerate review generation. Maintain content momentum.*

Week 7 tasks:
- [Activate review generation system — distribute SMS/email templates from GBP output to team]
- [Train field technicians on verbal script from GBP output]
- [GBP post #3 live]
- [Publish blog post #3 or location page]

Week 8 tasks:
- [Review velocity check — have we hit the target reviews/week pace?]
- [GBP post #4 live]
- [Internal link audit — check new pages are properly linked from existing pages]
- [Confirm all new pages are indexed: submit to Google Search Console]

---

## Phase 4: Content Calendar *(if `include_content_calendar: true`)*

30-day content schedule. Pulled from the content engine output if available; otherwise built from the audit's Bucket C keywords.

| Week | Content Type | Target Keyword | Target URL | Owner | Status |
|------|-------------|---------------|-----------|-------|--------|
| Week 1 | GBP Post | [from GBP output] | N/A (GBP) | VA / Owner | To Do |
| Week 1 | Service Page Update | [from audit] | [URL] | Developer / VA | To Do |
| Week 2 | GBP Post | [from GBP output] | N/A (GBP) | VA / Owner | To Do |
| Week 2 | Location Page | [Bucket B keyword] | [URL] | Writer | To Do |
| Week 3 | Blog Post | [Bucket C keyword] | [URL] | Writer | To Do |
| Week 3 | GBP Post | [from GBP output] | N/A (GBP) | VA / Owner | To Do |
| Week 4 | Blog Post | [Bucket C keyword] | [URL] | Writer | To Do |
| Week 4 | GBP Post | [from GBP output] | N/A (GBP) | VA / Owner | To Do |

*Note: If `seo_content_engine` output exists, replace [Bucket C keyword] with the exact brief title from that output.*

---

## Phase 5: VA Task Breakdown *(if `include_va_task_breakdown: true`)*

For each of the top 10 priority actions and each week's key tasks, produce a task card. Format each task so that a VA with no SEO background can execute it completely using only the instructions provided.

**Task card format:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK: [Task title — specific and action-oriented]
TYPE: One-time / Weekly / Monthly
OWNER: VA / Owner / Developer
TIME: [Estimated hours or minutes]
PRIORITY: Critical / High / Medium

STEPS:
  1. [Specific step — include exact URLs, button names, field names where applicable]
  2. [Next step]
  3. [Next step]
  (Add as many steps as needed for full completion)

DONE WHEN:
  [Clear, observable criterion — e.g., "The page title in Google Search Console shows the new title" or "The GBP shows the updated description when searched on Google Maps"]

SOURCE: [Which module + which specific finding drove this task]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Produce a task card for every priority action and every week 1–2 task at minimum. Weeks 3–8 can be summarized in the schedule format.

---

## Phase 6: Quality Check

Before delivering:
- [ ] Every action in the priority list traces to a specific finding from a named module output
- [ ] No generic SEO advice — every recommendation is client-specific and references actual pages, keywords, or data points
- [ ] VA task cards are written at execution level — a person with no SEO background could complete each task using only the card
- [ ] Content calendar is populated only with keywords that exist in the keyword clusters or content engine output
- [ ] The 60-day schedule flows logically: technical before content, foundation before expansion
- [ ] Missing modules are flagged clearly but do not cause empty sections — use available data to fill gaps
- [ ] `output_scope` filter has been applied correctly

---

## Output Format
Save the completed output as a `workflow_output` of type `seo_game_plan`.

This is the deliverable to the client or VA. It should be formatted for direct use — no internal planning notes, no meta-commentary about what was done. Write it as if it's a document being handed to a team member on day one.
