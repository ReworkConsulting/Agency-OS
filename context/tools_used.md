# Rework Consulting — Tech Stack

## Overview

Every tool in this stack has a specific job. Nothing is redundant. When building workflows or tools, use what's already here before adding something new.

---

## GoHighLevel (GHL)

**What it is:** The central operating platform for client acquisition and lead management.

**What we use it for:**
- CRM — all leads and contacts for every client live here
- Automations — SMS and email nurture sequences run here
- Pipelines — lead stages tracked and managed here
- Calling — appointment setters call leads from GHL
- Landing page builder — client lead capture pages hosted here
- Appointment booking — scheduling flows and reminders
- Lead forms — Facebook lead forms route directly into GHL

**How it fits the system:** Every client gets their own GHL sub-account with Rework's snapshot deployed. The snapshot is the base — then customized per client. All leads from Facebook ads flow into GHL. Appointment setters live inside GHL.

**Access:** Rework manages GHL on behalf of clients. Clients get access to their own sub-account.

---

## Airtable

**What it is:** Rework's internal operating system and master log.

**What we use it for:**
- Master lead log — tracks every lead, appointment, and sale across all clients
- Task management — internal tasks and accountability for the team
- SOPs — standard operating procedures documented and linked here
- Client data — all client information, status, and notes centralized here
- Performance tracking — ad results, CPL, appointment rates, close rates

**How it fits the system:** Airtable is the source of truth for what's happening in the business. GHL handles the client-facing execution; Airtable handles the internal tracking and visibility.

---

## Google Docs / Google Drive

**What it is:** Document creation and file storage.

**What we use it for:**
- ICP research documents — hosted and shared here after generation
- Ad copy drafts and approvals
- Client-facing deliverables (reports, strategy docs)
- Shared asset storage (logos, brand files, etc.)

**How it fits the system:** Google Docs is where finished deliverables live so the whole team can access them. Local files in `clients/` are the working copy; Google Docs is the shareable, client-visible version.

---

## Frame.io

**What it is:** Video review and collaboration platform.

**What we use it for:**
- Video editors upload final and draft video cuts here
- Rework team leaves timestamped notes and revision requests
- Client-facing video review (where applicable)

**How it fits the system:** Frame.io is the handoff point between production and approval for all video content. Scripts are written locally → video is produced → uploaded to Frame.io for review.

---

## Make (formerly Integromat)

**What it is:** Automation platform for connecting tools and triggering workflows.

**What we use it for:**
- Connecting GHL to Airtable (syncing lead data)
- Triggering notifications when leads hit certain pipeline stages
- Automating data movement between tools
- Custom multi-step workflows that Zapier can't handle

**How it fits the system:** Make is the plumbing between tools. When GHL does something, Make can log it in Airtable, send a Slack alert, or trigger another action.

---

## Zapier

**What it is:** Simpler automation tool for standard integrations.

**What we use it for:**
- Quick, simple connections between two tools
- Integrations that don't need the complexity of Make

**How it fits the system:** Use Zapier for simple one-step automations. Use Make for anything multi-step or complex.

---

## Slack

**What it is:** Internal team communication.

**What we use it for:**
- Day-to-day team communication
- Client update notifications (piped in from Make/Zapier)
- File sharing and quick approvals
- Alerts (overdue tasks, new leads, etc.)

---

## Facebook Ads Manager

**What it is:** The platform where all Facebook and Instagram ad campaigns are managed.

**What we use it for:**
- Campaign creation and launch
- Ad set targeting and budget management
- Creative upload and testing
- Performance monitoring (CPL, CTR, opt-in rate, spend)
- Optimization decisions

**How it fits the system:** Rework manages Facebook Ads Manager on behalf of every client. All leads generated flow from Facebook → Landing Page or Lead Form → GHL.

---

---

## Google Search Console API

**What it is:** Google's Search Analytics API — provides real keyword ranking data (positions, impressions, clicks, CTR) directly from Google.

**What we use it for:**
- SEO audit keyword ranking status (replaces firecrawl-search proxy)
- Surfacing crawl errors, 404s, and index coverage issues

**Setup (per client):**
1. Create a service account in [Google Cloud Console](https://console.cloud.google.com) → IAM & Admin → Service Accounts
2. Enable the **Search Console API** on the project
3. Download the service account JSON key
4. Add the service account email as a **Restricted** user on the client's GSC property
5. Set `GOOGLE_SERVICE_ACCOUNT_JSON=path/to/key.json` in `.env`
6. Run: `python tools/fetch_gsc_data.py --client <slug> --property <gsc-url>`

**Output:** `clients/{slug}/gsc_data.md` — read automatically by `workflows/seo_audit.md` Phase 2.0.

**Cost:** Free (part of Google Cloud — service account has no usage fees).

---

## Google Business Profile API

**What it is:** The Business Profile Management API — provides structured GBP data (categories, services, description) directly from Google.

**What we use it for:**
- GBP audit (more accurate than scraping via firecrawl-browser)
- Pre-loading category, service, and description data before the GBP optimization workflow

**Setup (per client):**
1. Use the same service account as GSC, or create a new one
2. Enable the **Business Profile Management API** on the Google Cloud project
3. Add the service account to the client's GBP via the API or GBP Manager dashboard
4. Find the account ID and location ID (run `python tools/fetch_gbp_data.py --client <slug> --list-accounts`)
5. Run: `python tools/fetch_gbp_data.py --client <slug> --account-id <id> --location-id <id>`

**Output:** `clients/{slug}/gbp_data.md` — read automatically by `workflows/seo_gbp.md` Phase 1.

**Note:** Review count, photo count, and post recency require manual verification in GBP Manager — the Business Profile Performance API has limited service account access for those fields.

**Cost:** Free (Google API, no per-call fee for basic data).

---

## DataForSEO (Opt-in)

**What it is:** SERP data API — provides real keyword search volumes, competitor rank positions, and SERP feature detection.

**What we use it for:**
- Real search volume data for keyword clustering tables (Phase 2.5 of SEO audit)
- Competitor actual SERP positions (vs. proxy search)

**Setup:**
1. Register at [dataforseo.com](https://dataforseo.com) (free trial available)
2. Add to `.env`:
   ```
   DATAFORSEO_API_LOGIN=your_login
   DATAFORSEO_API_KEY=your_api_key
   ```
3. Run: `python tools/keyword_research.py --client <slug> --keywords "kw1,kw2,kw3" --location "City, State"`

**Output:** `clients/{slug}/keyword_data.md` — read automatically by `workflows/seo_audit.md` Phase 2.5.

**Cost:** ~$0.001 per SERP query. A full 30-keyword audit = ~$0.03. 10 clients × 4 audits/month ≈ $1.20/month.

---

## Tool Decision Guide

When building a new workflow or automation, use this to decide which tool handles what:

| Task | Tool |
|---|---|
| Lead comes in from a Facebook ad | GHL |
| Lead needs to be nurtured (SMS/email) | GHL |
| Lead needs to be called or booked | GHL |
| Track what happened with a lead | Airtable |
| Assign a task to a team member | Airtable |
| Move data between two tools automatically | Make or Zapier |
| Create or review a document | Google Docs |
| Review a video edit | Frame.io |
| Communicate with the team | Slack |
| Manage ad campaigns | Facebook Ads Manager |
