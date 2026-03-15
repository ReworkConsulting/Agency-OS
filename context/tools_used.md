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
