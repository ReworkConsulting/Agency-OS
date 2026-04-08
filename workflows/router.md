# Workflow: Router

## Objective

Identify the user's intent and route them to the correct workflow. This is the entry point for every request in the Agency OS. Never skip directly to execution — always confirm the route and required inputs with the user before proceeding.

---

## Step 1 — Read the Client Context (If Applicable)

If the request is about a specific client, read their folder before doing anything else:

1. Check if `clients/{client-name}/` exists
2. If yes, read `clients/{client-name}/overview.md` to load their profile
3. If `clients/{client-name}/icp.md` exists, note that research is already complete for this client

If no client folder exists yet, flag it: "I don't have a folder for [client name] yet. Do you want to set one up before we proceed?"

---

## Step 2 — Understand the Request

Read the user's message carefully. Look for:

- The **subject** — which client, product, or campaign this is about
- The **intent** — what they want to produce or accomplish
- The **deliverable** — ICP, ad copy, SEO audit, report, etc.

If the request is vague or could match more than one workflow, ask one clarifying question before routing.

---

## Step 3 — Match to a Workflow

Use the table below to find the correct workflow. Match on intent, not exact wording.

| If the user wants to... | Route to | Status | Requires |
|---|---|---|---|
| Set up a new client in the system | `workflows/onboard_client.md` | ✅ Built | — |
| Build the ICP research document — brand voice, ideal customer profile, offer extraction | `workflows/build_icp.md` | ✅ Built | Client onboarded |
| Write Facebook ad copy, hooks, headlines, primary text, CTAs, image prompts | `workflows/generate_ads.md` | ✅ Built | ICP complete |
| Write a video script for a Facebook or Instagram video ad (B2C or B2B) — includes hook variations, audience segmentation (in-market/needs-convinced), conditions-based messaging, and anti-AI quality gate | `workflows/generate_video_scripts.md` | ✅ Built | ICP complete |
| Run an SEO audit — technical signals, on-page, keyword clusters, competitor benchmarking | `workflows/seo_audit.md` | ✅ Built | ICP complete |
| Generate a site architecture — URL map, page hierarchy, internal linking plan | `workflows/seo_site_structure.md` | ✅ Built (Platform UI coming) | SEO Audit complete |
| Generate content briefs for service pages, location pages, or blog posts | `workflows/seo_content_engine.md` | ✅ Built (Platform UI coming) | SEO Audit complete |
| Audit and optimize Google Business Profile, generate post scripts and review templates | `workflows/seo_gbp.md` | ✅ Built (Platform UI coming) | SEO Audit complete |
| Synthesize all SEO outputs into a unified game plan with 60-day schedule and VA tasks | `workflows/seo_game_plan.md` | ✅ Built (Platform UI coming) | SEO Audit complete |
| Generate a client monthly performance report | `workflows/generate_report.md` | ✅ Built (Platform UI coming) | Client onboarded |
| Research a competitor — positioning, ads, reviews, strategy | `workflows/competitor_research.md` | 🔴 Not yet built | Client onboarded |
| Scrape a website or pull data from a URL | `workflows/scrape_website.md` | 🔴 Not yet built | — |
| Write content — blog post, email, SMS, social | `workflows/content_writer.md` | 🔴 Not yet built | ICP complete |

**Workflow dependency order:**
```
onboard_client → build_icp → generate_ads
                           → generate_video_scripts
                           → seo_audit → seo_site_structure → seo_game_plan
                                       → seo_content_engine → seo_game_plan
                                       → seo_gbp            → seo_game_plan
                           → generate_report
                           → content_writer (not yet built)
```

Never run a downstream workflow if its prerequisite hasn't been completed for this client. If the ICP doesn't exist yet, route to `build_icp.md` first.

**If the user says "run the full SEO system":** Confirm the run order before starting: SEO Audit → Site Structure → Content Engine + GBP (can run in parallel) → Game Plan last (it reads all prior outputs). Always confirm `target_service` and `target_location` before beginning.

**If a workflow is marked 🔴:** Tell the user it hasn't been built yet. Describe what it would do and ask if they want to build it now or proceed another way.

---

## Step 4 — Confirm the Route

Before executing anything, confirm with the user:

1. Which workflow you're about to run
2. What it will produce
3. What inputs you'll need from them

**Example (onboarding):**
> "To onboard [client name], paste the intake template filled out with whatever you have. You can find the template in `context/intake_template.md` — copy it, fill in what you know, and paste it here. I'll check for gaps and ask before building the files."

**Example (ICP):**
> "This is an ICP build for [client name]. I'll run `build_icp.md` — it produces a six-profile research document covering brand voice, ideal customer profile, offer extraction, messaging & positioning, marketing channels, and sales process. The owner interview transcript is strongly recommended but not required — if it's missing I'll build Profile 1 from the digital footprint. Before I start I need: the website URL and the Google Business Profile link for the client. Do you have competitors identified, or should I find them during research?"

Wait for the user to confirm and provide missing inputs before moving to Step 5.

---

## Step 5 — Run the Pre-Flight Check

Before executing the workflow, verify:

- All required inputs for that workflow are present (see the workflow's Pre-Flight Checklist)
- The client folder exists or will be created
- No conflicting files exist (e.g., an existing `icp.md` that could be overwritten)

If any required input is missing, stop and ask. Do not start and then fail partway through.

---

## Step 6 — Execute the Workflow

Open the matched workflow file and follow it from Step 1. Do not skip steps. Do not improvise around missing inputs — surface them before starting.

---

## Edge Cases

| Situation | Action |
|---|---|
| Request matches multiple workflows | List the options clearly and ask which to run first |
| Workflow is not yet built | Tell the user, describe what the workflow would do, ask if they want to build it |
| User names a specific workflow directly | Skip matching, go to Step 4 to confirm inputs |
| Request is unclear | Ask one focused clarifying question — do not guess |
| Client folder doesn't exist | Offer to create it before running the workflow |
| Request is an ops/internal task (not client work) | Handle directly if straightforward; flag if it requires a workflow that isn't built |

---

## Routing Principles

1. **Client context first.** Always check the client folder before routing. What's already built for this client changes what needs to happen next.
2. **Confirm before executing.** A 30-second confirmation prevents wasted research runs and overwritten files.
3. **Surface missing inputs early.** A workflow that starts without its required inputs will produce a low-confidence output or fail mid-run. Pre-flight checks exist for this reason.
4. **Flag what's missing.** If a workflow doesn't exist yet, say so clearly. Don't attempt to improvise the workflow from memory.
