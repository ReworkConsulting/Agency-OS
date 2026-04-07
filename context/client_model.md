# Client Model — Structure & Intake

## What a Client Is

A client at Rework is an active engagement — a business we are currently building, managing, and scaling. Each client gets their own folder inside `clients/` that holds everything we know about them and everything we produce for them.

---

## Client Folder Structure

```
clients/
  {client-name}/
    overview.md              ← Completed intake profile (all fields below, filled in)
    services.md              ← Full service list, pricing, service area, financing details
    competitors.md           ← Known and researched competitor list
    reviews_raw.md           ← Raw scraped review text (intermediate data, created during ICP build)
    reviews.md               ← Curated key quotes from reviews that inform the ICP
    icp.md                   ← The full six-profile ICP research document
    interview_transcript.txt ← Owner interview transcript (if provided via Grill Them)
```

**Naming convention:** lowercase, hyphens for spaces. Examples:
- `clients/acme-hvac/`
- `clients/green-solar/`
- `clients/smith-roofing/`

**Rules:**
- `overview.md` is filled out at onboarding and kept updated as the engagement evolves
- `services.md` and `competitors.md` are created at onboarding from the intake form
- `reviews_raw.md` holds raw scraped review data — created automatically during the ICP build workflow
- `reviews.md` holds curated quotes only — extracted from `reviews_raw.md` during ICP synthesis
- `icp.md` is the master research document — the most important file in the client folder. It contains six profiles: Brand Voice, Ideal Customer Profile, Offer Extraction, Messaging & Positioning, Marketing Channels, and Customer Acquisition & Sales Process.
- Never store API keys, credentials, or unrelated data dumps here
- If regenerating a deliverable, save as `icp_v2.md` rather than overwriting — ask first

---

## Client Intake Fields — `overview.md` Template

Every `overview.md` must contain all of the following fields. Blank fields should be marked `TBD` — never omit them.

### Business Information
- **Business Name:**
- **Owner / Primary Contact:**
- **Email:**
- **Phone:**
- **Address:**
- **Time Zone:**
- **Website:**
- **Google Business Profile Link:**
- **EIN:**
- **Company Type:** (LLC, S-Corp, Sole Prop, etc.)

### Service Details
- **Primary Service / Main Focus:** (What do they want to market first?)
- **Full List of Services Offered:**
- **Service Area / Target Geography:**
- **Do They Offer Financing?:** (Yes / No / Details)
- **Average Job Value:** ($)

### Marketing Context
- **Starting Ad Spend:** ($)
- **Biggest Marketing Challenge:**
- **List of Competitors:**
- **Ideal Client Description:** (Their words — who is their perfect customer?)
- **Main Goal (6–12 Months):**

### Partnership Context
- **How They Heard About Rework:**
- **Why They Wanted to Work With Rework:**
- **What They Value in a Partnership:**
- **Why They Hired Rework Specifically:**

### Assets
- **Logo:** (Link or file path)
- **Facebook Ad Account ID:**
- **GHL Sub-Account:**
- **Availability / Preferred Communication:**

---

## How to Create a New Client

1. Create folder: `clients/{client-name}/`
2. Create `overview.md` using the template above — fill in all fields from the onboarding call
3. Create `services.md`, `competitors.md`, and empty `icp.md` as placeholders
4. Run `python tools/sync_client_to_supabase.py <slug>` to push to Supabase so the Platform can see the client
5. Run the ICP research workflow (`build_icp.md`) to populate `reviews_raw.md`, `reviews.md`, and `icp.md`

The `overview.md` is completed at onboarding. The `icp.md` is the output of a full research process — it is not filled in manually.
