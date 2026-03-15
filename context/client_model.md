# Client Model — Structure & Intake

## What a Client Is

A client at Rework is an active engagement — a business we are currently building, managing, and scaling. Each client gets their own folder inside `clients/` that holds everything we know about them and everything we produce for them.

---

## Client Folder Structure

```
clients/
  {client-name}/
    overview.md     ← Completed intake profile (all fields below, filled in)
    reviews.md      ← Curated key quotes from reviews that inform the ICP
    icp.md          ← The full three-profile ICP research document
```

**Naming convention:** lowercase, hyphens for spaces. Examples:
- `clients/acme-hvac/`
- `clients/green-solar/`
- `clients/smith-roofing/`

**Rules:**
- `overview.md` is filled out at onboarding and kept updated as the engagement evolves
- `reviews.md` holds curated quotes only — raw scraped data stays in `.tmp/` during processing
- `icp.md` is the master research document — the most important file in the client folder
- Never store API keys, credentials, or raw data dumps here
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
3. Create empty `reviews.md` and `icp.md` files as placeholders
4. Run the ICP research workflow to populate `reviews.md` and `icp.md`

The `overview.md` is completed at onboarding. The `icp.md` is the output of a full research process — it is not filled in manually.
